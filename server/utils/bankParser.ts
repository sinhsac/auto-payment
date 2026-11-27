import crypto from 'node:crypto'

export interface BankWebhookRawPayload {
  // Fields from auto-payment-android XInfo.kt
  groupKey?: string
  postTime?: string
  strPostTime?: string
  title?: string
  msg?: string
  pck?: string

  // Optional fields pre-extracted by auto-payment-android or generic webhooks
  orderCode?: string
  amount?: number | string
  content?: string
  description?: string
  transactionId?: string
  bank?: string
}

export interface ParsedBankTransfer {
  isCredit: boolean
  amount: number | null
  orderCode: string | null
  bankName: string
  packageName: string
  rawMessage: string
  transactionFingerprint: string
  receivedAt: string
  reason?: string
}

const KNOWN_BANK_PACKAGES: Record<string, string> = {
  'com.VCB': 'Vietcombank',
  'com.vcb.mobile': 'Vietcombank',
  'vn.com.techcombank.bb.app': 'Techcombank',
  'com.mbmobile': 'MBBank',
  'com.vnpay.vpbankonline': 'VPBank',
  'com.vnpay.bidv': 'BIDV',
  'mobile.acb.com.vn': 'ACB',
  'com.tpb.mb.gprsandroid': 'TPBank',
  'com.vietinbank.ipay': 'VietinBank',
  'com.sacombank.ewallet': 'Sacombank',
  'io.lifestyle.plus': 'Timo',
  'com.mservice.momotransfer': 'MoMo',
  'vn.com.vng.zalopay': 'ZaloPay',
}

function detectBankName(payload: BankWebhookRawPayload, combinedText: string): string {
  if (payload.bank && payload.bank.trim()) {
    return payload.bank.trim()
  }
  if (payload.pck && KNOWN_BANK_PACKAGES[payload.pck]) {
    return KNOWN_BANK_PACKAGES[payload.pck]
  }
  const lower = combinedText.toLowerCase()
  for (const name of ['Vietcombank', 'Techcombank', 'MBBank', 'VPBank', 'BIDV', 'ACB', 'TPBank', 'VietinBank', 'Sacombank', 'Timo', 'MoMo', 'ZaloPay']) {
    if (lower.includes(name.toLowerCase())) {
      return name
    }
  }
  if (payload.pck) {
    return payload.pck
  }
  return payload.title?.trim() || 'Bank Transfer'
}

/**
 * Parses a Vietnamese currency amount string like "150,000" or "1.250.000" into integer VND.
 */
function parseVndNumber(raw: string): number | null {
  const digits = raw.replace(/[.,_\s]/g, '')
  if (!/^\d+$/.test(digits)) {
    return null
  }
  const value = Number.parseInt(digits, 10)
  return Number.isFinite(value) && value > 0 ? value : null
}

/**
 * Extracts credit amount from Vietnamese bank notifications while rejecting outgoing debits.
 */
function extractCreditAmount(text: string): { isCredit: boolean; amount: number | null; reason?: string } {
  // Explicit signed amount like "+150,000 VND", "+ 250.000VND", "-150,000 VND", "GD: -50,000đ"
  const signedMatch = text.match(/([+-])\s*(\d{1,3}(?:[.,]\d{3})+|\d{4,12})\s*(?:vnd|vnđ|đ|d\b)?/i)
  if (signedMatch) {
    const sign = signedMatch[1]
    const amount = parseVndNumber(signedMatch[2])
    if (sign === '-') {
      return { isCredit: false, amount, reason: 'Outgoing debit transaction ignored' }
    }
    return { isCredit: true, amount }
  }

  // Keywords indicating outgoing debit without a leading minus sign
  if (/(?:bi\s+tru|bị\s+trừ|thanh\s+toan\s+thanh\s+cong|chi\s+tieu|rút\s+tiền|rut\s+tien|chuyen\s+di|chuyển\s+đi)/i.test(text)) {
    return { isCredit: false, amount: null, reason: 'Outgoing debit keyword detected' }
  }

  // Incoming credit keywords followed by amount (e.g., "nhan duoc 150,000 VND", "ghi co 200.000d", "cong 500,000 VND")
  const creditKeywordMatch = text.match(
    /(?:nhận\s+được|nhan\s+duoc|ghi\s+có|ghi\s+co|biến\s+động|bien\s+dong|cộng|cong|số\s+tiền|so\s+tien|received|credited)\D{0,15}(\d{1,3}(?:[.,]\d{3})+|\d{4,12})\s*(?:vnd|vnđ|đ|d\b)?/i
  )
  if (creditKeywordMatch) {
    return { isCredit: true, amount: parseVndNumber(creditKeywordMatch[1]) }
  }

  return { isCredit: false, amount: null, reason: 'No credit amount detected in notification' }
}

/**
 * Extracts an order reference code such as "AP849201" (configurable prefix).
 */
export function extractOrderCode(text: string, orderPrefix = 'AP'): string | null {
  const safePrefix = orderPrefix.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'AP'
  const regex = new RegExp(`\\b(${safePrefix}[-_ ]?\\d{6})\\b`, 'i')
  const match = text.match(regex)
  if (!match) {
    return null
  }
  return match[1].replace(/[-_ ]/g, '').toUpperCase()
}

export function parseBankNotification(
  payload: BankWebhookRawPayload,
  orderPrefix = 'AP'
): ParsedBankTransfer {
  const title = (payload.title || '').trim()
  const body = (payload.msg || payload.content || payload.description || '').trim()
  const combined = [title, body].filter(Boolean).join(' | ')
  const bankName = detectBankName(payload, combined)
  const receivedAt = payload.strPostTime || payload.postTime || new Date().toISOString()

  let isCredit = false
  let amount: number | null = null
  let reason: string | undefined

  if (payload.amount !== undefined && payload.amount !== null && payload.amount !== '') {
    const num = typeof payload.amount === 'number'
      ? Math.round(payload.amount)
      : parseVndNumber(String(payload.amount))
    if (num !== null && num > 0) {
      isCredit = true
      amount = num
    } else {
      reason = 'Invalid explicit amount'
    }
  } else {
    const parsed = extractCreditAmount(body || combined)
    isCredit = parsed.isCredit
    amount = parsed.amount
    reason = parsed.reason
  }

  const orderCodeFromText = extractOrderCode(combined, orderPrefix)
  const preExtractedCode = payload.orderCode
    ? extractOrderCode(String(payload.orderCode), orderPrefix) || String(payload.orderCode).trim().toUpperCase()
    : null
  const orderCode = orderCodeFromText || preExtractedCode

  // Stable fingerprint for idempotent deduplication across Android WorkManager retries
  const fpSource = payload.transactionId
    ? `tx:${payload.transactionId}`
    : `${payload.pck || bankName}|${payload.strPostTime || payload.postTime || ''}|${payload.groupKey || ''}|${body}`
  const transactionFingerprint = crypto.createHash('sha256').update(fpSource).digest('hex').slice(0, 24)

  return {
    isCredit,
    amount,
    orderCode,
    bankName,
    packageName: payload.pck || '',
    rawMessage: combined,
    transactionFingerprint,
    receivedAt,
    reason,
  }
}
