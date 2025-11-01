import { Hono } from 'hono'
import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import { loadSchema } from './utils/schemaHandler'
import { SchemaJson } from './types/zod'
import { hash, compare } from 'bcrypt'
import { getCookie, getSignedCookie, setCookie, setSignedCookie, deleteCookie } from 'hono/cookie'
import { decode, sign, verify } from 'hono/jwt'
import Permission_handler from './permission_handler'

import qs from 'qs'

let schema: SchemaJson = loadSchema('schema_res.json')

console.log(schema)
export const apiApp = new Hono()

// prisma.user.findMany({
//     where: {
//         name: 'zizicuca'
//     }
// })

apiApp.get('/asd', async (context) => {
    await prisma.user.update({
        where: {
            id: 1
        },
        data: {
            posts: {
                set: [{ id: 1 }]
            }
        }
    })
    return context.json({})
})

// apiApp.get('/:collection', async (context) => {
//     const { collection } = context.req.param()
//     if (!collection || !prisma[collection as keyof typeof prisma]) {
//         return context.json({ error: 'Collection not found' })
//     }
//     return context.json(
//         //@ts-ignore
//         await prisma[collection.toLowerCase()].findMany({
//             include: schema.collections[collection]?.generatedInfo?.relations
//         })
//     )
// })

// get - read all - done
// get/{id} - read one - done
// post - create
// put/{id} - update
// delete/{id} - delete
// TODO - add loggings
// TODO - add metrics
// TODO - add openapi

apiApp.post('/login', async (context) => {
    const { username, password } = await context.req.json()
    // console.log(username, password)
    if (!username || !password) return context.json({ error: 'Username and password are required' })
    const user = await prisma.user.findFirst({
        where: {
            name: username
        }
    })
    // console.log(user)
    if (!user) return context.json({ error: 'User not found' })
    if (!(await compare(password, user.password as string)))
        return context.json({ error: 'Invalid password' })

    const token = await sign({ id: user.id }, process.env.JWT_SECRET || 'changeme')
    setCookie(context, 'token', token)
    return context.json(user)
})

apiApp.post('/register', async (context) => {
    const { username, password } = await context.req.json()
    const existingUsers = await prisma.user.count()
    // console.log(existingUsers)
    if (existingUsers > 0) {
        return context.json({ error: 'Registration is disabled' })
    }
    if (!username || !password) return context.json({ error: 'Username and password are required' })
    const isUser = await prisma.user.findFirst({
        where: {
            name: username
        }
    })
    if (isUser) return context.json({ error: 'User already exists' })
    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
        data: { name: username, password: hashedPassword }
    })
    return context.json(user)
})

apiApp.get('/is_init_mode', async (context) => {
    return context.json({ isInitMode: false })
    const existingUsers = await prisma.user.count()

    return context.json({ isInitMode: existingUsers == 0 })
})

apiApp.get('/logout', async (context) => {
    deleteCookie(context, 'token')
    return context.json({})
})

apiApp.get('/is_authenticated', async (context) => {
    const token = getCookie(context, 'token')
    if (!token) return context.json({ isAuthenticated: false })
    const decoded = await verify(token, process.env.JWT_SECRET || 'changeme')
    const user = await prisma.user.findFirst({
        where: {
            id: decoded.id as number
        }
    })
    if (!user) return context.json({ isAuthenticated: false })
    return context.json({ isAuthenticated: true, user: user })
})

function normalizeTypes(obj: any): any {
    if (Array.isArray(obj)) return obj.map(normalizeTypes)
    if (obj && typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, normalizeTypes(v)]))
    }
    if (obj === 'true') return true
    if (obj === 'false') return false
    return obj
}

