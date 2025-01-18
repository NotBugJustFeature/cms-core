import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { cors } from 'hono/cors'
import { apiApp } from './api'

const app = new Hono()

export default {
    app,
    setup: (port = 3000) => {
        // Enable CORS
        app.use(
            '/*',
            cors({
                origin: ['http://localhost:5173'],
                credentials: true
            })
        )

        // API routes
        app.get('/', (context) => context.json({ hello: 'world' }))
        app.route('/api', apiApp)
        app.get('/api/test', (context) => context.json({ hello: 'test' }))
        console.log(process.cwd() + '/dist/admin')
        // Serve admin panel
        app.use('/admin/*', serveStatic({ root: process.cwd() + '/dist/admin' }))
        app.use('/admin/assets/*', serveStatic({ root: process.cwd() + '/dist/admin/assets' }))

        serve({ port, fetch: app.fetch }, (i) => console.log(`listening on port ${i.port}...`))
    }
}
