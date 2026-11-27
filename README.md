# Auto Payment

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.7-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Elasticsearch](https://img.shields.io/badge/Elasticsearch-Search_Backend-005571?logo=elasticsearch&logoColor=white)](https://www.elastic.co/)

An automated payment and e-commerce storefront demo built with **Nuxt**, **Vue 3**, **Nitro server routes**, and **Elasticsearch**. It provides a responsive product catalog with cursor-based pagination, a client-side shopping cart with VND currency formatting, and a multi-step checkout flow supporting QR Code, bank transfer, and Cash on Delivery (COD) payment methods.

> **Legacy Archive**: The original Nuxt 3.11 / Vue 3.4 release is archived under tag/release [`v0.1.0-legacy`](https://github.com/sinhsac/auto-payment/releases/tag/v0.1.0-legacy).

## Key Features

- **Elasticsearch-Backed Product Catalog**: Queries indexed products (`detail_by_pc`) and categories (`shopee_categories`) via Nuxt Nitro server endpoints with `search_after` pagination and item deduplication.
- **Interactive Shopping Cart**: Reactive cart state powered by Nuxt `useState` (`composables/state.js`) with live item counts, removal controls, VND subtotal formatting, and cookie-persisted 6-digit order numbers.
- **Multi-Step Checkout Flow**: Seamless client-side transitions across catalog browsing (`ShopWithTab`), billing details & payment selection (`Checkout`), order payment prompt (`PlaceOrder`), and confirmation (`OrderCompleted`).
- **Multiple Payment Options**: Built-in checkout selection for **QR Code**, **Bank Transfer**, and **COD** payment workflows (with `qrcode` included for QR payment integration).
- **Production-Ready Deployment**: Includes PM2 cluster configuration (`ecosystem.config.cjs`) and Nuxt Nitro server build scripts.

## Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (`^4.7.0`) & [Vue 3](https://vuejs.org/) (`^3.5.46`)
- **Modules & Libraries**: `vue-router`, `vuex`, `qrcode`
- **Search & Data Store**: Elasticsearch REST API (via Nitro `$fetch` and `runtimeConfig`)
- **UI Assets**: Bootstrap, Owl Carousel, Slick, jQuery, and icon fonts in `public/assets/`
- **Process Management**: PM2 (`ecosystem.config.cjs`)

## Project Structure

```text
auto-payment/
├── app.vue                        # Root app layout, SEO metadata, and asset head links
├── nuxt.config.ts                 # Nuxt 3 config & Elasticsearch runtimeConfig
├── local.env                      # Environment variable template for Elasticsearch
├── ecosystem.config.cjs           # PM2 cluster deployment configuration
├── runserver.sh                   # Build & server startup helper script
├── composables/
│   └── state.js                   # Shared cart, navigation state, VND formatting & order ID generator
├── layouts/
│   └── default.vue                # Shared header and footer page layout
├── pages/
│   ├── index.vue                  # Main storefront & checkout view switcher
│   └── lien-he/index.vue          # Contact page route
├── components/
│   ├── common/                    # Header, Footer, ShoppingCart dropdown, Popup modal
│   └── shop/                      # ShopWithTab, ProductItem, Checkout, PlaceOrder, OrderCompleted
├── server/
│   ├── api/
│   │   ├── products.get.ts        # GET /api/products?category=&lastId= (paginated ES product search)
│   │   ├── categories.get.ts      # GET /api/categories (list categories from ES)
│   │   ├── categories/[id].get.ts # GET /api/categories/:id (category lookup by catid)
│   │   └── hello.get.ts           # GET /api/hello (batch category extraction into ES)
│   ├── middleware/                # Request logging (log.ts) and context auth stub (auth.ts)
│   └── utils/handler.ts           # Reusable H3 response wrapper helper
└── public/assets/                 # Static CSS, JS, fonts, and storefront template images
```

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Fetches up to 15 products by `category` ID from the `detail_by_pc` Elasticsearch index; supports cursor pagination via `lastId`. |
| `GET` | `/api/categories` | Lists up to 50 sorted categories from the `shopee_categories` index (filtering excluded IDs). |
| `GET` | `/api/categories/:id` | Returns a single category document matching the numeric `catid`. |
| `GET` | `/api/hello` | Utility handler that scans `detail_by_pc` and indexes distinct categories into `shopee_categories`. |

## Prerequisites

- **Node.js** (v22.22.3+ recommended for Nuxt 4)
- **npm** (or yarn / pnpm / bun)
- An accessible **Elasticsearch** instance containing the `detail_by_pc` and `shopee_categories` indices

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/sinhsac/auto-payment.git
cd auto-payment
npm install
```

### 2. Configure Environment Variables

Copy or adapt the settings from `local.env` into `.env` (or export them in your shell):

```env
NUXT_ELASTICSEARCH_BASE_URL=https://127.0.0.1:9200
NUXT_ELASTICSEARCH_TOKEN=<your-base64-basic-auth-token>
NODE_TLS_REJECT_UNAUTHORIZED=0
```

> **Note**: `NUXT_ELASTICSEARCH_BASE_URL` and `NUXT_ELASTICSEARCH_TOKEN` automatically override `runtimeConfig.elasticsearchBaseUrl` and `runtimeConfig.elasticsearchToken` in `nuxt.config.ts`. Set `NODE_TLS_REJECT_UNAUTHORIZED=0` only in local development with self-signed certificates.

### 3. Run the Development Server

Start the Nuxt development server on `http://localhost:3000`:

```bash
npm run dev
```

You can filter products by category using a query parameter, e.g. `http://localhost:3000/?category=101935`.

## Production & Deployment

Build the production bundle:

```bash
npm run build
```

Preview locally:

```bash
npm run preview
```

Run the compiled Nitro server directly with Node.js:

```bash
node .output/server/index.mjs
```

Or deploy in cluster mode using PM2 (listens on port `3030` per `ecosystem.config.cjs`):

```bash
pm2 start ecosystem.config.cjs
```

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
