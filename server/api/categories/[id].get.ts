export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const id = parseInt(event.context.params.id) as number

    const config = useRuntimeConfig(event)
    let json = {
        "query": {
            "match": {
                "catid": id
            }
        }
    };

    let data = await $fetch(`${config.elasticsearchBaseUrl}/shopee_categories/_search`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${config.elasticsearchToken}`
        },
        body: JSON.stringify(json)
    })

    if (data['hits'] == undefined
        || data['hits']['hits'] == undefined
        || data['hits']['hits'].length == 0
        || data['hits']['hits'][0]['_source'] == undefined) {
        return {}
    }

    return data['hits']['hits'][0]['_source']
})
