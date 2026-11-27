<script setup lang="ts">
const items = cartItems()
const router = useRouter()

const removeItem = (prod: any) => {
  const index = items.value.findIndex((p: any) => p.id === prod.id)
  if (index >= 0) {
    items.value.splice(index, 1)
  }
}

const updateQty = (prod: any, delta: number) => {
  const item = items.value.find((p: any) => p.id === prod.id)
  if (!item) return
  const next = item.qty + delta
  if (next <= 0) {
    removeItem(prod)
  } else {
    item.qty = next
  }
}

const summary = computed(() => {
  let qty = 0
  let sum = 0
  for (const item of items.value) {
    qty += item.qty
    sum += item.qty * item.price
  }
  return {
    qty,
    rawTotal: sum,
    total: formatToMoney(sum),
  }
})

const startToPayment = () => {
  goToCheckout()
  router.push('/')
}
</script>

<template>
  <ul class="navbar-nav attr-nav align-items-center">
    <li class="dropdown cart_dropdown">
      <a class="nav-link cart_trigger" href="#" data-bs-toggle="dropdown">
        <i class="linearicons-cart"></i>
        <span class="cart_count">{{ summary.qty }}</span>
      </a>
      <div class="cart_box dropdown-menu dropdown-menu-end" style="min-width: 340px;">
        <div v-if="items.length === 0" class="p-3 text-center text-muted small">
          Giỏ hàng của bạn đang trống.
        </div>
        <template v-else>
          <ul class="cart_list" style="max-height: 280px; overflow-y: auto;">
            <li v-for="item in items" :key="item.id">
              <a href="javascript:;" class="item_remove" @click.prevent.stop="removeItem(item)" title="Xóa">
                <i class="ion-close"></i>
              </a>
              <a href="javascript:;" class="d-flex align-items-center">
                <img :src="item.image" :alt="item.title" style="width: 52px; height: 52px; object-fit: cover; border-radius: 6px;" />
                <span class="small">{{ item.title }}</span>
              </a>
              <div class="d-flex align-items-center justify-content-between mt-1">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary py-0 px-2" @click.stop="updateQty(item, -1)">-</button>
                  <span class="btn btn-light py-0 px-2 disabled">{{ item.qty }}</span>
                  <button class="btn btn-outline-secondary py-0 px-2" @click.stop="updateQty(item, 1)">+</button>
                </div>
                <span class="cart_quantity fw-semibold">{{ formatToMoney(item.qty * item.price) }} ₫</span>
              </div>
            </li>
          </ul>
          <div class="cart_footer">
            <p class="cart_total">
              <strong>Tổng tiền:</strong>
              <span class="cart_price text-danger fw-bold">{{ summary.total }} ₫</span>
            </p>
            <p class="cart_buttons">
              <a href="javascript:;" @click.prevent="startToPayment" class="btn btn-fill-out rounded-0 checkout w-100">
                Tiến hành thanh toán
              </a>
            </p>
          </div>
        </template>
      </div>
    </li>
  </ul>
</template>
