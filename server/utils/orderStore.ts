import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { EventEmitter } from 'node:events'
import type { ParsedBankTransfer } from './bankParser'

export type PaymentMethod = 'qr' | 'bank_transfer' | 'cod'
export type OrderStatus = 'PENDING' | 'PAID' | 'UNDERPAID' | 'CONFIRMED_COD' | 'EXPIRED' | 'CANCELLED'

export interface OrderItem {
  id: string | number
  title: string
  price: number // VND integer
  qty: number
  image?: string
}

export interface CustomerInfo {
  userName: string
  address: string
  phone: string
  email: string
  note?: string
}

export interface PaymentRecord {
  fingerprint: string
  amount: number
  bankName: string
  rawMessage: string
  receivedAt: string
  source?: 'WEBHOOK' | 'STAFF'
  confirmedBy?: string
}

export interface StaffConfirmationInfo {
  staffName: string
  note: string
  confirmedAt: string
}

export interface OrderRecord {
  orderCode: string
  paymentMethod: PaymentMethod
  status: OrderStatus
  paymentSource: 'WEBHOOK' | 'STAFF' | 'COD' | null
  confirmedByStaff?: StaffConfirmationInfo | null
  customer: CustomerInfo
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  totalAmount: number
  paidAmount: number
  bankInfo?: {
    bankBin: string
    bankName: string
    accountNo: string
    accountName: string
    transferContent: string
    qrPayload: string
    qrDataUrl: string
  }
  payments: PaymentRecord[]
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  paidAt: string | null
}

export interface WebhookLogRecord {
  id: string
  receivedAt: string
  bankName: string
  packageName: string
  isCredit: boolean
  amount: number | null
  orderCode: string | null
  fingerprint: string
  rawMessage: string
  outcome: 'MATCHED_PAID' | 'MATCHED_UNDERPAID' | 'DUPLICATE_IGNORED' | 'DEBIT_IGNORED' | 'UNMATCHED' | 'ALREADY_PAID'
  detail: string
}

interface PersistedData {
  orders: OrderRecord[]
  webhookLogs: WebhookLogRecord[]
}

export interface OrderStoreOptions {
  dataDir: string
}

export class OrderStore {
  private readonly filePath: string
  private readonly events = new EventEmitter()
  private state: PersistedData

  constructor(options: OrderStoreOptions) {
    const resolvedDir = path.resolve(options.dataDir)
    fs.mkdirSync(resolvedDir, { recursive: true })
    this.filePath = path.join(resolvedDir, 'store.json')
    this.events.setMaxListeners(200)
    this.state = this.loadFromDisk()
  }

  private loadFromDisk(): PersistedData {
    try {
      if (fs.existsSync(this.filePath)) {
        const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf8'))
        return {
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          webhookLogs: Array.isArray(parsed.webhookLogs) ? parsed.webhookLogs : [],
        }
      }
    } catch {
      // Fallback to fresh store if file is unreadable
    }
    return { orders: [], webhookLogs: [] }
  }

