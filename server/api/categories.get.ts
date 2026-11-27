import { DEMO_CATEGORIES } from '~/server/utils/catalog'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (config.elasticsearchBaseUrl && config.elasticsearchToken) {
    try {
      const data: any = await $fetch(
        `${config.elasticsearchBaseUrl}/shopee_categories/_search?search_type=query_then_fetch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${config.elasticsearchToken}`,
          },
          body: JSON.stringify({ sort: [{ catid: 'asc' }], size: 50 }),
          timeout: 3000,
        }
      )

      const hits = data?.hits?.hits || []
      const ignoredCategories = [100020, 100036, 100055, 100008, 100046]
      const categories = []
      let lastId = null

      for (const item of hits) {
        const source = item._source
        if (!source || ignoredCategories.includes(source.catid)) {
          continue
        }
        categories.push(source)
        lastId = item.sort?.[0] ?? null
      }

      if (categories.length > 0) {
        return { source: 'elasticsearch', lastId, categories }
      }
    } catch {
      // Fall back to built-in demo catalog when Elasticsearch is unreachable
    }
  }

  return {
    source: 'demo',
    lastId: DEMO_CATEGORIES[DEMO_CATEGORIES.length - 1]?.catid ?? null,
    categories: DEMO_CATEGORIES,
  }
})
