// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: [],
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
  runtimeConfig: {
    githubToken: '',
    elasticsearchBaseUrl: 'https://127.0.0.1:9200',
    elasticsearchToken: '',
  },
  devtools: { enabled: true }
})
