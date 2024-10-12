import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { apiApp } from './api'

const app = new Hono()

app.route('/api', apiApp)

app.get('/', (context) => context.json({ hello: 'world' }))
app.get('/api/test', (context) => context.json({ hello: 'test' }))
serve({ port: 3000, fetch: app.fetch }, (i) => console.log(`listening on port ${i.port}...`))

export default app
