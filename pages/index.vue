<script setup lang="ts">
const { data } = await useFetch('/api/products')
</script>

<template>
  <div v-for="p in data.products">
    <div>{{p.item.item_id}}</div>
    <div>{{p.item.title}}</div>
    <div>{{p.item.price}}</div>
  </div>
  <pre>
    {{data.products}}
  </pre>
</template>

<style scoped>

</style>