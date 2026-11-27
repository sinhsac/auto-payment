import crypto from 'node:crypto'
import { parseBankNotification, type BankWebhookRawPayload } from '~/server/utils/bankParser'
import { getOrderStore } from '~/server/utils/orderStore'

function verifySecret(expected: string, provided: string): boolean {
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(provided, 'utf8')
  if (a.length !== b.length) {
    return false
  }
  return crypto.timingSafeEqual(a, b)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const configuredSecret = String(config.webhookSecret || '').trim()

  if (configuredSecret) {
    const headerSecret = getHeader(event, 'x-webhook-secret') || ''
    const authHeader = getHeader(event, 'authorization') || ''
    const bearerSecret = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : ''
    const provided = headerSecret || bearerSecret

    if (!provided || !verifySecret(configuredSecret, provided)) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
    }
  }

  const payload = (await readBody(event)) as BankWebhookRawPayload
  if (!payload || typeof payload !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON webhook payload' })
  }

  const parsed = parseBankNotification(payload, String(config.orderPrefix || 'AP'))
  const store = getOrderStore(String(config.dataDir || 'data'))
  const { log, order } = store.processBankTransfer(parsed)

  return {
    ok: true,
    outcome: log.outcome,
    detail: log.detail,
    orderCode: order?.orderCode ?? parsed.orderCode,
    orderStatus: order?.status ?? null,
    paidAmount: order?.paidAmount ?? null,
    totalAmount: order?.totalAmount ?? null,
    log,
  }
})
