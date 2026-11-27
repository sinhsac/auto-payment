<script setup lang="ts">
const items = cartItems()
const config = useRuntimeConfig()
const router = useRouter()

const form = reactive({
  userName: '',
  address: '',
  phone: '',
  email: '',
  note: '',
  paymentMethod: 'qr' as 'qr' | 'bank_transfer' | 'cod',
})

const submitting = ref(false)
const errorMessage = ref('')

const paymentMethods = computed(() => [
  {
    type: 'qr' as const,
    name: 'Chuyển khoản QR tự động (Khuyên dùng)',
    desc: `Quét mã QR sinh offline (${config.public.bankName}) với đúng số tiền và mã đơn. App auto-payment-android tự xác nhận ngay khi tiền vào.`,
  },
  {
    type: 'bank_transfer' as const,
    name: 'Chuyển khoản ngân hàng',
    desc: `Chuyển khoản tới ${config.public.bankName} — STK ${config.public.bankAccountNo} (${config.public.bankAccountName}) kèm đúng nội dung mã đơn.`,
  },
  {
    type: 'cod' as const,
    name: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Đặt hàng ngay và thanh toán tiền mặt khi giao hàng.',
  },
])

const isCartEmpty = computed(() => items.value.length === 0)

const summary = computed(() => {
  let qty = 0
  let rawTotal = 0
  for (const item of items.value) {
    qty += item.qty
    rawTotal += item.qty * item.price
  }
  return {
    qty,
    rawTotal,
    total: formatToMoney(rawTotal),
  }
})

const updateQty = (item: any, delta: number) => {
  const next = item.qty + delta
  if (next <= 0) {
    const idx = items.value.indexOf(item)
    if (idx >= 0) items.value.splice(idx, 1)
  } else {
    item.qty = next
  }
}

const submitOrder = async () => {
  errorMessage.value = ''
  if (isCartEmpty.value) {
    errorMessage.value = 'Giỏ hàng đang trống.'
    return
  }
  if (!form.userName.trim() || !form.phone.trim() || !form.address.trim()) {
    errorMessage.value = 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng.'
    return
  }

  submitting.value = true
  try {
    const res: any = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        paymentMethod: form.paymentMethod,
        customer: {
          userName: form.userName,
          address: form.address,
          phone: form.phone,
          email: form.email,
          note: form.note,
        },
        items: items.value.map((i: any) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          qty: i.qty,
          image: i.image,
        })),
      },
    })

    const created = res.order
    currentOrder().value = created
    clearCart()
    goToShop()
    await router.push(`/orders/${created.orderCode}`)
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="section py-4">
    <div class="container">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h3 class="mb-0 fw-bold">Thanh toán đơn hàng</h3>
        <button class="btn btn-outline-secondary btn-sm" @click="goToShop">
          ← Tiếp tục mua hàng
        </button>
      </div>

      <div v-if="isCartEmpty" class="alert alert-info py-4 text-center">
        Giỏ hàng đang trống.
        <a href="javascript:;" class="fw-bold ms-1" @click="goToShop">Quay lại cửa hàng để chọn sản phẩm</a>
      </div>

      <form v-else class="row g-4" @submit.prevent="submitOrder">
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm p-4">
            <h5 class="fw-bold mb-3">Thông tin người nhận</h5>

            <div v-if="errorMessage" class="alert alert-danger py-2 small">
              {{ errorMessage }}
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">Họ và tên <span class="text-danger">*</span></label>
              <input v-model="form.userName" type="text" required class="form-control" placeholder="Nguyễn Văn A" />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">Số điện thoại <span class="text-danger">*</span></label>
              <input v-model="form.phone" type="tel" required class="form-control" placeholder="0988 888 888" />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">Địa chỉ nhận hàng <span class="text-danger">*</span></label>
              <input v-model="form.address" type="text" required class="form-control" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">Email (nhận thông tin đơn)</label>
              <input v-model="form.email" type="email" class="form-control" placeholder="ban@example.com" />
            </div>

            <div class="mb-0">
              <label class="form-label small fw-semibold">Ghi chú đơn hàng</label>
              <textarea v-model="form.note" rows="2" class="form-control" placeholder="Ghi chú thêm cho người bán (tùy chọn)"></textarea>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card border-0 shadow-sm p-4">
            <h5 class="fw-bold mb-3">Tóm tắt đơn hàng ({{ summary.qty }} sản phẩm)</h5>

            <div class="table-responsive">
              <table class="table table-sm align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Sản phẩm</th>
                    <th class="text-center" style="width: 110px;">SL</th>
                    <th class="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in items" :key="item.id">
                    <td class="small">{{ item.title }}</td>
                    <td class="text-center">
                      <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-secondary py-0 px-2" @click="updateQty(item, -1)">-</button>
                        <span class="btn btn-light py-0 px-2 disabled">{{ item.qty }}</span>
                        <button type="button" class="btn btn-outline-secondary py-0 px-2" @click="updateQty(item, 1)">+</button>
                      </div>
                    </td>
                    <td class="text-end small fw-semibold">{{ formatToMoney(item.qty * item.price) }} ₫</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="2">Tạm tính</th>
                    <td class="text-end">{{ summary.total }} ₫</td>
                  </tr>
                  <tr>
                    <th colspan="2">Phí vận chuyển</th>
                    <td class="text-end text-success">Miễn phí</td>
                  </tr>
                  <tr class="table-active">
                    <th colspan="2" class="fs-6">Tổng thanh toán</th>
                    <td class="text-end fs-5 fw-bold text-danger">{{ summary.total }} ₫</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h6 class="fw-bold mt-3 mb-2">Phương thức thanh toán</h6>
            <div class="d-flex flex-column gap-2 mb-4">
              <label
                v-for="method in paymentMethods"
                :key="method.type"
                class="border rounded p-3 d-flex align-items-start gap-2 cursor-pointer"
                :class="form.paymentMethod === method.type ? 'border-primary bg-primary bg-opacity-10' : 'bg-white'"
                style="cursor: pointer;"
              >
                <input
                  v-model="form.paymentMethod"
                  type="radio"
                  class="form-check-input mt-1"
                  name="payment_option"
                  :value="method.type"
                />
                <div>
                  <div class="fw-semibold small">{{ method.name }}</div>
                  <div class="text-muted" style="font-size: 0.8rem;">{{ method.desc }}</div>
                </div>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100 fw-semibold" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ submitting ? 'Đang tạo đơn hàng...' : `Đặt hàng ngay (${summary.total} ₫)` }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
