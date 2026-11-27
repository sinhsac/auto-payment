import { queryDemoProducts } from '~/server/utils/catalog'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig(event)
  const categoryNum = query.category ? Number.parseInt(String(query.category), 10) : null
  const searchQ = query.q ? String(query.q) : ''

  if (config.elasticsearchBaseUrl && config.elasticsearchToken && !searchQ) {
    try {
      const esQuery: any = {
        query: categoryNum
          ? { match: { 'item.categories.catid': categoryNum } }
          : { match_all: {} },
        sort: [{ 'item.item_id': 'asc' }],
        size: 15,
      }

      if (query.lastId !== undefined && query.lastId !== null && query.lastId !== '') {
        esQuery.search_after = [query.lastId]
      }

      const data: any = await $fetch(
        `${config.elasticsearchBaseUrl}/detail_by_pc/_search?search_type=query_then_fetch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${config.elasticsearchToken}`,
          },
          body: JSON.stringify(esQuery),
          timeout: 3000,
        }
      )

      const hits = data?.hits?.hits || []
      const products = []
      const seen = new Set()
      let lastId = null

      for (const hit of hits) {
        const source = hit._source
        const itemId = source?.item?.item_id
        if (!source || seen.has(itemId)) {
          continue
        }
        seen.add(itemId)
        delete source.item.label_ids
        products.push(source)
        lastId = itemId
      }

      return { source: 'elasticsearch', lastId, hasMore: hits.length === 15, products }
    } catch {
      // Fall back to built-in demo catalog
    }
  }

  const products = queryDemoProducts({
    category: Number.isFinite(categoryNum) && categoryNum! > 0 ? categoryNum : null,
    q: searchQ,
  })

  return {
    source: 'demo',
    lastId: products[products.length - 1]?.item.item_id ?? null,
    hasMore: false,
    products,
  }
})
