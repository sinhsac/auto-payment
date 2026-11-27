<script setup lang="ts">
const statusFilter = ref('ALL')
const searchQ = ref('')
const sendingWebhook = ref(false)
const webhookResult = ref<any>(null)

// Staff manual confirmation modal state (fallback when Android app is offline)
const staffModalOrder = ref<any>(null)
const staffNameInput = ref('')
const staffNoteInput = ref('')
const staffConfirming = ref(false)
const staffError = ref('')

const simForm = reactive({
  pck: 'com.VCB',
  title: 'Vietcombank',
  msg: 'SD TK 0123456789 +150,000VND luc 2026-11-27 17:30:00. ND: AP123456',
  webhookSecret: '',
})

const { data: ordersData, refresh: refreshOrders } = await useFetch('/api/orders', {
  query: computed(() => ({
    status: statusFilter.value,
    q: searchQ.value || undefined,
  })),
})

const { data: logsData, refresh: refreshLogs } = await useFetch('/api/webhooks/logs', {
  query: { limit: 50 },
})

const stats = computed(() => ordersData.value?.stats || {
  totalOrders: 0,
  paidOrders: 0,
  pendingOrders: 0,
  codOrders: 0,
  totalRevenuePaid: 0,
  totalWebhooks: 0,
})
const orders = computed(() => ordersData.value?.orders || [])
const logs = computed(() => logsData.value?.logs || [])

const refreshAll = async () => {
  await Promise.all([refreshOrders(), refreshLogs()])
}

const fillSimulatorFromOrder = (order: any) => {
  const remaining = Math.max(0, order.totalAmount - (order.paidAmount || 0))
  const amtStr = remaining.toLocaleString('en-US')
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19)
  simForm.pck = 'com.VCB'
  simForm.title = order.bankInfo?.bankName || 'Vietcombank'
  simForm.msg = `SD TK ${order.bankInfo?.accountNo || '0123456789'} +${amtStr}VND luc ${nowStr}. ND: ${order.orderCode}`
}

const sendSimulatedWebhook = async () => {
  sendingWebhook.value = true
  webhookResult.value = null
  try {
    const headers: Record<string, string> = {}
    if (simForm.webhookSecret.trim()) {
      headers['x-webhook-secret'] = simForm.webhookSecret.trim()
    }
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19)
    webhookResult.value = await $fetch('/api/webhooks/bank-notify', {
      method: 'POST',
      headers,
      body: {
        groupKey: `0|${simForm.pck}|manual|${Date.now()}`,
        postTime: new Date().toISOString(),
        strPostTime: nowStr,
        title: simForm.title,
        msg: simForm.msg,
        pck: simForm.pck,
      },
    })
    await refreshAll()
  } catch (err: any) {
    webhookResult.value = { ok: false, detail: err?.data?.statusMessage || err?.message || 'Error' }
  } finally {
    sendingWebhook.value = false
  }
}

const openStaffConfirmModal = (order: any) => {
  staffModalOrder.value = order
  staffNameInput.value = ''
  staffNoteInput.value = `Xác nhận thủ công đơn ${order.orderCode} (đã kiểm tra sao kê ngân hàng)`
  staffError.value = ''
}

const submitStaffConfirm = async () => {
  if (!staffModalOrder.value) return
  if (!staffNameInput.value.trim()) {
    staffError.value = 'Vui lòng nhập tên nhân viên xác nhận.'
    return
  }
  staffConfirming.value = true
  staffError.value = ''
  try {
    await $fetch(`/api/orders/${staffModalOrder.value.orderCode}/action`, {
      method: 'POST',
      body: {
        action: 'confirm_by_staff',
        staffName: staffNameInput.value.trim(),
        note: staffNoteInput.value.trim(),
      },
    })
    staffModalOrder.value = null
    await refreshAll()
  } catch (err: any) {
    staffError.value = err?.data?.statusMessage || err?.message || 'Lỗi xác nhận đơn hàng'
  } finally {
    staffConfirming.value = false
  }
}

const runOrderAction = async (orderCode: string, action: 'mark_paid' | 'cancel') => {
  await $fetch(`/api/orders/${orderCode}/action`, {
    method: 'POST',
    body: { action },
  })
  await refreshAll()
}

const badgeClass = (status: string) => {
  switch (status) {
    case 'PAID': return 'bg-success'
    case 'CONFIRMED_COD': return 'bg-info text-dark'
    case 'PENDING': return 'bg-warning text-dark'
    case 'UNDERPAID': return 'bg-orange bg-warning text-dark border border-danger'
    case 'EXPIRED': return 'bg-secondary'
    case 'CANCELLED': return 'bg-danger'
    default: return 'bg-light text-dark'
  }
}
</script>

