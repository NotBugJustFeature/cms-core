import { Hono } from 'hono'
import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
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
    relations[field.source_entity].push(field.target_entity)
    relations[field.target_entity].push(field.source_entity)
})
// let relations2: Record<string, Record<string, boolean>> = {}
// Object.keys(relations).forEach((key) => {

//     relations[key].forEach((item) => relations[key][key2] = true)

// console.log('relations', relations)

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
