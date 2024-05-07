<script setup lang="ts">

import ShoppingCart from "~/components/common/ShoppingCart.vue";


</script>

<template>
  <header class="header_wrap fixed-top header_with_topbar">
    <div class="top-header">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start">
              <div class="lng_dropdown me-2">
                <select name="countries" class="custome_select">
                  <option value='us' data-image="assets/images/us.png" data-title="United States">Việt Nam</option>
                </select>
              </div>
              <div class="me-3">
                <select name="countries" class="custome_select">
                  <option value='VND' data-title="VND">VND</option>
                </select>
              </div>
              <ul class="contact_detail text-center text-lg-start">
                <li><i class="ti-mobile"></i><span>123-456-7890</span></li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="text-center text-md-end">
              <ul class="header_list">
                <li><a href="compare.html"><i class="ti-control-shuffle"></i><span>Compare</span></a></li>
                <li><a href="wishlist.html"><i class="ti-heart"></i><span>Wishlist</span></a></li>
                <li><a href="login.html"><i class="ti-user"></i><span>Login</span></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom_header dark_skin main_menu_uppercase">
      <div class="container">
        <nav class="navbar navbar-expand-lg">
          <a class="navbar-brand" href="/">
            <img class="logo_light" src="/assets/images/logo_light.png" alt="logo"/>
            <img class="logo_dark" src="/assets/images/logo_dark.png" alt="logo"/>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                  data-bs-target="#navbarSupportedContent" aria-expanded="false">
            <span class="ion-android-menu"></span>
          </button>
          <div class="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
            <ul class="navbar-nav">
              <li><a class="nav-link nav_item" @click="goToShop()" href="javascript:;">Trang chủ</a></li>
              <li><a class="nav-link nav_item" href="/">Giới thiệu</a></li>
              <li><a class="nav-link nav_item" @click="goToShop()" href="javascript:;">Sản phẩm</a></li>
              <li><a class="nav-link nav_item" href="/lien-he">Liên hệ</a></li>
            </ul>
          </div>
          <ShoppingCart />
        </nav>
      </div>
    </div>
  </header>
</template>

<style scoped>

</style>