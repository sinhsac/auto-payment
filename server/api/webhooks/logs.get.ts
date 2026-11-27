import { getOrderStore } from '~/server/utils/orderStore'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const limit = Math.min(500, Math.max(1, Number.parseInt(String(query.limit || '100'), 10) || 100))
  const store = getOrderStore(String(config.dataDir || 'data'))

  return {
    logs: store.listWebhookLogs(limit),
  }
})
