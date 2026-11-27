export default defineEventHandler(() => {
  return {
    ok: true,
    service: 'auto-payment',
    brand: 'Hỗ trợ giải pháp số',
    timestamp: new Date().toISOString(),
  }
})
