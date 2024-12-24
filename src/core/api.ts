import { Hono } from 'hono'
import { prisma } from '../../../cms-test/src/prisma'
import { loadSchema } from '../utils/schemaHandler'
import { SchemaJson } from '../types/zod'

let schema: SchemaJson = loadSchema('schema_res.json')
let relations: Record<string, string[]> = {}
schema.relations.forEach((field) => {
    if (!Object.keys(relations).includes(field.source_entity)) {
        relations[field.source_entity] = []
    }
    if (!Object.keys(relations).includes(field.target_entity)) {
        relations[field.target_entity] = []
    }
    relations[field.source_entity].push(field.source_field)
    relations[field.target_entity].push(field.target_field)
})
let relations2: Record<string, Record<string, boolean>> = {}
Object.keys(relations).forEach((key) => {
    relations2[key] = {}
    relations[key].forEach((item) => (relations2[key][item] = true))
})
console.log('relations', relations, relations2)

export const apiApp = new Hono()

apiApp.get('/:collection', async (context) => {
    const { collection } = context.req.param()
    if (!collection || !prisma[collection as keyof typeof prisma]) {
        return context.json({ error: 'Collection not found' })
    }
    return context.json(
        //@ts-ignore
        await prisma[collection.toLowerCase()].findMany({
            include: relations2[collection]
        })
    )
})

// get - read all - done
// TODO get/{id} - read one
// TODO post - create
// TODO put/{id} - update
// TODO delete/{id} - delete
