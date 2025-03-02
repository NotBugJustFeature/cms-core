import { Hono } from 'hono'
import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import { loadSchema } from './utils/schemaHandler'
import { SchemaJson } from './types/zod'

let schema: SchemaJson = loadSchema('schema_res.json')

console.log(schema)
export const apiApp = new Hono()

Object.keys(schema.collections).forEach((collection: String) => {
    apiApp.get(`/${collection}`, async (context) => {
        return context.json({
            data:
                //@ts-ignore
                (await prisma[collection].findMany({
                    //@ts-ignore
                    include: schema.collections[collection]?.generatedInfo?.selectRelations
                })) || []
        })
    })

    apiApp.get(`/${collection}/:id`, async (context) => {
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
// TODO - add auth
// TODO - add validation
// TODO - add error handling
// TODO - add logging
// TODO - add metrics
// TODO - add openapi