Object.keys(schema.collections).forEach((collection: String) => {
    apiApp.get(`/${collection}`, async (context) => {
        const allowed = await Permission_handler.check(collection as string, 'readAll', context)
        if (
            (!allowed && typeof allowed === 'boolean') ||
            (typeof allowed === 'object' && allowed.allowed == false)
        ) {
            return context.json({ error: 'Forbidden' }, 403)
        }

        const rawQuery = context.req.url.split('?')[1] || ''
        const query = qs.parse(rawQuery)
        const cmsHeader = context.req.header('X-CMS')

        // ✅ Normalize "true"/"false" → boolean
        const parsedQuery = normalizeTypes(query)

        // ✅ Add default include if header is present
        if (cmsHeader === 'true' && !('include' in parsedQuery)) {
            // @ts-ignore
            parsedQuery.include = schema.collections[collection]?.generatedInfo?.selectRelations
        }

        try {
            // @ts-ignore
            const data = await prisma[collection].findMany({
                ...parsedQuery,
                ...(typeof allowed === 'object' ? allowed?.queryOverride : {})
            })

            return context.json({ data })
        } catch (err) {
            console.error(err)
            return context.json({ error: 'Invalid query or collection' }, 400)
        }
    })

    apiApp.get(`/${collection}/:id`, async (context) => {
        const allowed = await Permission_handler.check(collection as string, 'read', context)
        if (
            (!allowed && typeof allowed === 'boolean') ||
            (typeof allowed === 'object' && allowed.allowed == false)
        ) {
            return context.json({ error: 'Forbidden' }, 403)
        }
        const id = parseInt(context.req.param('id'))
        if (isNaN(id)) {
            return context.json({ error: 'Invalid id' })
        }

        return context.json({
            data:
                //@ts-ignore
                (await prisma[collection].findFirst({
                    where: {
                        id
                    },
                    //@ts-ignore
                    include: schema.collections[collection]?.generatedInfo?.selectRelations
                })) || {
                    error: {
                        type: 'not_found',
                        message: `${collection} with id ${id} not found`
                    }
                }
        })
    })

    apiApp.delete(`/${collection}/:id`, async (context) => {
        const allowed = await Permission_handler.check(collection as string, 'delete', context)
        if (
            (!allowed && typeof allowed === 'boolean') ||
            (typeof allowed === 'object' && allowed.allowed == false)
        ) {
            return context.json({ error: 'Forbidden' }, 403)
        }

        const id = parseInt(context.req.param('id'))
        if (isNaN(id)) {
            return context.json({ error: 'Invalid id' })
        }
        try {
            //@ts-ignore
            const result = await prisma[collection].delete({
                where: {
                    id
                }
            })
            return context.json({
                data: result
            })
        } catch (error) {
            return context.json({ error: error }, 500)
        }
    })

    apiApp.post(`/${collection}`, async (context) => {
        const allowed = await Permission_handler.check(collection as string, 'create', context)
        if (
            (!allowed && typeof allowed === 'boolean') ||
            (typeof allowed === 'object' && allowed.allowed == false)
        ) {
            return context.json({ error: 'Forbidden' }, 403)
        }
        const data = await context.req.json()
        console.log(data)

        try {
            return context.json({
                data:
                    //@ts-ignore
                    (await prisma[collection].create({ data })) || {}
            })
        } catch (error) {
            return context.json(
                {
                    data: {},
                    error: error,
                    info: {}
                },
                500
            )
        }
    })

    apiApp.put(`/${collection}/:id`, async (context) => {
        const allowed = await Permission_handler.check(collection as string, 'update', context)
        if (
            (!allowed && typeof allowed === 'boolean') ||
            (typeof allowed === 'object' && allowed.allowed == false)
        ) {
            return context.json({ error: 'Forbidden' }, 403)
        }
        const id = parseInt(context.req.param('id'))
        if (isNaN(id)) {
            return context.json({ error: 'Invalid id' })
        }

        const data = await context.req.json()

        try {
            return context.json({
                data:
                    //@ts-ignore
                    (await prisma[collection].update({
                        where: {
                            id
                        },
                        data
                    })) || {}
            })
        } catch (error) {
            return context.json(
                {
                    data: {},
                    error: error,
                    info: {}
                },
                500
            )
        }
    })
})
