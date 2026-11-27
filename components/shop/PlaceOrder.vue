<script setup lang="ts">
const props = defineProps<{
  order?: any
}>()

const emit = defineEmits<{
  (e: 'updated', order: any): void
}>()

const config = useRuntimeConfig()
const activeOrder = ref<any>(props.order || currentOrder().value)
const copiedField = ref('')
const sseConnected = ref(false)
const remainingSeconds = ref(0)
const simulating = ref(false)
const simFeedback = ref('')
const cancelling = ref(false)

let eventSource: EventSource | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

watch(
  () => props.order,
  (val) => {
    if (val) activeOrder.value = val
  }
)

const remainingAmount = computed(() => {
  if (!activeOrder.value) return 0
  return Math.max(0, activeOrder.value.totalAmount - (activeOrder.value.paidAmount || 0))
})

const countdownText = computed(() => {
  const s = Math.max(0, remainingSeconds.value)
  const mins = Math.floor(s / 60).toString().padStart(2, '0')
  const secs = (s % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
})

const syncCountdown = () => {
  if (!activeOrder.value?.expiresAt) {
    remainingSeconds.value = 0
    return
  }
  const diff = Math.floor((Date.parse(activeOrder.value.expiresAt) - Date.now()) / 1000)
  remainingSeconds.value = Math.max(0, diff)
}

const applyOrderUpdate = (updated: any) => {
  activeOrder.value = updated
  currentOrder().value = updated
  emit('updated', updated)
}

const refreshOrder = async () => {
  if (!activeOrder.value?.orderCode) return
  try {
    const res: any = await $fetch(`/api/orders/${activeOrder.value.orderCode}`)
    if (res?.order) {
      applyOrderUpdate(res.order)
    }
  } catch {
    // ignore transient poll error
  }
}

const connectSse = () => {
  if (!import.meta.client || !activeOrder.value?.orderCode) return
  eventSource?.close()
  eventSource = new EventSource(`/api/orders/${activeOrder.value.orderCode}/stream`)
  eventSource.onopen = () => {
    sseConnected.value = true
  }
  eventSource.addEventListener('order', (ev: MessageEvent) => {
    try {
      const updated = JSON.parse(ev.data)
      applyOrderUpdate(updated)
    } catch {
      // ignore parse error
    }
  })
  eventSource.onerror = () => {
    sseConnected.value = false
  }
}

const copyText = async (label: string, value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    copiedField.value = label
    setTimeout(() => {
      if (copiedField.value === label) copiedField.value = ''
    }, 1500)
  } catch {
    // clipboard unavailable
  }
}

const simulateBankTransfer = async (fraction = 1) => {
  if (!activeOrder.value) return
  simulating.value = true
  simFeedback.value = ''
  try {
    const payAmount = Math.max(1000, Math.round(remainingAmount.value * fraction))
    const formattedAmt = payAmount.toLocaleString('en-US')
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19)
    // Authentic auto-payment-android XInfo JSON payload
    const res: any = await $fetch('/api/webhooks/bank-notify', {
      method: 'POST',
      body: {
        groupKey: `0|com.VCB|demo|${Date.now()}`,
        postTime: new Date().toISOString(),
        strPostTime: nowStr,
        title: 'Vietcombank',
        msg: `SD TK ${activeOrder.value.bankInfo?.accountNo || '0123456789'} +${formattedAmt}VND luc ${nowStr}. Ref: ${activeOrder.value.orderCode}`,
        pck: 'com.VCB',
      },
    })
    simFeedback.value = res.detail || res.outcome
    await refreshOrder()
  } catch (err: any) {
    simFeedback.value = err?.data?.statusMessage || err?.message || 'Lỗi gửi webhook giả lập'
  } finally {
    simulating.value = false
  }
}

const cancelCurrentOrder = async () => {
  if (!activeOrder.value) return
  cancelling.value = true
  try {
    const res: any = await $fetch(`/api/orders/${activeOrder.value.orderCode}/action`, {
      method: 'POST',
      body: { action: 'cancel' },
    })
    if (res?.order) {
      applyOrderUpdate(res.order)
    }
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  syncCountdown()
  connectSse()
  countdownTimer = setInterval(syncCountdown, 1000)
  pollTimer = setInterval(refreshOrder, 5000)
})