<template>
  <div class="section py-4">
    <div class="container">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <div>
          <h3 class="fw-bold mb-0">Quản trị Đơn hàng &amp; Bank Webhook</h3>
          <p class="text-muted small mb-0">Theo dõi đơn hàng VietQR, log thông báo ngân hàng và kiểm thử webhook <code>auto-payment-android</code></p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" @click="refreshAll">↻ Làm mới</button>
          <NuxtLink to="/" class="btn btn-dark btn-sm">← Về cửa hàng</NuxtLink>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
          <div class="card border-0 shadow-sm p-3">
            <div class="small text-muted">Tổng đơn hàng</div>
            <div class="fs-4 fw-bold">{{ stats.totalOrders }}</div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="card border-0 shadow-sm p-3">
            <div class="small text-muted">Đã thanh toán (QR/CK)</div>
            <div class="fs-4 fw-bold text-success">{{ stats.paidOrders }}</div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="card border-0 shadow-sm p-3">
            <div class="small text-muted">Chờ thanh toán</div>
            <div class="fs-4 fw-bold text-warning">{{ stats.pendingOrders }}</div>
          </div>
        </div>
        <div class="col-6 col-lg-3">
          <div class="card border-0 shadow-sm p-3">
            <div class="small text-muted">Doanh thu đã khớp</div>
            <div class="fs-4 fw-bold text-primary">{{ formatToMoney(stats.totalRevenuePaid) }} ₫</div>
          </div>
        </div>
      </div>

      <!-- Orders table -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <h5 class="fw-bold mb-0">Danh sách đơn hàng</h5>
          <div class="d-flex flex-wrap gap-2">
            <select v-model="statusFilter" class="form-select form-select-sm" style="width: 170px;">
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">PENDING</option>
              <option value="UNDERPAID">UNDERPAID</option>
              <option value="PAID">PAID</option>
              <option value="CONFIRMED_COD">CONFIRMED_COD</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <input v-model="searchQ" type="search" class="form-control form-control-sm" style="width: 220px;" placeholder="Tìm mã đơn, tên, SĐT..." />
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Phương thức</th>
                <th class="text-end">Đã trả / Tổng</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th class="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="orders.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  Chưa có đơn hàng nào. Hãy <NuxtLink to="/">đặt thử một đơn hàng</NuxtLink> để kiểm tra quy trình VietQR!
                </td>
              </tr>
              <tr v-for="order in orders" :key="order.orderCode">
                <td class="fw-bold font-monospace">
                  <NuxtLink :to="`/orders/${order.orderCode}`">{{ order.orderCode }}</NuxtLink>
                </td>
                <td>
                  <div class="fw-semibold">{{ order.customer.userName }}</div>
                  <div class="text-muted">{{ order.customer.phone }}</div>
                </td>
                <td><span class="badge bg-light text-dark border">{{ order.paymentMethod }}</span></td>
                <td class="text-end">
                  <span class="fw-semibold text-success">{{ formatToMoney(order.paidAmount) }}</span> /
                  <span class="fw-bold">{{ formatToMoney(order.totalAmount) }} ₫</span>
                </td>
                <td>
                  <span class="badge" :class="badgeClass(order.status)">{{ order.status }}</span>
                  <div v-if="order.paymentSource === 'STAFF'" class="text-primary mt-1" style="font-size: 0.72rem;">
                    👤 NV: {{ order.confirmedByStaff?.staffName || 'Nhân viên' }}
                  </div>
                  <div v-else-if="order.paymentSource === 'WEBHOOK'" class="text-success mt-1" style="font-size: 0.72rem;">
                    ⚡ Tự động (App)
                  </div>
                </td>
                <td>{{ formatDateTime(order.createdAt) }}</td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <NuxtLink :to="`/orders/${order.orderCode}`" class="btn btn-outline-primary">Mở</NuxtLink>
                    <button
                      v-if="order.status === 'PENDING' || order.status === 'UNDERPAID'"
                      class="btn btn-outline-info"
                      title="Điền vào khung giả lập Webhook bên dưới"
                      @click="fillSimulatorFromOrder(order)"
                    >
                      Test QR
                    </button>
                    <button
                      v-if="order.status !== 'PAID' && order.status !== 'CANCELLED'"
                      class="btn btn-success"
                      title="Xác nhận thủ công bởi nhân viên nếu app Android gặp sự cố"
                      @click="openStaffConfirmModal(order)"
                    >
                      NV xác nhận
                    </button>
                    <button
                      v-if="order.status === 'PENDING' || order.status === 'UNDERPAID'"
                      class="btn btn-outline-danger"
                      @click="runOrderAction(order.orderCode, 'cancel')"
                    >
                      Hủy
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Webhook simulator & logs -->
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm p-4 h-100">
            <h5 class="fw-bold mb-2">Giả lập Webhook Ngân hàng</h5>
            <p class="small text-muted mb-3">
              Gửi payload JSON giống hệt <code>auto-payment-android</code> tới <code>POST /api/webhooks/bank-notify</code>.
            </p>

            <form @submit.prevent="sendSimulatedWebhook">
              <div class="mb-2">
                <label class="form-label small fw-semibold">App ngân hàng (<code>pck</code>)</label>
                <select v-model="simForm.pck" class="form-select form-select-sm">
                  <option value="com.VCB">Vietcombank (com.VCB)</option>
                  <option value="vn.com.techcombank.bb.app">Techcombank</option>
                  <option value="com.mbmobile">MBBank</option>
                  <option value="com.vnpay.vpbankonline">VPBank</option>
                  <option value="mobile.acb.com.vn">ACB</option>
                  <option value="com.mservice.momotransfer">MoMo</option>
                </select>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-semibold">Tiêu đề thông báo (<code>title</code>)</label>
                <input v-model="simForm.title" type="text" class="form-control form-control-sm" />
              </div>

              <div class="mb-2">
                <label class="form-label small fw-semibold">Nội dung biến động số dư (<code>msg</code>)</label>
                <textarea v-model="simForm.msg" rows="3" class="form-control form-control-sm font-monospace"></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">X-Webhook-Secret (nếu server đã bật)</label>
                <input v-model="simForm.webhookSecret" type="password" class="form-control form-control-sm" placeholder="Để trống nếu đang ở chế độ dev" />
              </div>

              <button type="submit" class="btn btn-primary btn-sm w-100 fw-semibold" :disabled="sendingWebhook">
                {{ sendingWebhook ? 'Đang gửi...' : 'Gửi Webhook tới /api/webhooks/bank-notify' }}
              </button>
            </form>

            <div v-if="webhookResult" class="alert mt-3 mb-0 small py-2" :class="webhookResult.ok ? 'alert-success' : 'alert-danger'">
              <div><b>Outcome:</b> <code>{{ webhookResult.outcome || 'ERROR' }}</code></div>
              <div>{{ webhookResult.detail }}</div>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3">
              <h5 class="fw-bold mb-0">Lịch sử Webhook gần đây ({{ logs.length }})</h5>
            </div>
            <div class="table-responsive" style="max-height: 430px; overflow-y: auto;">
              <table class="table table-sm align-middle mb-0 small">
                <thead class="table-light">
                  <tr>
                    <th>Thời gian</th>
                    <th>Ngân hàng</th>
                    <th>Số tiền / Mã</th>
                    <th>Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="logs.length === 0">
                    <td colspan="4" class="text-center py-4 text-muted">Chưa có webhook nào được gửi tới hệ thống.</td>
                  </tr>
                  <tr v-for="log in logs" :key="log.id">
                    <td class="text-nowrap">{{ formatDateTime(log.receivedAt) }}</td>
                    <td>{{ log.bankName }}</td>
                    <td>
                      <div class="fw-semibold">{{ log.amount ? `${formatToMoney(log.amount)} ₫` : '—' }}</div>
                      <div class="font-monospace text-primary">{{ log.orderCode || '—' }}</div>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="log.outcome === 'MATCHED_PAID' ? 'bg-success' : log.outcome === 'MATCHED_UNDERPAID' ? 'bg-warning text-dark' : 'bg-secondary'"
                      >
                        {{ log.outcome }}
                      </span>
                      <div class="text-muted" style="font-size: 0.75rem;">{{ log.detail }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <!-- Staff manual confirmation modal -->
      <div
        v-if="staffModalOrder"
        class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style="background: rgba(15, 23, 42, 0.55); z-index: 2000;"
      >
        <div class="card border-0 shadow-lg p-4" style="max-width: 480px; width: 92%;">
          <h5 class="fw-bold mb-1">Xác nhận thanh toán bởi nhân viên</h5>
          <p class="small text-muted mb-3">
            Dùng khi ứng dụng Android bị mất mạng hoặc chưa kịp đồng bộ. Màn hình khách hàng đang mở đơn
            <code>{{ staffModalOrder.orderCode }}</code> sẽ tự động chuyển sang hoàn tất ngay lập tức.
          </p>

          <div class="alert alert-light border small py-2 mb-3">
            <div><b>Đơn hàng:</b> <code>{{ staffModalOrder.orderCode }}</code> ({{ staffModalOrder.customer.userName }})</div>
            <div><b>Cần thanh toán:</b> <span class="text-danger fw-bold">{{ formatToMoney(staffModalOrder.totalAmount - (staffModalOrder.paidAmount || 0)) }} ₫</span></div>
          </div>

          <div v-if="staffError" class="alert alert-danger py-2 small">{{ staffError }}</div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Tên nhân viên xác nhận <span class="text-danger">*</span></label>
            <input v-model="staffNameInput" type="text" class="form-control form-control-sm" placeholder="VD: Nguyễn Minh Anh (Thu ngân)" />
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Ghi chú / Mã giao dịch đối soát</label>
            <textarea v-model="staffNoteInput" rows="2" class="form-control form-control-sm"></textarea>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary btn-sm" :disabled="staffConfirming" @click="staffModalOrder = null">Đóng</button>
            <button class="btn btn-success btn-sm fw-semibold" :disabled="staffConfirming" @click="submitStaffConfirm">
              {{ staffConfirming ? 'Đang xác nhận...' : 'Xác nhận đã nhận tiền' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
