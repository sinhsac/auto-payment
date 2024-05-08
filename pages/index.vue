<script setup lang="ts">
import Checkout from "~/components/shop/Checkout.vue";

const pInfo = pageInfo()

</script>

<template>
  <div>
    <Checkout v-if="pInfo.pageType == 'Checkout'"/>
    <ShopWithTab v-if="pInfo.pageType == 'Home'"/>
  </div>

</template>

<style scoped>
.container-info {
  overflow: auto;
  background: #f5f5f5;
}

.heading {
  margin-top: 20px;
}

.product-list {
  display: flex;
  min-height: calc(100vh - 11.25rem);
  flex-wrap: wrap;
  align-content: flex-start;
  padding-top: .3125rem;
  margin-left: auto;
  margin-right: auto;
  width: 1200px;
}
</style>