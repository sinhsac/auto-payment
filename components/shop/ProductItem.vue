<script setup lang="ts">
import {cartItems} from "~/composables/state";

const cart = cartItems();
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const {product} = props;

const getImgSrc = (product: any) => {
  const prod_imgs = product['product_images']['images'];
  const first_img = prod_imgs[0]
  return `https://down-vn.img.susercontent.com/file/${first_img}`
}

const getProductPrice = (product: any) => {
  return (product.item.price / 100000)
      .toLocaleString('it-IT', {style: 'currency', currency: 'VND'})
      .replace('VND', '');
}

const addToCart = (product: any) => {
  let item = cart.value.find(p => p.id == product.item.item_id)

  let prod = {
    id: product.item.item_id,
    shop_id: product.item.shop_id,
    title: product.item.title,
    price: (product.item.price / 100000),
    strPrice: getProductPrice(product),
    image: getImgSrc(product),
    qty: 1,
  };

  if (!item) {
    item = prod
    cart.value.push(prod);
  } else {
    item.qty = item.qty + 1
  }
}


</script>

<template>
  <div class="product">
    <div class="product_img">
      <a href="shop-product-detail.html">
        <img :src="getImgSrc(product)" :alt="product.item.title">
      </a>
      <div class="product_action_box">
        <ul class="list_none pr_action_btn">
          <li class="add-to-cart"><a href="javascript:;" @click="addToCart(product)"><i class="icon-basket-loaded"></i> Add To Cart</a></li>
          <li><a href="javascript:;" class="popup-ajax"><i class="icon-magnifier-add"></i></a></li>
          <li><a href="javascript:;"><i class="icon-heart"></i></a></li>
        </ul>
      </div>
    </div>
    <div class="product_info">
      <h6 class="product_title"><a href="shop-product-detail.html" :title="product.item.title">{{ product.item.title }}</a></h6>
      <div class="product_price">
        <span class="price">₫ {{ getProductPrice(product) }}</span>
        <div class="on_sale">
          Đã bán {{getCoundSold(product)}}
        </div>
      </div>
      <div class="pr_desc">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus blandit massa enim. Nullam
          id varius nunc id varius nunc.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    getShopeeLink(product: any): string {
      return `https://shopee.vn/product/${product.item.shop_id}/${product.item.item_id}`;
    },
    getCoundSold(product: any): any {
      let sold = product.product_review.historical_sold
      if (sold < 1000) {
        return sold;
      } else if (sold < 1000000) {
        return `${(parseInt(sold) / 1000).toFixed(1)}k`
      } else {
        return (sold / 1000000).toFixed(1) + 'tr'
      }
    }
  }
}
</script>

<style scoped>

</style>