  private saveToDisk(): void {
    const tmpPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`
    fs.writeFileSync(tmpPath, JSON.stringify(this.state, null, 2), 'utf8')
    fs.renameSync(tmpPath, this.filePath)
  }

  public generateUniqueOrderCode(prefix = 'AP'): string {
    const safePrefix = prefix.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'AP'
    for (let attempt = 0; attempt < 20; attempt++) {
      const num = crypto.randomInt(100000, 999999)
      const code = `${safePrefix}${num}`
      if (!this.state.orders.some((o) => o.orderCode === code)) {
        return code
      }
    }
    return `${safePrefix}${Date.now().toString().slice(-6)}`
  }

  public createOrder(input: {
    orderCode: string
    paymentMethod: PaymentMethod
    customer: CustomerInfo
    items: OrderItem[]
    expiryMinutes: number
    bankInfo?: OrderRecord['bankInfo']
  }): OrderRecord {
    const sanitizedItems = input.items
      .filter((i) => i && Number(i.qty) > 0 && Number(i.price) >= 0)
      .map((i) => ({
        id: i.id,
        title: String(i.title || 'Product').trim(),
        price: Math.round(Number(i.price)),
        qty: Math.max(1, Math.round(Number(i.qty))),
        image: i.image,
      }))

    if (sanitizedItems.length === 0) {
      throw new Error('Order must include at least one valid item')
    }

    const subtotal = sanitizedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const shippingFee = 0
    const totalAmount = subtotal + shippingFee
    const now = new Date()
    const isCod = input.paymentMethod === 'cod'

    const record: OrderRecord = {
      orderCode: input.orderCode.toUpperCase(),
      paymentMethod: input.paymentMethod,
      status: isCod ? 'CONFIRMED_COD' : 'PENDING',
      paymentSource: isCod ? 'COD' : null,
      confirmedByStaff: null,
      customer: {
        userName: input.customer.userName.trim(),
        address: input.customer.address.trim(),
        phone: input.customer.phone.trim(),
        email: input.customer.email.trim(),
        note: input.customer.note?.trim() || '',
      },
      items: sanitizedItems,
      subtotal,
      shippingFee,
      totalAmount,
      paidAmount: 0,
      bankInfo: input.bankInfo,
      payments: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: isCod ? null : new Date(now.getTime() + Math.max(1, input.expiryMinutes) * 60_000).toISOString(),
      paidAt: null,
    }

    this.state.orders.unshift(record)
    this.saveToDisk()
    return record
  }

  private refreshExpiry(order: OrderRecord): boolean {
    if (order.status === 'PENDING' && order.expiresAt && Date.now() > Date.parse(order.expiresAt)) {
      order.status = 'EXPIRED'
      order.updatedAt = new Date().toISOString()
      return true
    }
    return false
  }

  public getOrder(orderCode: string): OrderRecord | null {
    const code = orderCode.trim().toUpperCase()
    const order = this.state.orders.find((o) => o.orderCode === code)
    if (!order) {
      return null
    }
    if (this.refreshExpiry(order)) {
      this.saveToDisk()
      this.emitOrderUpdate(order)
    }
    return order
  }

  public listOrders(filter?: { status?: string; q?: string }): OrderRecord[] {
    let dirty = false
    for (const order of this.state.orders) {
      if (this.refreshExpiry(order)) {
        dirty = true
      }
    }
    if (dirty) {
      this.saveToDisk()
    }

    let list = this.state.orders
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((o) => o.status === filter.status)
    }
    if (filter?.q && filter.q.trim()) {
      const needle = filter.q.trim().toLowerCase()
      list = list.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(needle) ||
          o.customer.userName.toLowerCase().includes(needle) ||
          o.customer.phone.toLowerCase().includes(needle) ||
          o.customer.email.toLowerCase().includes(needle)
      )
    }
    return list
  }

  public getStats() {
    const all = this.listOrders()
    return {
      totalOrders: all.length,
      paidOrders: all.filter((o) => o.status === 'PAID').length,
      staffConfirmedOrders: all.filter((o) => o.status === 'PAID' && o.paymentSource === 'STAFF').length,
      pendingOrders: all.filter((o) => o.status === 'PENDING' || o.status === 'UNDERPAID').length,
      codOrders: all.filter((o) => o.status === 'CONFIRMED_COD').length,
      totalRevenuePaid: all.filter((o) => o.status === 'PAID').reduce((s, o) => s + o.paidAmount, 0),
      totalWebhooks: this.state.webhookLogs.length,
    }
  }

  public cancelOrder(orderCode: string): OrderRecord | null {
    const order = this.getOrder(orderCode)
    if (!order) {
      return null
    }
    if (order.status === 'PAID') {
      throw new Error('Cannot cancel an order that has already been paid')
    }
    order.status = 'CANCELLED'
    order.updatedAt = new Date().toISOString()
    this.saveToDisk()
    this.emitOrderUpdate(order)
    return order
  }

  public markPaidManually(
    orderCode: string,
    note = 'Xác nhận thủ công bởi nhân viên',
    staffName = 'Nhân viên'
  ): OrderRecord | null {
    const order = this.getOrder(orderCode)
    if (!order) {
      return null
    }
    if (order.status === 'PAID') {
      return order
    }
    const cleanStaff = staffName.trim() || 'Nhân viên'
    const cleanNote = note.trim() || 'Xác nhận thủ công khi app Android gặp sự cố'
    const remaining = Math.max(0, order.totalAmount - order.paidAmount)
    const nowIso = new Date().toISOString()
    order.payments.push({
      fingerprint: `staff-${Date.now()}`,
      amount: remaining,
      bankName: `Nhân viên: ${cleanStaff}`,
      rawMessage: cleanNote,
      receivedAt: nowIso,
      source: 'STAFF',
      confirmedBy: cleanStaff,
    })
    order.paidAmount += remaining
    order.status = 'PAID'
    order.paymentSource = 'STAFF'
    order.confirmedByStaff = {
      staffName: cleanStaff,
      note: cleanNote,
      confirmedAt: nowIso,
    }
    order.paidAt = nowIso
    order.updatedAt = nowIso
    this.saveToDisk()
    this.emitOrderUpdate(order)
    return order
  }

  public processBankTransfer(parsed: ParsedBankTransfer): {
    log: WebhookLogRecord
    order: OrderRecord | null
  } {
    const nowIso = new Date().toISOString()
    const baseLog = {
      id: crypto.randomUUID(),
      receivedAt: nowIso,
      bankName: parsed.bankName,
      packageName: parsed.packageName,
      isCredit: parsed.isCredit,
      amount: parsed.amount,
      orderCode: parsed.orderCode,
      fingerprint: parsed.transactionFingerprint,
      rawMessage: parsed.rawMessage,
    }

    // 1. Ignore outgoing debits or unparseable notifications
    if (!parsed.isCredit || !parsed.amount || parsed.amount <= 0) {
      const log: WebhookLogRecord = {
        ...baseLog,
        outcome: 'DEBIT_IGNORED',
        detail: parsed.reason || 'Not an incoming credit transaction',
      }
      this.appendWebhookLog(log)
      return { log, order: null }
    }

    // 2. Idempotency check across all orders
    const alreadyProcessed = this.state.orders.some((o) =>
      o.payments.some((p) => p.fingerprint === parsed.transactionFingerprint)
    )
    if (alreadyProcessed) {
      const log: WebhookLogRecord = {
        ...baseLog,
        outcome: 'DUPLICATE_IGNORED',
        detail: 'Duplicate notification fingerprint already applied',
      }
      this.appendWebhookLog(log)
      return { log, order: null }
    }

    // 3. Match order by orderCode
    if (!parsed.orderCode) {
      const log: WebhookLogRecord = {
        ...baseLog,
        outcome: 'UNMATCHED',
        detail: 'No order reference code found in transfer description',
      }
      this.appendWebhookLog(log)
      return { log, order: null }
    }

    const order = this.getOrder(parsed.orderCode)
    if (!order) {
      const log: WebhookLogRecord = {
        ...baseLog,
        outcome: 'UNMATCHED',
        detail: `Order ${parsed.orderCode} not found`,
      }
      this.appendWebhookLog(log)
      return { log, order: null }
    }

    if (order.status === 'PAID') {
      // Archive delayed bank notification for audit/reconciliation without double-counting revenue
      order.payments.push({
        fingerprint: parsed.transactionFingerprint,
        amount: parsed.amount,
        bankName: parsed.bankName,
        rawMessage: `[Đối soát bổ sung] ${parsed.rawMessage}`,
        receivedAt: nowIso,
        source: 'WEBHOOK',
      })
      order.updatedAt = nowIso
      const detail = order.paymentSource === 'STAFF'
        ? `Order ${order.orderCode} already confirmed by staff (${order.confirmedByStaff?.staffName || 'Staff'}); bank notification archived`
        : `Order ${order.orderCode} was already paid`
      const log: WebhookLogRecord = {
        ...baseLog,
        outcome: 'ALREADY_PAID',
        detail,
      }
      this.appendWebhookLog(log)
      return { log, order }
    }

    // Apply payment (accepts transfers to PENDING, UNDERPAID, or even late EXPIRED orders so customer money is tracked)
    order.payments.push({
      fingerprint: parsed.transactionFingerprint,
      amount: parsed.amount,
      bankName: parsed.bankName,
      rawMessage: parsed.rawMessage,
      receivedAt: nowIso,
      source: 'WEBHOOK',
    })
    order.paidAmount += parsed.amount
    order.updatedAt = nowIso

    let log: WebhookLogRecord
    if (order.paidAmount >= order.totalAmount) {
      order.status = 'PAID'
      order.paymentSource = 'WEBHOOK'
      order.paidAt = nowIso
      log = {
        ...baseLog,
        outcome: 'MATCHED_PAID',
        detail: `Matched ${order.orderCode}: received ${order.paidAmount.toLocaleString('en-US')} / ${order.totalAmount.toLocaleString('en-US')} VND -> PAID`,
      }
    } else {
      order.status = 'UNDERPAID'
      const remaining = order.totalAmount - order.paidAmount
      log = {
        ...baseLog,
        outcome: 'MATCHED_UNDERPAID',
        detail: `Partial payment for ${order.orderCode}: received ${order.paidAmount.toLocaleString('en-US')} / ${order.totalAmount.toLocaleString('en-US')} VND (short by ${remaining.toLocaleString('en-US')} VND)`,
      }
    }

    this.appendWebhookLog(log)
    this.emitOrderUpdate(order)
    return { log, order }
  }

  public listWebhookLogs(limit = 100): WebhookLogRecord[] {
    return this.state.webhookLogs.slice(0, limit)
  }

  private appendWebhookLog(log: WebhookLogRecord): void {
    this.state.webhookLogs.unshift(log)
    if (this.state.webhookLogs.length > 500) {
      this.state.webhookLogs.length = 500
    }
    this.saveToDisk()
  }

  public subscribeOrder(orderCode: string, listener: (order: OrderRecord) => void): () => void {
    const channel = `order:${orderCode.toUpperCase()}`
    this.events.on(channel, listener)
    return () => {
      this.events.off(channel, listener)
    }
  }

  private emitOrderUpdate(order: OrderRecord): void {
    this.events.emit(`order:${order.orderCode}`, order)
  }
}

let singletonStore: OrderStore | null = null

export function getOrderStore(dataDir = 'data'): OrderStore {
  if (!singletonStore) {
    singletonStore = new OrderStore({ dataDir })
  }
  return singletonStore
}
