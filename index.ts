import { Config } from './src/types/zod'

export default {
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./view/pages/dashboard.vue')
        },
        {
            path: '/collection/:collection',
            name: 'collection',
            component: () => import('./view/pages/PostListing.vue')
        },
        {
            path: '/collection/:collection/:id',
            name: 'collection-edit',
            component: () => import('./view/pages/PostEditor.vue')
        }
    ],
    title: 'core',
    schemaLocation: './schema.json'
} as Config
