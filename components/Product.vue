<script setup lang="ts">

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const {product} = props;

</script>

<template>
  <div class="product-item">
    <div class="product-inner">
      <div class="flex flex-col">
        <img class="thumb" :src="getImgSrc(product)"/>
        <input type="hidden" name="itemId" :value="product.item.item_id"/>
        <div class="product-info flex-col" style="max-width: 100%;">
          <div class="product-title">{{ product.item.title }}</div>
          <div style="min-height: 16px;"></div>
          <div style="min-height: 20px;"></div>
          <div class="flex ext-info">
            <div style="flex-grow: 1; flex-shrink: 0; max-width: 170.8px; box-sizing: border-box;">
              <div class="price">₫ {{ getProductPrice(product) }}</div>
            </div>
            <div style="flex-shrink: 1; min-width: 0px; overflow: hidden; box-sizing: border-box;">Đã bán 1</div>
          </div>
          <div class="flex btn-info" style="line-height: 30px">
            <a style="flex-grow: 1; flex-shrink: 0; max-width: 170.8px; box-sizing: border-box;"
               class="btn-add" >Thêm vào giỏ</a>
            <a style="flex-shrink: 1; min-width: 0px; overflow: hidden; box-sizing: border-box;margin-left: 5px"
               class="btn" target="_blank" :href="getShopeeLink(product)">Shopee link</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    getImgSrc(product: any): any {
      const prod_imgs = product['product_images']['images'];
      const first_img = prod_imgs[0]
      return `https://down-vn.img.susercontent.com/file/${first_img}`
    },
    getProductPrice(product: any): string {
      return (product.item.price / 100000)
          .toLocaleString('it-IT', {style: 'currency', currency: 'VND'})
          .replace('VND', '');
    },
    getShopeeLink(product: any): string {
      return `https://shopee.vn/product/${product.item.shop_id}/${product.item.item_id}`;
    }
  }
}
</script>

<style scoped>
.product-item {
  width: 16.66667%;
  padding: .3125rem;
  box-sizing: border-box;
}

.product-inner {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity));
  box-sizing: border-box;
  border: 0 solid #e5e7eb;
}

.flex-col {
  flex-direction: column;
}

.flex {
  display: flex;
}

.btn-add {
  border: 1px dotted black;
  cursor: pointer;
}

.product-info {
  padding: .5rem;
}

.product-info .ext-info {
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.product-info .price {
  line-height: 1.25rem;
  font-size: 1rem;
  vertical-align: baseline;
  box-sizing: border-box;
  border: 0 solid #e5e7eb;
  --tw-text-opacity: 1;
  color: rgba(238, 77, 45, var(--tw-text-opacity));
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-weight: 400;
}

.product-title {
  line-height: 1.25rem;
  font-size: .875rem;
  overflow-wrap: break-word;
  max-height: 2.5rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>