onBeforeUnmount(() => {
  eventSource?.close()
  if (countdownTimer) clearInterval(countdownTimer)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="section py-4">
    <div class="container">
      <div v-if="!activeOrder" class="alert alert-warning text-center">
        Không tìm thấy thông tin đơn hàng. <NuxtLink to="/">Quay lại cửa hàng</NuxtLink>
      </div>

      <div v-else class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card border-0 shadow-sm overflow-hidden">
            <div class="card-header bg-dark text-white d-flex flex-wrap align-items-center justify-content-between py-3 px-4 gap-2">
              <div>
                <span class="badge bg-warning text-dark me-2">
                  {{ activeOrder.status === 'UNDERPAID' ? 'CHUYỂN THIẾU TIỀN' : 'CHỜ THANH TOÁN' }}
                </span>
                <span class="fw-bold">Đơn hàng #{{ activeOrder.orderCode }}</span>
              </div>
              <div class="d-flex align-items-center gap-3 small">
                <span>
                  <span class="d-inline-block rounded-circle me-1" :class="sseConnected ? 'bg-success' : 'bg-secondary'" style="width: 9px; height: 9px;"></span>
                  {{ sseConnected ? 'Đang lắng nghe giao dịch realtime' : 'Đang kiểm tra tự động...' }}
                </span>
                <span v-if="activeOrder.expiresAt" class="badge bg-danger fs-6">
                  ⏱ {{ countdownText }}
                </span>
              </div>
            </div>

            <div class="card-body p-4">
              <div v-if="activeOrder.status === 'UNDERPAID'" class="alert alert-warning mb-4">
                <strong>Đã nhận một phần thanh toán:</strong>
                Đã nhận <b>{{ formatToMoney(activeOrder.paidAmount) }} ₫</b> / {{ formatToMoney(activeOrder.totalAmount) }} ₫.
                Vui lòng chuyển bổ sung đúng <b>{{ formatToMoney(remainingAmount) }} ₫</b> kèm nội dung <code>{{ activeOrder.orderCode }}</code>.
              </div>

              <div class="row g-4 align-items-center">
                <!-- QR Code column -->
                <div class="col-md-5 text-center border-end">
                  <div class="p-3 bg-white border rounded-3 d-inline-block shadow-sm">
                    <img
                      v-if="activeOrder.bankInfo?.qrDataUrl"
                      :src="activeOrder.bankInfo.qrDataUrl"
                      :alt="`QR chuyển khoản ${activeOrder.orderCode}`"
                      style="width: 260px; height: 260px;"
                    />
                  </div>
                  <p class="small text-muted mt-3 mb-1">
                    Quét mã QR chuyển khoản (sinh offline để tự điền sẵn STK, số tiền &amp; mã đơn) hoặc nhập tay thông tin bên phải.
                  </p>
                  <p class="small text-success fw-semibold mb-0">
                    App <code>auto-payment-android</code> sẽ tự đọc thông báo biến động số dư và xác nhận đơn ngay lập tức — không qua cổng trung gian.
                  </p>
                </div>

                <!-- Transfer details column -->
                <div class="col-md-7">
                  <h5 class="fw-bold mb-3">Thông tin chuyển khoản</h5>

                  <div class="list-group mb-3">
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div class="small text-muted">Ngân hàng</div>
                        <div class="fw-semibold">{{ activeOrder.bankInfo?.bankName }}</div>
                      </div>
                      <span class="badge bg-light text-dark border">BIN {{ activeOrder.bankInfo?.bankBin }}</span>
                    </div>

                    <div class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div class="small text-muted">Số tài khoản</div>
                        <div class="fw-bold fs-5 font-monospace">{{ activeOrder.bankInfo?.accountNo }}</div>
                      </div>
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="copyText('acc', activeOrder.bankInfo?.accountNo || '')"
                      >
                        {{ copiedField === 'acc' ? 'Đã chép ✓' : 'Sao chép' }}
                      </button>
                    </div>

                    <div class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div class="small text-muted">Chủ tài khoản</div>
                        <div class="fw-semibold">{{ activeOrder.bankInfo?.accountName }}</div>
                      </div>
                    </div>

                    <div class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div class="small text-muted">Số tiền cần chuyển</div>
                        <div class="fw-bold fs-5 text-danger">{{ formatToMoney(remainingAmount) }} ₫</div>
                      </div>
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="copyText('amt', String(remainingAmount))"
                      >
                        {{ copiedField === 'amt' ? 'Đã chép ✓' : 'Sao chép' }}
                      </button>
                    </div>

                    <div class="list-group-item d-flex justify-content-between align-items-center bg-warning bg-opacity-10">
                      <div>
                        <div class="small text-muted">Nội dung chuyển khoản (Bắt buộc giữ nguyên)</div>
                        <div class="fw-bold fs-5 font-monospace text-primary">{{ activeOrder.orderCode }}</div>
                      </div>
                      <button
                        class="btn btn-sm btn-primary"
                        @click="copyText('code', activeOrder.orderCode)"
                      >
                        {{ copiedField === 'code' ? 'Đã chép ✓' : 'Sao chép mã' }}
                      </button>
                    </div>
                  </div>

                  <!-- Demo simulator box -->
                  <div v-if="config.public.enableDemoSimulator" class="p-3 rounded-3 border border-info bg-info bg-opacity-10 mb-3">
                    <div class="fw-semibold small text-dark mb-2">
                      ⚡ Chế độ Demo — Giả lập Webhook từ <code>auto-payment-android</code>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <button
                        class="btn btn-success btn-sm fw-semibold"
                        :disabled="simulating"
                        @click="simulateBankTransfer(1)"
                      >
                        {{ simulating ? 'Đang gửi...' : 'Giả lập chuyển khoản ĐỦ (Auto-Confirm)' }}
                      </button>
                      <button
                        v-if="activeOrder.status === 'PENDING'"
                        class="btn btn-outline-warning btn-sm text-dark"
                        :disabled="simulating"
                        @click="simulateBankTransfer(0.5)"
                      >
                        Giả lập chuyển THIẾU 50%
                      </button>
                    </div>
                    <div v-if="simFeedback" class="small text-dark mt-2">
                      <code>{{ simFeedback }}</code>
                    </div>
                  </div>

                  <div class="d-flex flex-wrap gap-2 justify-content-between">
                    <button class="btn btn-outline-secondary btn-sm" @click="refreshOrder">
                      Kiểm tra trạng thái ngay
                    </button>
                    <div class="d-flex gap-2">
                      <NuxtLink to="/admin" class="btn btn-outline-dark btn-sm">Mở trang Quản trị</NuxtLink>
                      <button class="btn btn-outline-danger btn-sm" :disabled="cancelling" @click="cancelCurrentOrder">
                        Hủy đơn hàng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
