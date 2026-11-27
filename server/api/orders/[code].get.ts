import { getOrderStore } from '~/server/utils/orderStore'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Missing order code' })
  }

  const store = getOrderStore(String(config.dataDir || 'data'))
  const order = store.getOrder(code)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: `Order ${code} not found` })
  }

  return { order }
})
