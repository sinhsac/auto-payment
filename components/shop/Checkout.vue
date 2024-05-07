<script setup lang="ts">

const items = cartItems();
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

const data = {
  userName: '',
  address: '',
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
              <input type="text" required class="form-control" v-model="data.userName" name="fullName" placeholder="Họ tên">
            </div>
            <div class="form-group mb-3">
              <input type="text" class="form-control" name="address" v-model="data.address" required="" placeholder="Địa chỉ">
            </div>
            <div class="form-group mb-3">
              <input class="form-control" required type="tel" name="phone" placeholder="Số điện thoại">
            </div>
            <div class="form-group mb-3">
              <input class="form-control" required type="email" name="email" placeholder="Địa chỉ email">
            </div>
            <div class="ship_detail">
              <div class="form-group mb-3">
                <div class="chek-form">
                  <div class="custome-checkbox">
                    <input class="form-check-input" type="checkbox" name="checkbox" id="differentaddress">
                    <label class="form-check-label label_info" for="differentaddress"><span>Địa chỉ nhận là địa chỉ mua hàng?</span></label>
                  </div>
                </div>
              </div>
              <div class="different_address">
                <div class="form-group mb-3">
                  <input type="text" required class="form-control" name="fullName" placeholder="Họ tên">
                </div>
                <div class="form-group mb-3">
                  <input type="text" class="form-control" name="address" required="" placeholder="Địa chỉ">
                </div>
                <div class="form-group mb-3">
                  <input class="form-control" required type="tel" name="phone" placeholder="Số điện thoại">
                </div>
                <div class="form-group mb-3">
                  <input class="form-control" required type="email" name="email" placeholder="Địa chỉ email">
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="col-md-6">
          <div class="order_review">
            <div class="heading_s1">
              <h4>Thông tin đặt hàng</h4>
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
                <div class="custome-radio">
                  <input class="form-check-input" type="radio" name="payment_option" id="exampleRadios5" value="option5" checked="">
                  <label class="form-check-label" for="exampleRadios5">QR Code</label>
                  <p data-method="option5" class="payment-text" style="display: block">
                    Thanh toán trực tiếp
                  </p>
                </div>
                <div class="custome-radio">
                  <input class="form-check-input" required="" type="radio" name="payment_option" id="exampleRadios3" value="option3" >
                  <label class="form-check-label" for="exampleRadios3">Chuyển khoản</label>
                  <p data-method="option3" class="payment-text">
                    Chuyển khoản tới số tài khoản 123456, sau đó nhắn tin cho chúng tôi qua SDT 09888888888
                  </p>
                </div>
                <div class="custome-radio">
                  <input class="form-check-input" type="radio" name="payment_option" id="exampleRadios4" value="option4">
                  <label class="form-check-label" for="exampleRadios4">COD</label>
                  <p data-method="option4" class="payment-text">Đặt hàng và trả tiền khi nhận hàng</p>
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

<script>

</script>

<style scoped>

</style>