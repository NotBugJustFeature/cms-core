import { z } from 'zod'
// import { PrimitiveFieldType } from '../types'

export const ZodPrimitiveFieldValidator = z.enum(['string', 'int', 'boolean'])
export const ZodRelationTypeValidator = z.enum([
    'one-to-one',
    'one-to-many',
    'many-to-one',
    'many-to-many'
])
export const ZodSchemaInfoEnum = z.enum(['plugin', 'core', 'api'])

export const ZodRelationValidator = z.object({
    source_entity: z.string(),
    source_field: z.string(),
    target_entity: z.string(),
    target_field: z.string(),
    type: ZodRelationTypeValidator
})

export const ZodEntityFieldValidator = z.object({
    type: ZodPrimitiveFieldValidator,
    required: z.boolean().optional(),
    default: z.string().optional(),
    unique: z.boolean().optional()
})

export const ZodSchemaValidator = z.object({
    info: z.object({
        version: z.string(),
        title: z.string(),
        description: z.string().optional(),
        slug: z.string(),
        type: ZodSchemaInfoEnum.default('plugin')
    }),
    collections: z
        .record(z.object({ fields: z.record(ZodEntityFieldValidator) }))

        .default({}),
    relations: z.array(ZodRelationValidator).default([]),
    extends: z.record(z.object({ fields: z.record(ZodEntityFieldValidator) })).default({})
})

export type PrimitiveFieldType = z.infer<typeof ZodPrimitiveFieldValidator>
export type SchemaJson = z.infer<typeof ZodSchemaValidator>
export type EntityFieldType = z.infer<typeof ZodEntityFieldValidator>
export type SchemaInfo = z.infer<typeof ZodSchemaInfoEnum>
export type RelationType = z.infer<typeof ZodRelationTypeValidator>
export type Relation = z.infer<typeof ZodRelationValidator>
