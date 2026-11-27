import QRCode from 'qrcode'

export interface BankQrInput {
  bankBin: string
  accountNo: string
  amount: number
  purpose: string
  isDynamic?: boolean
}

function tlv(tag: string, value: string): string {
  const len = Buffer.byteLength(value, 'utf8').toString().padStart(2, '0')
  return `${tag}${len}${value}`
}

/**
 * Computes CRC-16/CCITT-FALSE (polynomial 0x1021, initial value 0xFFFF)
 * as required by EMVCo Tag 63.
 */
export function computeCrc16Ccitt(payload: string): string {
  let crc = 0xffff
  const bytes = Buffer.from(payload, 'utf8')

  for (const byte of bytes) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Strips accents and non-ASCII characters for safe EMVCo Tag 62 transfer descriptions.
 */
export function sanitizePurpose(purpose: string): string {
  return purpose
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9 \-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50)
}

/**
 * Builds an offline EMVCo / NAPAS 247 bank transfer QR string scannable by Vietnamese banking apps.
 * Generated 100% locally with zero external API calls.
 */
export function buildBankQrPayload(input: BankQrInput): string {
  const cleanBin = input.bankBin.replace(/\D/g, '')
  const cleanAccount = input.accountNo.replace(/\s+/g, '')
  if (!cleanBin || !cleanAccount) {
    throw new Error('bankBin and accountNo are required to build a bank transfer QR payload')
  }

  const amountInt = Math.max(0, Math.round(input.amount))
  const cleanPurpose = sanitizePurpose(input.purpose)

  // Tag 38: Merchant Account Information (NAPAS 247 IBFT)
  // 00: NAPAS GUID ("A000000727")
  // 01: Acquirer BIN (00) + Beneficiary Account Number (01)
  // 02: Service Code ("QRIBFTTA" = transfer to bank account)
  const beneficiaryInfo = tlv('00', cleanBin) + tlv('01', cleanAccount)
  const napasField = tlv('00', 'A000000727') + tlv('01', beneficiaryInfo) + tlv('02', 'QRIBFTTA')

  const parts = [
    tlv('00', '01'), // Payload Format Indicator
    tlv('01', input.isDynamic === false ? '11' : '12'), // 12 = Dynamic QR, 11 = Static QR
    tlv('38', napasField),
    tlv('53', '704'), // Transaction Currency: 704 = VND
  ]

  if (amountInt > 0) {
    parts.push(tlv('54', String(amountInt)))
  }

  parts.push(tlv('58', 'VN')) // Country Code

  if (cleanPurpose) {
    parts.push(tlv('62', tlv('08', cleanPurpose)))
  }

  const bodyWithCrcPrefix = parts.join('') + '6304'
  const crc = computeCrc16Ccitt(bodyWithCrcPrefix)
  return bodyWithCrcPrefix + crc
}

export async function generateBankQrDataUrl(input: BankQrInput): Promise<{
  payload: string
  dataUrl: string
}> {
  const payload = buildBankQrPayload(input)
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  })
  return { payload, dataUrl }
}
