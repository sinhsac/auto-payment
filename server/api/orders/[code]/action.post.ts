import { getOrderStore } from '~/server/utils/orderStore'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Missing order code' })
  }

  const body = await readBody(event)
  const action = String(body?.action || '')
  const store = getOrderStore(String(config.dataDir || 'data'))

  if (action === 'cancel') {
    const order = store.cancelOrder(code)
    if (!order) {
      throw createError({ statusCode: 404, statusMessage: `Order ${code} not found` })
    }
    return { order }
  }

  if (action === 'mark_paid') {
    const order = store.markPaidManually(code, body?.note ? String(body.note) : undefined)
    if (!order) {
      throw createError({ statusCode: 404, statusMessage: `Order ${code} not found` })
    }
    return { order }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid action. Supported: cancel, mark_paid' })
})
