<script setup lang="ts">
const cart = cartItems()
const justAdded = ref(false)

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const getImgSrc = (product: any) => {
  if (product?.product_images?.directUrl) {
    return product.product_images.directUrl
  }
  const prodImgs = product?.product_images?.images || []
  if (prodImgs.length > 0) {
    return `https://down-vn.img.susercontent.com/file/${prodImgs[0]}`
  }
  return '/assets/images/logo_dark.png'
}

const getUnitPrice = (product: any): number => {
  const raw = Number(product?.item?.price || 0)
  return raw >= 10000000 ? Math.round(raw / 100000) : Math.round(raw)
}

const getCountSold = (product: any): string => {
  const sold = Number(product?.product_review?.historical_sold || 0)
  if (sold < 1000) return String(sold)
  if (sold < 1000000) return `${(sold / 1000).toFixed(1)}k`
  return `${(sold / 1000000).toFixed(1)}tr`
}

const addToCart = () => {
  const product = props.product
  const unitPrice = getUnitPrice(product)
  const existing = cart.value.find((p: any) => p.id === product.item.item_id)

  if (!existing) {
    cart.value.push({
      id: product.item.item_id,
      shop_id: product.item.shop_id,
      title: product.item.title,
      price: unitPrice,
      strPrice: formatToMoney(unitPrice),
      image: getImgSrc(product),
      qty: 1,
    })
  } else {
    existing.qty += 1
  }

  justAdded.value = true
  setTimeout(() => {
    justAdded.value = false
  }, 1200)
}
</script>

<template>
  <div class="card h-100 border-0 shadow-sm product-card">
    <div class="position-relative overflow-hidden" style="border-radius: 8px 8px 0 0;">
      <img
        :src="getImgSrc(product)"
        :alt="product.item.title"
        class="card-img-top"
        style="aspect-ratio: 1 / 1; object-fit: cover;"
      />
    </div>
    <div class="card-body d-flex flex-column p-3">
      <h6 class="card-title mb-1 text-truncate-2" :title="product.item.title" style="min-height: 2.5rem; font-size: 0.92rem;">
        {{ product.item.title }}
      </h6>
      <p v-if="product.item.description" class="text-muted small mb-2 text-truncate-2" style="font-size: 0.78rem;">
        {{ product.item.description }}
      </p>
      <div class="mt-auto">
        <div class="d-flex align-items-baseline justify-content-between mb-2">
          <span class="fw-bold text-danger">{{ formatToMoney(getUnitPrice(product)) }} ₫</span>
          <span class="text-muted" style="font-size: 0.75rem;">Đã bán {{ getCountSold(product) }}</span>
        </div>
        <button
          type="button"
          class="btn btn-sm w-100"
          :class="justAdded ? 'btn-success' : 'btn-dark'"
          @click="addToCart"
        >
          <i :class="justAdded ? 'fas fa-check me-1' : 'icon-basket-loaded me-1'"></i>
          {{ justAdded ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1) !important;
}
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
