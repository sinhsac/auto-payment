<script setup lang="ts">
const route = useRoute()
import {Product} from "#components";

const {data} = await useFetch('/api/products')

const debug = ref(route.query.debug ? route.query.debug : '')

</script>

<template>
  <div class="container-info">
    <div class="heading">

    </div>
    <div class="product-list">
      <Product v-for="p in data.products" :product="p" :key="p.item.item_id"></Product>
    </div>
    <pre v-if="debug == 'true'">
      {{ data.products }}
    </pre>
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