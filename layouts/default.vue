<script setup lang="ts">
import Header from "~/components/common/Header.vue";
import Footer from "~/components/common/Footer.vue";
</script>
<template>
  <div>
    <Header />
    <slot />
    <Footer />
    <a href="#" class="scrollup" style="display: none;"><i class="ion-ios-arrow-up"></i></a>
  </div>
</template>
