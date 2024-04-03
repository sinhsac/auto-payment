// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    githubToken: '',
    elasticsearchBaseUrl: 'https://127.0.0.1:9200',
    elasticsearchToken: '',
  },
  devtools: { enabled: true }
})
