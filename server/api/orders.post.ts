import { getOrderStore, type PaymentMethod } from '~/server/utils/orderStore'
import { generateVietQrDataUrl } from '~/server/utils/vietqr'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)

  const customer = body?.customer || {}
  const items = Array.isArray(body?.items) ? body.items : []
  const rawMethod = String(body?.paymentMethod || 'qr').toLowerCase()
  const paymentMethod: PaymentMethod =
    rawMethod === 'cod' ? 'cod' : rawMethod === 'ck' || rawMethod === 'bank_transfer' ? 'bank_transfer' : 'qr'

  if (!customer.userName?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide full name, phone number, and shipping address.',
    })
  }

  if (items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Shopping cart is empty.',
    })
  }

  const store = getOrderStore(String(config.dataDir || 'data'))
  const orderCode = store.generateUniqueOrderCode(String(config.orderPrefix || 'AP'))

  // Compute authoritative total from sanitized items
  const totalAmount = items.reduce(
    (sum: number, item: any) => sum + Math.round(Number(item.price || 0)) * Math.max(1, Math.round(Number(item.qty || 1))),
    0
  )

  let bankInfo = undefined
  if (paymentMethod !== 'cod') {
    const bankBin = String(config.bankBin || '970436')
    const bankName = String(config.bankName || 'Vietcombank')
    const accountNo = String(config.bankAccountNo || '0123456789')
    const accountName = String(config.bankAccountName || 'AUTO PAYMENT DEMO')
    const transferContent = `${orderCode}`

    const { payload, dataUrl } = await generateVietQrDataUrl({
      bankBin,
      accountNo,
      amount: totalAmount,
      purpose: transferContent,
      isDynamic: true,
    })

    bankInfo = {
      bankBin,
      bankName,
      accountNo,
      accountName,
      transferContent,
      qrPayload: payload,
      qrDataUrl: dataUrl,
    }
  }

  const order = store.createOrder({
    orderCode,
    paymentMethod,
    customer: {
      userName: String(customer.userName),
      address: String(customer.address),
      phone: String(customer.phone),
      email: String(customer.email || ''),
      note: String(customer.note || ''),
    },
    items,
    expiryMinutes: Number(config.orderExpiryMinutes || 15),
    bankInfo,
  })

  return { order }
})
