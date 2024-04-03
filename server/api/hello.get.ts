import {da} from "cronstrue/dist/i18n/locales/da";

export default defineEventHandler(async (event) => {
    const query = getQuery(event)

    //"search_after": [ 299843479 ],

    let lastId = null;
    let canRun = true
    let res = null;
    let cates = [];
    let total = 0;
    while (canRun) {
        let json = {
            "query": { "match_all": {} },
            "_source": [
                "item.categories.catid",
                "item.categories.display_name"
            ],
            "sort": [ { "item.item_id": "asc" } ],
            "size": 2000
        }
        if (lastId != null) {
            json['search_after'] = [ lastId ];
        }
        const config = useRuntimeConfig(event)
        const url = `${config.elasticsearchBaseUrl}/detail_by_pc/_search?search_type=query_then_fetch`
        const repo = await $fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${config.elasticsearchToken}`
            },
            body: JSON.stringify(json)
        })
        let data = repo['hits']['hits'];
        res = data;
        total += data.length
        console.log(`data.length after ${lastId} = ${data.length}, total = ${total}`)
        canRun = data.length > 0
        if (canRun) {
            for (const item of data) {
                const categories = item['_source']['item']['categories']
                for (const cate of categories) {
                    if (cates.indexOf(cate.catid) >= 0) {
                        continue;
                    }
                    cates.push(cate.catid);
                    const nurl = `${config.elasticsearchBaseUrl}/shopee_categories/_create/${cate.catid}`
                    try {
                        const tmp = await $fetch(nurl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Basic ${config.elasticsearchToken}`
                            },
                            body: JSON.stringify(cate)
                        })
                    } catch (ignored) {
                        
                    }
                }
                lastId = item['sort'][0]
            }
        }
    }

    return {
        res,
        hello: 'world',
        hehe: 'Im ok'
    }
})
