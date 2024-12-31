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
                    include: schema.collections[collection]?.generatedInfo?.relations
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
                    include: schema.collections[collection]?.generatedInfo?.relations
                })) || {}
        })
    })
    apiApp.delete(`/${collection}/:id`, async (context) => {
        const id = parseInt(context.req.param('id'))
        if (isNaN(id)) {
            return context.json({ error: 'Invalid id' })
        }
        return context.json({
            data:
                //@ts-ignore
                (await prisma[collection].delete({
                    where: {
                        id
                    }
                })) || {}
        })
    })
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
// TODO post - create
// TODO put/{id} - update
// delete/{id} - delete
