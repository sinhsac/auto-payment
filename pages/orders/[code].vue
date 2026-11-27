<script setup lang="ts">
import PlaceOrder from '~/components/shop/PlaceOrder.vue'
import OrderCompleted from '~/components/shop/OrderCompleted.vue'

const route = useRoute()
const code = computed(() => String(route.params.code || '').toUpperCase())

const { data, error, refresh } = await useFetch(() => `/api/orders/${code.value}`)
const order = ref<any>(data.value?.order || null)

watch(data, (val) => {
  if (val?.order) {
    order.value = val.order
  }
})

const onOrderUpdated = (updated: any) => {
  order.value = updated
}
</script>

<template>
  <div class="py-3">
    <div v-if="error || !order" class="container py-5">
      <div class="alert alert-danger text-center">
        <h5>Không tìm thấy đơn hàng #{{ code }}</h5>
        <p class="mb-3 small">Mã đơn hàng không tồn tại hoặc đã bị xóa.</p>
        <NuxtLink to="/" class="btn btn-primary btn-sm">Quay lại cửa hàng</NuxtLink>
      </div>
    </div>

    <PlaceOrder
      v-else-if="order.status === 'PENDING' || order.status === 'UNDERPAID'"
      :order="order"
      @updated="onOrderUpdated"
    />

    <OrderCompleted
      v-else-if="order.status === 'PAID' || order.status === 'CONFIRMED_COD'"
      :order="order"
    />

    <div v-else class="container py-5">
      <div class="card border-0 shadow-sm p-4 text-center mx-auto" style="max-width: 560px;">
        <h4 class="fw-bold mb-2">
          Đơn hàng #{{ order.orderCode }} —
          <span class="badge" :class="order.status === 'EXPIRED' ? 'bg-secondary' : 'bg-danger'">
            {{ order.status }}
          </span>
        </h4>
        <p class="text-muted small mb-4">
          {{ order.status === 'EXPIRED' ? 'Đơn hàng đã hết thời gian thanh toán QR.' : 'Đơn hàng đã bị hủy.' }}
        </p>
        <div class="d-flex justify-content-center gap-2">
          <NuxtLink to="/" class="btn btn-primary btn-sm">Tạo đơn mới</NuxtLink>
          <button class="btn btn-outline-secondary btn-sm" @click="() => refresh()">Tải lại</button>
        </div>
      </div>
    </div>
  </div>
</template>
