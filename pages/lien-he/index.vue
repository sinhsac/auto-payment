<script setup lang="ts">
const config = useRuntimeConfig()
const requestUrl = useRequestURL()
const webhookEndpoint = computed(() => `${requestUrl.origin}/api/webhooks/bank-notify`)
</script>

<template>
  <div class="section py-4">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm p-4 h-100">
            <h4 class="fw-bold mb-3">Thông tin liên hệ &amp; Tài khoản nhận tiền</h4>
            <ul class="list-group list-group-flush small">
              <li class="list-group-item px-0"><b>Ngân hàng:</b> {{ config.public.bankName }}</li>
              <li class="list-group-item px-0"><b>Số tài khoản:</b> <code>{{ config.public.bankAccountNo }}</code></li>
              <li class="list-group-item px-0"><b>Chủ tài khoản:</b> {{ config.public.bankAccountName }}</li>
              <li class="list-group-item px-0"><b>Hotline:</b> {{ config.public.supportPhone }}</li>
              <li class="list-group-item px-0"><b>Email:</b> {{ config.public.supportEmail }}</li>
            </ul>
            <div class="mt-4">
              <NuxtLink to="/admin" class="btn btn-primary btn-sm">Mở trang Quản trị &amp; Test Webhook</NuxtLink>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card border-0 shadow-sm p-4 h-100">
            <h4 class="fw-bold mb-2">Kết nối ứng dụng <code>auto-payment-android</code></h4>
            <p class="small text-muted">
              Trong dự án <a href="https://github.com/sinhsac/auto-payment-android" target="_blank" rel="noopener">auto-payment-android</a>, trỏ URL trong <code>PushingWorker.kt</code> về endpoint webhook sau:
            </p>

            <div class="p-2 bg-dark text-white rounded font-monospace small mb-3">
              POST {{ webhookEndpoint }}
            </div>

            <h6 class="fw-bold small">Ví dụ gửi thử bằng <code>curl</code> (chuẩn JSON <code>XInfo</code> của Android):</h6>
            <pre class="bg-light border rounded p-3 small mb-0"><code>curl -X POST {{ webhookEndpoint }} \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret-if-enabled" \
  -d '{
    "groupKey": "0|com.VCB|123",
    "strPostTime": "2026-11-27 17:30:00",
    "title": "Vietcombank",
    "msg": "SD TK 0123456789 +150,000VND luc 27/11/2026. ND: AP123456",
    "pck": "com.VCB"
  }'</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
