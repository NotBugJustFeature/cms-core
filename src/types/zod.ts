import { z } from 'zod'
// import { PrimitiveFieldType } from '../types'

export const ZodPrimitiveFieldValidator = z.enum([
    'Boolean',
    'Int',
    'Float',
    'Text',
    'Textarea',
    'DateTime'
])
export const ZodSchemaInfoEnum = z.enum(['plugin', 'core', 'api'])

export const ZodRelationTypeValidator = z.enum([
    'one-to-one',
    'one-to-many',
    'many-to-one',
    'many-to-many'
])

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
    unique: z.boolean().optional(),
    displayName: z.string().optional(),
    order: z.number().optional()
})

export const ZodCmsConfigValidator = z.object({
    basepath: z.string(),
    plugins: z.array(z.object({ path: z.string(), enabled: z.boolean() }))
})

// like this:
// "info": {
//     "relation": [1],
//     "defaultField": "title",
//     "plugin": {},
// },
//     "generatedInfo": {
//          "from": "core",
//          "relation": [1],
//}

export const ZodRelationType = z.enum(['one', 'many'])

export const ZodSchemaValidator = z.object({
    info: z.object({
        version: z.string(),
        title: z.string(),
        description: z.string().optional(),
        slug: z.string(),
        type: ZodSchemaInfoEnum.default('plugin')
    }),
    collections: z
        .record(
            z.object({
                fields: z.record(ZodEntityFieldValidator),
                info: z.object({ defaultField: z.string() }),
                generatedInfo: z
                    .object({
                        selectRelations: z.record(z.boolean()),
                        relationData: z.array(
                            z.object({
                                entity_name: z.string(),
                                target_field_name: z.string(),
                                self_field_name: z.string(),
                                relation_type: ZodRelationType
                            })
                        ),
                        from: z.string()
                    })
                    .optional()
            })
        )

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
export type CmsConfig = z.infer<typeof ZodCmsConfigValidator>
export type InfoRelationType = z.infer<typeof ZodRelationType>

export const ZodPluginConfigValidator = z.object({
    title: z.string(),
    routes: z.array(
        z.object({
            path: z.string(),
            name: z.string(),
            component: z.function()
        })
    ),
    schemaLocation: z.string().optional()
})

export type Config = z.infer<typeof ZodPluginConfigValidator>
