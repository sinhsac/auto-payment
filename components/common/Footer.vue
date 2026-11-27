<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <footer class="footer_dark mt-5">
    <div class="footer_top">
      <div class="container">
        <div class="row">
          <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="widget">
              <div class="footer_logo mb-3">
                <NuxtLink to="/"><img src="/assets/images/logo_light.png" alt="Auto Payment" style="max-height: 36px;" /></NuxtLink>
              </div>
              <p>
                Hệ thống bán hàng &amp; xác nhận chuyển khoản tự động (tự sinh QR ngân hàng offline, nhận thông báo biến động số dư qua <code>auto-payment-android</code> — phát triển bởi <strong>Hỗ trợ giải pháp số</strong>).
              </p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-6">
            <div class="widget">
              <h6 class="widget_title">Điều hướng</h6>
              <ul class="widget_links">
                <li><NuxtLink to="/">Cửa hàng sản phẩm</NuxtLink></li>
                <li><NuxtLink to="/admin">Quản trị đơn hàng &amp; Webhook</NuxtLink></li>
                <li><NuxtLink to="/lien-he">Hướng dẫn tích hợp &amp; Liên hệ</NuxtLink></li>
              </ul>
            </div>
          </div>
          <div class="col-lg-2 col-md-6 col-sm-6">
            <div class="widget">
              <h6 class="widget_title">Mã nguồn mở</h6>
              <ul class="widget_links">
                <li><a href="https://github.com/sinhsac/auto-payment" target="_blank" rel="noopener">auto-payment (Web)</a></li>
                <li><a href="https://github.com/sinhsac/auto-payment-android" target="_blank" rel="noopener">auto-payment-android</a></li>
              </ul>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 col-sm-6">
            <div class="widget">
              <h6 class="widget_title">Thông tin hỗ trợ</h6>
              <ul class="contact_info contact_info_light">
                <li>
                  <i class="ti-credit-card"></i>
                  <p>{{ config.public.bankName }} — {{ config.public.bankAccountNo }}</p>
                </li>
                <li>
                  <i class="ti-email"></i>
                  <a :href="`mailto:${config.public.supportEmail}`">{{ config.public.supportEmail }}</a>
                </li>
                <li>
                  <i class="ti-mobile"></i>
                  <p>{{ config.public.supportPhone }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom_footer border-top-tran">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="mb-md-0 text-center text-md-start">© 2026 Auto Payment — Hỗ trợ giải pháp số • MIT License</p>
          </div>
          <div class="col-md-6 text-center text-md-end small text-muted">
            Powered by Nuxt 4, Nitro SSE &amp; Auto Payment Android
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
