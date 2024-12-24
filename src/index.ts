import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { apiApp } from './api'

const app = new Hono()

export default {
    app,
    setup: (port = 3000) => {
        app.get('/', (context) => context.json({ hello: 'world' }))
        app.route('/api', apiApp)
        app.get('/api/test', (context) => context.json({ hello: 'test' }))
        serve({ port, fetch: app.fetch }, (i) => console.log(`listening on port ${i.port}...`))
    }
}
