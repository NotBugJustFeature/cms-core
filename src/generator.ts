import { CmsConfig, SchemaJson, ZodSchemaValidator } from './types/zod'
import { sync } from './types'
import {
    generateSchema,
    loadSchema,
    mergeSchemas,
    validateSchema,
    validateSchemaRelations
} from './utils/schemaHandler'
import { errorBoldColor, okColor } from './utils/utils'
import fs, { write } from 'node:fs'

export function generator(config: CmsConfig) {
    console.log(okColor('Initializing schema loading...'))

    const schemas: SchemaJson[] =
        config?.plugins?.map((plugin) =>
            loadSchema(`${config.basepath}${plugin.path}/schema.json`)
        ) || []

    console.log(okColor('Schema loading completed'))

    let totalErrors = schemas.reduce((acc, schema) => acc + validateSchema(schema, true), 0)

    if (totalErrors > 0) {
        console.log(errorBoldColor(`Total errors: ${totalErrors}`))
        return
    }

    console.log(okColor('Schema validation completed'))

    const mergedSchema = mergeSchemas(schemas)
    console.log(okColor('Schema merging completed'))

    totalErrors = validateSchemaRelations(mergedSchema, true)
    if (totalErrors > 0) {
        console.log(errorBoldColor(`Total errors: ${totalErrors}`))
        return
    }

    console.log(okColor('Schema merge validation completed'))

    fs.writeFileSync('schema_res.json', JSON.stringify(mergedSchema))

    const generatedSchema = generateSchema(mergedSchema)
    const [templateContent, templateErr] = sync(() =>
        fs.readFileSync(`${__dirname}/../prisma/schema.template.prisma`, 'utf8')
    )
    if (templateErr) throw new Error('Unable to read Prisma template')

    const [writeResult, writeErr] = sync(() =>
        fs.writeFileSync(
            `${process.cwd()}/prisma/schema.prisma`,
            `${templateContent}\n${generatedSchema}`
        )
    )
    if (writeErr) throw new Error('Unable to write Prisma schema')
}
