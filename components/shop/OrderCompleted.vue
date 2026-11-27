<script setup lang="ts">
const props = defineProps<{
  order?: any
}>()

const router = useRouter()
const activeOrder = computed(() => props.order || currentOrder().value)

const continueShopping = () => {
  goToShop()
  router.push('/')
}
</script>

<template>
  <div class="section py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm p-4 p-md-5 text-center">
            <div class="mb-3">
              <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
            </div>

            <h3 class="fw-bold mb-2">
              {{ activeOrder?.status === 'CONFIRMED_COD' ? 'Đặt hàng thành công (COD)!' : 'Thanh toán thành công!' }}
            </h3>

            <p class="text-muted mb-4">
              <template v-if="activeOrder?.status === 'CONFIRMED_COD'">
                Đơn hàng <b>#{{ activeOrder.orderCode }}</b> đã được ghi nhận. Bạn sẽ thanh toán khi nhận hàng.
              </template>
              <template v-else-if="activeOrder">
                Hệ thống đã tự động xác nhận thanh toán cho đơn hàng <b>#{{ activeOrder.orderCode }}</b>.
              </template>
              <template v-else>
                Cảm ơn bạn đã đặt hàng!
              </template>
            </p>

            <div v-if="activeOrder" class="text-start border rounded-3 p-3 mb-4 bg-light">
              <div class="row g-2 small">
                <div class="col-sm-6"><b>Mã đơn:</b> <span class="font-monospace">{{ activeOrder.orderCode }}</span></div>
                <div class="col-sm-6">
                  <b>Trạng thái:</b>
                  <span class="badge bg-success ms-1">{{ activeOrder.status }}</span>
                </div>
                <div class="col-sm-6"><b>Khách hàng:</b> {{ activeOrder.customer?.userName }}</div>
                <div class="col-sm-6"><b>Điện thoại:</b> {{ activeOrder.customer?.phone }}</div>
                <div class="col-12"><b>Địa chỉ:</b> {{ activeOrder.customer?.address }}</div>
                <div class="col-sm-6"><b>Tổng đơn:</b> <span class="fw-bold text-danger">{{ formatToMoney(activeOrder.totalAmount) }} ₫</span></div>
                <div class="col-sm-6"><b>Đã thanh toán:</b> <span class="fw-bold text-success">{{ formatToMoney(activeOrder.paidAmount) }} ₫</span></div>
                <div v-if="activeOrder.paidAt" class="col-12"><b>Thời gian xác nhận:</b> {{ formatDateTime(activeOrder.paidAt) }}</div>
              </div>

              <div v-if="activeOrder.items?.length" class="mt-3">
                <div class="fw-semibold small mb-1">Sản phẩm đã đặt:</div>
                <ul class="list-group list-group-flush small">
                  <li
                    v-for="item in activeOrder.items"
                    :key="item.id"
                    class="list-group-item bg-transparent px-0 d-flex justify-content-between"
                  >
                    <span>{{ item.title }} × {{ item.qty }}</span>
                    <span class="fw-semibold">{{ formatToMoney(item.price * item.qty) }} ₫</span>
                  </li>
                </ul>
              </div>

              <div v-if="activeOrder.payments?.length" class="mt-3 pt-2 border-top small">
                <div class="fw-semibold mb-1">Giao dịch ngân hàng đã khớp:</div>
                <div v-for="p in activeOrder.payments" :key="p.fingerprint" class="text-muted">
                  • <b>{{ p.bankName }}</b>: +{{ formatToMoney(p.amount) }} ₫ ({{ formatDateTime(p.receivedAt) }}) — <code>{{ p.rawMessage }}</code>
                </div>
              </div>
            </div>

            <div class="d-flex flex-wrap justify-content-center gap-2">
              <button class="btn btn-primary px-4" @click="continueShopping">Tiếp tục mua sắm</button>
              <NuxtLink to="/admin" class="btn btn-outline-dark px-4">Xem trong trang Quản trị</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
