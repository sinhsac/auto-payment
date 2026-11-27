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

  if (action === 'mark_paid' || action === 'confirm_by_staff') {
    const staffName = body?.staffName ? String(body.staffName) : 'Nhân viên'
    const note = body?.note ? String(body.note) : 'Xác nhận thủ công bởi nhân viên'
    const order = store.markPaidManually(code, note, staffName)
    if (!order) {
      throw createError({ statusCode: 404, statusMessage: `Order ${code} not found` })
    }
    return { order }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid action. Supported: cancel, confirm_by_staff, mark_paid' })
})
