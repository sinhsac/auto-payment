<script setup lang="ts">
const route = useRoute()
import ProductItem from "~/components/shop/ProductItem.vue";

const {data} = await useFetch('/api/products')
const debug = ref(route.query.debug ? route.query.debug : '')
</script>

<template>
  <div class="section small_pt pb_70">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="heading_s1 text-center">
            <h2>Ổ cứng</h2>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div class="tab-content">
            <div class="tab-pane fade show active" id="arrival" role="tabpanel" aria-labelledby="arrival-tab">
              <div class="row shop_container">
                <div v-for="p in data.products" :key="p.item.item_id" class="col-lg-2 col-md-3 col-6">
                  <ProductItem :product="p" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>