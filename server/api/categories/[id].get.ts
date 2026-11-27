import { DEMO_CATEGORIES, getDemoCategoryById } from '~/server/utils/catalog'

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, 'id')
  const id = Number.parseInt(String(rawId || ''), 10)
  const config = useRuntimeConfig(event)

  if (config.elasticsearchBaseUrl && config.elasticsearchToken && Number.isFinite(id)) {
    try {
      const data: any = await $fetch(`${config.elasticsearchBaseUrl}/shopee_categories/_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${config.elasticsearchToken}`,
        },
        body: JSON.stringify({ query: { match: { catid: id } } }),
        timeout: 3000,
      })

      const hit = data?.hits?.hits?.[0]?._source
      if (hit) {
        return hit
      }
    } catch {
      // Fall back to built-in catalog
    }
  }

  if (Number.isFinite(id)) {
    const demo = getDemoCategoryById(id)
    if (demo) {
      return demo
    }
  }

  return {
    catid: 0,
    display_name: 'Tất cả sản phẩm',
    description: DEMO_CATEGORIES.map((c) => c.display_name).join(' • '),
  }
})
