import { Hono } from 'hono'
import { prisma } from './prisma'
export const apiApp = new Hono()

apiApp.get('/:collection', async (context) => {
    const { collection } = context.req.param()
    if (!collection || !prisma[collection as keyof typeof prisma]) {
        return context.json({ error: 'Collection not found' })
    }
    return context.json(
        //@ts-ignore
        await prisma[collection].findMany({
            // include: {
            //     posts: true
            // }
        })
    )
})
