module.exports = {
    apps: [
        {
            name: 'NuxtAppName',
            port: '3030',
            exec_mode: 'cluster',
            instances: 'max',
            script: './.output/server/index.mjs'
        }
    ]
}
