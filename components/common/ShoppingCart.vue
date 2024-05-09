<script setup lang="ts">
const items = cartItems();

const cookie = useCookie('payment',  {
  default: () => ({ orderNo: generate_order_no() })
});

const removeItem = (prod: any) => {
  let item = items.value.find(p => p.id == prod.id);
  if (item) {
    const index = items.value.indexOf(item)
    items.value.splice(index, 1)
  }
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

const startToPayment = () => {
  let orderNo = cookie.value.orderNo;

  goToCheckout();
}

</script>

<template>
  <ul class="navbar-nav attr-nav align-items-center">
    <li class="dropdown cart_dropdown"><a class="nav-link cart_trigger" href="#" data-bs-toggle="dropdown"><i
        class="linearicons-cart"></i><span class="cart_count">{{ summary.qty }}</span></a>
      <div class="cart_box dropdown-menu dropdown-menu-right">
        <ul class="cart_list">
          <li v-for="(item, index) in items" :key="index">
            <a href="javascript:;" class="item_remove" @click.prevent="removeItem(item)"><i class="ion-close"></i></a>
            <a href="javascript:;"><img :src="item.image" alt="cart_thumb1">{{ item.title }}</a>
            <span class="cart_quantity">{{ item.qty }} x {{ item.strPrice }} <span class="cart_amount"> <span class="price_symbole">₫</span></span></span>
          </li>
        </ul>
        <div class="cart_footer">
          <p class="cart_total"><strong>Tổng tiền:</strong> {{ summary.total }} <span class="cart_price"> <span class="price_symbole">đ</span></span></p>
          <p class="cart_buttons">
            <a href="#" class="btn btn-fill-line rounded-0 view-cart">Giỏ hàng</a>
            <a href="#" @click="startToPayment()" class="btn btn-fill-out rounded-0 checkout">Thanh toán</a></p>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>

</style>