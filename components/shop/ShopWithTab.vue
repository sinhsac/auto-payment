<script setup lang="ts">
import ProductItem from '~/components/shop/ProductItem.vue'

const route = useRoute()
const pInfo = pageInfo()
const cart = cartItems()

const initialCat = route.query.category ? Number(route.query.category) : Number(pInfo.value.curCategory || 0)
const selectedCategory = ref<number>(Number.isFinite(initialCat) ? initialCat : 0)
const searchInput = ref<string>(pInfo.value.searchQuery || '')
const loadingMore = ref(false)
const products = ref<any[]>([])
const lastId = ref<any>(null)
const hasMore = ref(false)
const catalogSource = ref('demo')

const { data: catResponse } = await useFetch('/api/categories')
const categories = computed(() => catResponse.value?.categories || [])

const fetchProducts = async (append = false) => {
  const params = new URLSearchParams()
  if (selectedCategory.value > 0) {
    params.set('category', String(selectedCategory.value))
  }
  if (searchInput.value.trim()) {
    params.set('q', searchInput.value.trim())
  }
  if (append && lastId.value) {
    params.set('lastId', String(lastId.value))
  }

  const res: any = await $fetch(`/api/products?${params.toString()}`)
  catalogSource.value = res.source || 'demo'
  hasMore.value = Boolean(res.hasMore)
  lastId.value = res.lastId ?? null

  if (append) {
    products.value.push(...(res.products || []))
  } else {
    products.value = res.products || []
  }
}

// Initial SSR/CSR load
const { data: initialData } = await useFetch('/api/products', {
  query: {
    category: selectedCategory.value > 0 ? selectedCategory.value : undefined,
    q: searchInput.value.trim() || undefined,
  },
})

if (initialData.value) {
  products.value = initialData.value.products || []
  lastId.value = initialData.value.lastId ?? null
  hasMore.value = Boolean(initialData.value.hasMore)
  catalogSource.value = initialData.value.source || 'demo'
}

const selectCategory = async (catId: number) => {
  selectedCategory.value = catId
  pInfo.value.curCategory = catId
  await fetchProducts(false)
}

const onSearch = async () => {
  pInfo.value.searchQuery = searchInput.value
  await fetchProducts(false)
}

const loadMoreProduct = async () => {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  try {
    await fetchProducts(true)
  } finally {
    loadingMore.value = false
  }
}

const cartCount = computed(() => cart.value.reduce((sum: number, i: any) => sum + i.qty, 0))
</script>

<template>
  <div class="section py-4">
    <div class="container">
      <!-- Hero banner -->
      <div class="p-4 mb-4 rounded-3 text-white" style="background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <span class="badge bg-info text-dark mb-2">QR Offline (EMVCo) + Real-time SSE</span>
            <h2 class="text-white fw-bold mb-2">Thanh toán tự động bằng chuyển khoản QR</h2>
            <p class="mb-0 text-white-50">
              Chọn sản phẩm, tạo mã đơn duy nhất &amp; QR chuyển khoản offline — hệ thống tự động xác nhận ngay khi app <code class="text-warning">auto-payment-android</code> đọc được thông báo ngân hàng.
            </p>
          </div>
          <div class="col-lg-4 text-lg-end mt-3 mt-lg-0 d-flex flex-wrap gap-2 justify-content-lg-end">
            <button v-if="cartCount > 0" class="btn btn-warning fw-semibold" @click="goToCheckout">
              <i class="icon-basket-loaded me-1"></i> Thanh toán ({{ cartCount }})
            </button>
            <NuxtLink to="/admin" class="btn btn-outline-light">
              <i class="ti-dashboard me-1"></i> Mở trang Quản trị
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Category pills & search -->
      <div class="row g-3 align-items-center mb-4">
        <div class="col-lg-8">
          <div class="d-flex flex-wrap gap-2">
            <button
              class="btn btn-sm rounded-pill"
              :class="selectedCategory === 0 ? 'btn-primary' : 'btn-outline-secondary'"
              @click="selectCategory(0)"
            >
              Tất cả
            </button>
            <button
              v-for="cat in categories"
              :key="cat.catid"
              class="btn btn-sm rounded-pill"
              :class="selectedCategory === cat.catid ? 'btn-primary' : 'btn-outline-secondary'"
              @click="selectCategory(cat.catid)"
            >
              {{ cat.display_name }}
            </button>
          </div>
        </div>
        <div class="col-lg-4">
          <form class="input-group input-group-sm" @submit.prevent="onSearch">
            <input
              v-model="searchInput"
              type="search"
              class="form-control"
              placeholder="Tìm sản phẩm..."
              @input="onSearch"
            />
            <button class="btn btn-primary" type="submit">Tìm</button>
          </form>
        </div>
      </div>

      <!-- Product grid -->
      <div v-if="products.length === 0" class="alert alert-info text-center py-4">
        Không tìm thấy sản phẩm nào khớp với bộ lọc hiện tại.
      </div>

      <div v-else class="row g-3">
        <div v-for="p in products" :key="p.item.item_id" class="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-6">
          <ProductItem :product="p" />
        </div>
      </div>

      <div v-if="hasMore" class="text-center mt-4">
        <button id="load-more" class="btn btn-fill-out" :disabled="loadingMore" @click="loadMoreProduct">
          {{ loadingMore ? 'Đang tải...' : 'Xem thêm sản phẩm' }}
        </button>
      </div>

      <div class="text-end mt-3">
        <span class="badge bg-light text-secondary border">
          Catalog source: {{ catalogSource === 'elasticsearch' ? 'Elasticsearch' : 'Built-in Demo Catalog' }}
        </span>
      </div>
    </div>
  </div>
</template>
