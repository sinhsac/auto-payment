import { getOrderStore } from '~/server/utils/orderStore'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Missing order code' })
  }

  const store = getOrderStore(String(config.dataDir || 'data'))
  const initial = store.getOrder(code)
  if (!initial) {
    throw createError({ statusCode: 404, statusMessage: `Order ${code} not found` })
  }

  setResponseHeader(event, 'Content-Type', 'text/event-stream; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setResponseHeader(event, 'Connection', 'keep-alive')
  setResponseHeader(event, 'X-Accel-Buffering', 'no')

  const res = event.node.res
  res.flushHeaders?.()

  const writeEvent = (eventName: string, payload: unknown) => {
    if (!res.writableEnded) {
      res.write(`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`)
    }
  }

  // Push immediate snapshot
  writeEvent('order', initial)

  const unsubscribe = store.subscribeOrder(initial.orderCode, (updated) => {
    writeEvent('order', updated)
  })

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(': heartbeat\n\n')
    }
  }, 15_000)

  const cleanup = () => {
    clearInterval(heartbeat)
    unsubscribe()
  }

  event.node.req.on('close', cleanup)
  event.node.req.on('end', cleanup)

  // Keep stream open until client disconnects
  return new Promise<void>((resolve) => {
    event.node.req.on('close', () => resolve())
  })
})
