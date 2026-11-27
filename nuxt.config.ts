// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  telemetry: false,
  css: [],

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },

  runtimeConfig: {
    // Optional Elasticsearch backend (falls back to built-in catalog when unreachable/unconfigured)
    elasticsearchBaseUrl: '',
    elasticsearchToken: '',

    // VietQR / Bank Transfer settings (override via NUXT_BANK_* env vars)
    bankBin: '970436', // Vietcombank NAPAS BIN (e.g. 970436 VCB, 970422 MB, 970407 TCB, 970416 ACB)
    bankName: 'Vietcombank',
    bankAccountNo: '0123456789',
    bankAccountName: 'AUTO PAYMENT DEMO',
    orderPrefix: 'AP',
    orderExpiryMinutes: 15,

    // Optional webhook secret header (X-Webhook-Secret or Authorization: Bearer <secret>)
    // Leave empty in local development; set a strong token in production!
    webhookSecret: '',

    // Persistent JSON storage directory
    dataDir: 'data',

    public: {
      siteName: 'Auto Payment Store',
      enableDemoSimulator: true,
      bankName: 'Vietcombank',
      bankAccountNo: '0123456789',
      bankAccountName: 'AUTO PAYMENT DEMO',
      supportPhone: '0988 888 888',
      supportEmail: 'support@autopayment.local',
    }
  },

  devtools: { enabled: false }
})
