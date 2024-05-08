export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const config = useRuntimeConfig(event)
    let json = {
        "sort": [ { "catid": "asc" } ],
        "size": 50
    };

    let data = await $fetch(`${config.elasticsearchBaseUrl}/shopee_categories/_search?search_type=query_then_fetch`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${config.elasticsearchToken}`
        },
        body: JSON.stringify(json)
    })
    let categories = [];
    data = data['hits']['hits'];
    let lastId = null;
    const ignoredCategories = [
        100020, 100036, 100055, 100008, 100046
    ];
    for (const item of data) {
        let source = item['_source']
        let categoryId = source['catid'];
        if (ignoredCategories.indexOf(categoryId) >= 0) {
            continue;
        }
        categories.push(source);
        lastId = item['sort'][0]
    }

    return {
        lastId,
        categories,
    }
})
