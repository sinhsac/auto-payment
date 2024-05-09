<script setup lang="ts">

const items = cartItems();
const paymentInfo = useCookie('payment',  {
  default: () => ({ orderNo: generate_order_no() })
});
const isCartEmpty = () => {
  return items.value.length == 0;
}

const summary = computed(() => {
  let qty = 0;
  let sum = 0;
  items.value.map((item) => {
    qty += item.qty
    sum += item.qty * item.price
  });
  return {
    qty: qty,
    total: formatToMoney(sum),
  };
})

const changePaymentMethod = (item: any) => {
  data.paymentMethod = item.type
  console.log(data.paymentMethod)
}

const data = {
  order: { userName: '', address: '', phone: '', email: '' },
  paymentMethod: 'qr',
  paymentMethods: [
    { type: 'qr', name: 'QR Code', desc: 'Thanh toán trực tiếp bằng QR Code' },
    { type: 'ck', name: 'Chuyển khoản', desc: 'Chuyển khoản tới số tài khoản 123456, sau đó nhắn tin cho chúng tôi qua SDT 09888888888'
    },
    { type: 'cod', name: 'COD', desc: 'Đặt hàng và trả tiền khi nhận hàng' }
  ]
};

</script>

<template>
  <div class="section">
    <div class="container">
      <div class="row" v-if="isCartEmpty()">
        <div class="col-12">
          <div class="alert alert-info">Giỏ hàng đang rỗng [<a href="javascript:;" @click="goToShop()" >nhấn vào đây</a>] để mua hàng </div>
        </div>
      </div>
      <div class="row" v-if="!isCartEmpty()">
        <div class="col-md-6">
          <div class="heading_s1">
            <h4>Chi tiết thanh toán</h4>
          </div>
          <form method="post">
            <div class="form-group mb-3">
              <input type="text" required class="form-control" v-model="data.order.userName"
                     name="fullName" placeholder="Họ tên">
            </div>
            <div class="form-group mb-3">
              <input type="text" class="form-control"
                     name="address" v-model="data.order.address" required="" placeholder="Địa chỉ">
            </div>
            <div class="form-group mb-3">
              <input class="form-control" required type="tel" v-model="data.order.phone"
                     name="phone" placeholder="Số điện thoại">
            </div>
            <div class="form-group mb-3">
              <input class="form-control" required type="email" v-model="data.order.email"
                     name="email" placeholder="Địa chỉ email">
            </div>
          </form>
        </div>
        <div class="col-md-6">
          <div class="order_review">
            <div class="heading_s1">
              <h4>Chi tiết đơn #{{paymentInfo.orderNo}}</h4>
            </div>
            <div class="table-responsive order_table">
              <table class="table">
                <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Tổng</th>
                </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in items" :key="index">
                    <td>{{ item.title }} <span class="product-qty">x {{ item.qty }}</span></td>
                    <td>{{ formatToMoney(item.qty * item.price) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                <tr>
                  <th>Tổng</th>
                  <td class="product-subtotal">{{ formatToMoney(summary.total) }}</td>
                </tr>
                <tr>
                  <th>Phí vận chuyển</th>
                  <td>0</td>
                </tr>
                <tr>
                  <th>Thành tiền</th>
                  <td class="product-subtotal">{{ formatToMoney(summary.total) }}</td>
                </tr>
                </tfoot>
              </table>
            </div>
            <div class="payment_method">
              <div class="heading_s1">
                <h4>Phương thức thanh toán</h4>
              </div>
              <div class="payment_option">
                <div class="custome-radio" v-for="(item, idx) in data.paymentMethods"
                     :key="idx" >
                  <input class="form-check-input" type="radio" name="payment_option"
                         :id="'pay_' + idx"
                         @change="changePaymentMethod(item)"
                         :value="item.type" :checked="item.type == data.paymentMethod" />
                  <label class="form-check-label" :for="'pay_' + idx">{{ item.name }}</label>
                  <p class="payment-text" style="display: block"> {{ item.desc }} </p>
                </div>
              </div>
            </div>
            <a href="javascript:;" @click="goToPlaceOrder()" class="btn btn-fill-out btn-block">Đặt hàng</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

