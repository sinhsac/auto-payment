export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const config = useRuntimeConfig(event)
    //"aggs": { "distinct_values": { "terms": { "field": "item.item_id" } } },
    console.log("category :: ", query)
    let json = {
        "query": {
            "match": {
                "item.categories.catid": query.category
            }
        },
        "sort": [ { "item.item_id": "asc" } ],
        "size": 15
    };

    if (query.lastId != undefined && query.lastId != null && query.lastId != '') {
        json.search_after = [ query.lastId ];
    }

    let data = await $fetch(`${config.elasticsearchBaseUrl}/detail_by_pc/_search?search_type=query_then_fetch`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${config.elasticsearchToken}`
        },
        body: JSON.stringify(json)
    })
    let products = [];

    if (data['hits'] == undefined || data['hits']['hits'] == undefined) {
        return {
            lastId: null,
            products: [],
        }
    }

    data = data['hits']['hits'];
    let lastId = null;
    let items = [];
    for (const item of data) {
        let source = item['_source']
        if (items.indexOf(source['item']['item_id']) >= 0) {
            continue;
        }
        items.push(source['item']['item_id']);
        delete source['item']['label_ids']
        products.push(source);
        lastId = source['item']['item_id']
    }

    return {
        lastId,
        products,
    }
})
