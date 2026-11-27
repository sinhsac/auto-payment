import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { buildVietQrPayload, computeCrc16Ccitt, generateVietQrDataUrl } from '../server/utils/vietqr.ts'
import { extractOrderCode, parseBankNotification } from '../server/utils/bankParser.ts'
import { OrderStore } from '../server/utils/orderStore.ts'

test('computeCrc16Ccitt matches EMVCo CCITT-FALSE reference vector', () => {
  assert.equal(computeCrc16Ccitt('123456789'), '29B1')
})

test('buildVietQrPayload creates valid NAPAS 247 EMVCo QR string with valid CRC16', async () => {
  const payload = buildVietQrPayload({
    bankBin: '970436',
    accountNo: '0123456789',
    amount: 150000,
    purpose: 'Thanh toán AP849201',
  })

  assert.ok(payload.startsWith('000201010212'))
  assert.ok(payload.includes('A000000727'))
  assert.ok(payload.includes('970436'))
  assert.ok(payload.includes('0123456789'))
  assert.ok(payload.includes('QRIBFTTA'))
  assert.ok(payload.includes('5303704'))
  assert.ok(payload.includes('5406150000'))
  assert.ok(payload.includes('5802VN'))
  assert.ok(payload.includes('Thanh toan AP849201'))

  // Verify trailing CRC matches recomputed CRC
  const bodyWithoutCrc = payload.slice(0, -4)
  const embeddedCrc = payload.slice(-4)
  assert.equal(embeddedCrc, computeCrc16Ccitt(bodyWithoutCrc))

  const { dataUrl } = await generateVietQrDataUrl({
    bankBin: '970436',
    accountNo: '0123456789',
    amount: 150000,
    purpose: 'AP849201',
  })
  assert.ok(dataUrl.startsWith('data:image/png;base64,'))
})

test('parseBankNotification handles Vietnamese banks, order codes, and rejects debits', () => {
  const vcb = parseBankNotification({
    pck: 'com.VCB',
    title: 'Vietcombank',
    strPostTime: '2026-11-27 17:30:00',
    msg: 'SD TK 0123456789 +150,000VND luc 27/11/2026. ND: chuyen khoan ap849201',
  })
  assert.equal(vcb.isCredit, true)
  assert.equal(vcb.amount, 150000)
  assert.equal(vcb.orderCode, 'AP849201')
  assert.equal(vcb.bankName, 'Vietcombank')

  const mb = parseBankNotification({
    pck: 'com.mbmobile',
    title: 'MBBank',
    msg: 'TK 888888 | GD: +1.290.000 VND | ND: AP555111 thanh toan',
  })
  assert.equal(mb.isCredit, true)
  assert.equal(mb.amount, 1290000)
  assert.equal(mb.orderCode, 'AP555111')
  assert.equal(mb.bankName, 'MBBank')

  // Outgoing debit MUST be rejected
  const debit = parseBankNotification({
    pck: 'com.VCB',
    title: 'Vietcombank',
    msg: 'SD TK 0123456789 -150,000VND luc 27/11/2026. ND: AP849201',
  })
  assert.equal(debit.isCredit, false)

  assert.equal(extractOrderCode('Transfer for AP-998877 done', 'AP'), 'AP998877')
})

test('OrderStore end-to-end: partial payment, full payment, idempotency, SSE, and disk persistence', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-payment-test-'))
  try {
    const store = new OrderStore({ dataDir: tmpDir })
    const order = store.createOrder({
      orderCode: 'AP123456',
      paymentMethod: 'qr',
      customer: {
        userName: 'Test User',
        address: 'Ho Chi Minh City',
        phone: '0909123456',
        email: 'test@example.com',
      },
      items: [
        { id: 1, title: 'Keyboard', price: 100000, qty: 2 },
      ],
      expiryMinutes: 15,
    })

    assert.equal(order.status, 'PENDING')
    assert.equal(order.totalAmount, 200000)

    const emittedStatuses: string[] = []
    const unsub = store.subscribeOrder('AP123456', (o) => emittedStatuses.push(o.status))

    // 1. Outgoing debit ignored
    const debitRes = store.processBankTransfer(
      parseBankNotification({ msg: 'SD TK 0123456789 -200,000VND ND: AP123456', pck: 'com.VCB' })
    )
    assert.equal(debitRes.log.outcome, 'DEBIT_IGNORED')

    // 2. Partial transfer -> UNDERPAID
    const partialPayload = {
      strPostTime: '2026-11-27 17:31:00',
      pck: 'com.VCB',
      msg: 'SD TK 0123456789 +100,000VND ND: AP123456',
    }
    const partialRes = store.processBankTransfer(parseBankNotification(partialPayload))
    assert.equal(partialRes.log.outcome, 'MATCHED_UNDERPAID')
    assert.equal(partialRes.order?.status, 'UNDERPAID')
    assert.equal(partialRes.order?.paidAmount, 100000)

    // 3. Exact same duplicate notification -> DUPLICATE_IGNORED (idempotent!)
    const dupRes = store.processBankTransfer(parseBankNotification(partialPayload))
    assert.equal(dupRes.log.outcome, 'DUPLICATE_IGNORED')
    assert.equal(store.getOrder('AP123456')?.paidAmount, 100000)

    // 4. Second transfer completes full amount -> PAID
    const finalRes = store.processBankTransfer(
      parseBankNotification({
        strPostTime: '2026-11-27 17:32:00',
        pck: 'com.VCB',
        msg: 'SD TK 0123456789 +100,000VND ND: AP123456',
      })
    )
    assert.equal(finalRes.log.outcome, 'MATCHED_PAID')
    assert.equal(finalRes.order?.status, 'PAID')
    assert.equal(finalRes.order?.paidAmount, 200000)
    assert.deepEqual(emittedStatuses, ['UNDERPAID', 'PAID'])
    unsub()

    // 5. Reload from disk confirms persistence
    const reloaded = new OrderStore({ dataDir: tmpDir })
    const persisted = reloaded.getOrder('AP123456')
    assert.equal(persisted?.status, 'PAID')
    assert.equal(persisted?.payments.length, 2)
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})
