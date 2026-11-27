<script setup lang="ts">
import ShoppingCart from '~/components/common/ShoppingCart.vue'

const config = useRuntimeConfig()
const router = useRouter()

const openStorefront = () => {
  goToShop()
  router.push('/')
}
</script>

<template>
  <header class="header_wrap fixed-top header_with_topbar">
    <div class="top-header">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-7">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <span class="badge bg-success">Auto Payment • Hỗ trợ giải pháp số</span>
              <span class="small text-muted">
                <i class="ti-mobile me-1"></i>{{ config.public.supportPhone }}
              </span>
              <span class="small text-muted d-none d-lg-inline">
                {{ config.public.bankName }} • {{ config.public.bankAccountNo }}
              </span>
            </div>
          </div>
          <div class="col-md-5">
            <div class="text-center text-md-end">
              <ul class="header_list">
                <li>
                  <NuxtLink to="/admin"><i class="ti-dashboard"></i><span>Quản trị &amp; Webhook</span></NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/lien-he"><i class="ti-help-alt"></i><span>Tích hợp Android</span></NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom_header dark_skin main_menu_uppercase">
      <div class="container">
        <nav class="navbar navbar-expand-lg">
          <a class="navbar-brand fw-bold text-dark d-flex align-items-center gap-2" href="/" @click.prevent="openStorefront">
            <img class="logo_dark" src="/assets/images/logo_dark.png" alt="Auto Payment" style="max-height: 36px;" />
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-expanded="false"
          >
            <span class="ion-android-menu"></span>
          </button>
          <div class="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
            <ul class="navbar-nav">
              <li><a class="nav-link nav_item" href="/" @click.prevent="openStorefront">Cửa hàng</a></li>
              <li><NuxtLink class="nav-link nav_item" to="/admin">Đơn hàng &amp; Quản trị</NuxtLink></li>
              <li><NuxtLink class="nav-link nav_item" to="/lien-he">Liên hệ &amp; API</NuxtLink></li>
            </ul>
          </div>
          <ShoppingCart />
        </nav>
      </div>
    </div>
  </header>
</template>
