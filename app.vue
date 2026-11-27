<script setup lang="ts">
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Poppins:400,500,600,700&display=swap', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/css/animate.css', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/bootstrap/css/bootstrap.min.css', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/css/all.min.css', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/css/ionicons.min.css', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/css/themify-icons.css', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/css/linearicons.css', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/css/flaticon.css', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/css/simple-line-icons.css', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/css/style.css', crossorigin: '' },
    { rel: 'stylesheet', href: '/assets/css/responsive.css', crossorigin: '' }
  ],
  script: [
    { src: '/assets/js/jquery-3.7.1.min.js', body: true },
    { src: '/assets/js/popper.min.js', body: true },
    { src: '/assets/bootstrap/js/bootstrap.min.js', body: true },
  ]
})

useSeoMeta({
  title: 'Auto Payment — Self-Hosted Automated Bank Transfer Checkout',
  ogTitle: 'Auto Payment — Self-Hosted Automated Bank Transfer Checkout',
  description: 'Open-source Nuxt 4 storefront with built-in offline EMVCo bank QR generator, real-time SSE payment confirmation, and Android notification listener webhook by Hỗ trợ giải pháp số.',
  ogDescription: 'Open-source Nuxt 4 storefront with built-in offline EMVCo bank QR generator, real-time SSE payment confirmation, and Android notification listener webhook by Hỗ trợ giải pháp số.',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #f8fafc;
}
.header_wrap.fixed-top {
  position: sticky;
  top: 0;
  background-color: #ffffff;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
}
</style>
