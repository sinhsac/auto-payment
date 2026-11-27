import { getOrderStore } from '~/server/utils/orderStore'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const store = getOrderStore(String(config.dataDir || 'data'))

  const orders = store.listOrders({
    status: query.status ? String(query.status) : undefined,
    q: query.q ? String(query.q) : undefined,
  })

  return {
    stats: store.getStats(),
    orders,
  }
})
