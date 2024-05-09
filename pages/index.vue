<script setup lang="ts">
import Checkout from "~/components/shop/Checkout.vue";
import PlaceOrder from "~/components/shop/PlaceOrder.vue";
import OrderCompleted from "~/components/shop/OrderCompleted.vue";

const pInfo = pageInfo()

</script>

<template>
  <div>
    <Checkout v-if="pInfo.pageType == 'Checkout'"/>
    <ShopWithTab v-if="pInfo.pageType == 'Home'"/>
    <PlaceOrder v-if="pInfo.pageType == 'PlaceOrder'"/>
    <OrderCompleted v-if="pInfo.pageType == 'OrderCompleted'"/>
  </div>

</template>
