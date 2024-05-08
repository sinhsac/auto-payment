<script setup lang="ts">
const route = useRoute()
import ProductItem from "~/components/shop/ProductItem.vue";

const debug = ref(route.query.debug ? route.query.debug : '')
const cateId = ref(route.query.category ? route.query.category : pageInfo().value.curCategory)

pageInfo().value.curCategory = cateId

const aaaa = await useFetch('/api/categories/' + pageInfo().value.curCategory)
pageInfo().value.category = aaaa.data;

const category = pageInfo().value.category

const {data, refresh} = await useFetch('/api/products?category=' + pageInfo().value.curCategory)
const products = data.value.products || []
let lastId = data.value.lastId

const loadMoreProduct = async () => {
  const newData = await useFetch(`/api/products?category=${pageInfo().value.curCategory}&lastId=${lastId}`).data
  newData.value.products.forEach(prod => products.push(prod))
  lastId = newData.value.lastId
}

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
                <div v-for="p in products" :key="p.item.item_id" class="col-lg-2 col-md-3 col-sm-6 col-xs-6 col-6">
                  <ProductItem :product="p" />
                </div>
              </div>
              <div class="text-center load_more_wrap">
                <button id="load-more" class="btn btn-fill-out" @click="loadMoreProduct()">thêm</button>
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