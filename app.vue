<script setup lang="ts">
useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900&display=swap',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css?family=Poppins:200,300,400,500,600,700,800,900&display=swap',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/animate.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/bootstrap/css/bootstrap.min.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/all.min.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/ionicons.min.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/themify-icons.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/linearicons.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/flaticon.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/simple-line-icons.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/owlcarousel/css/owl.carousel.min.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/owlcarousel/css/owl.theme.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/owlcarousel/css/owl.theme.default.min.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/magnific-popup.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/slick.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/slick-theme.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/style.css',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: '/assets/css/responsive.css',
      crossorigin: ''
    }
  ],
  script: [
    { src: '/assets/js/jquery-3.7.1.min.js', body: true },
    { src: '/assets/js/popper.min.js', body: true },
    { src: '/assets/bootstrap/js/bootstrap.min.js', body: true },
    { src: '/assets/owlcarousel/js/owl.carousel.min.js', body: true },
    { src: '/assets/js/magnific-popup.min.js', body: true },
    { src: '/assets/js/waypoints.min.js', body: true },
    { src: '/assets/js/parallax.js', body: true },
    { src: '/assets/js/jquery.countdown.min.js', body: true },
    { src: '/assets/js/imagesloaded.pkgd.min.js', body: true },
    { src: '/assets/js/isotope.min.js', body: true },
    { src: '/assets/js/jquery.dd.min.js', body: true },
    { src: '/assets/js/slick.min.js', body: true },
    { src: '/assets/js/jquery.elevatezoom.js', body: true },
    { src: '/assets/js/scripts.js', body: true },
  ]
})
useSeoMeta({
  title: 'Auto payment demo',
  ogTitle: 'Auto payment demo',
  description: 'This is my amazing site, let me tell you all about it.',
  ogDescription: 'This is my amazing site, let me tell you all about it.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>