import { SchemaJson, ZodSchemaValidator } from './types/zod'
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

export function main() {
    console.log(okColor('Schema loading init...'))

    let schemas: SchemaJson[] = []
    schemas.push(loadSchema(__dirname + '/../schema_core.json'))
    // schemas.push(loadSchema('schema_api.json'))
    // schemas.push(loadSchema('schema_webshop.json'))

    console.log(okColor('Schema loading done'))

    let errorCount = schemas.reduce((acc, schema) => {
        return validateSchema(schema, true) + acc
    }, 0)

    if (errorCount > 0) {
        console.log(errorBoldColor('Error count: ' + errorCount))
        return
    } else {
        console.log(okColor('Schema validation done'))
    }
    const result_schema = mergeSchemas(schemas)
    console.log(okColor('Schema merge done'))
    // console.log(result_schema)

    errorCount = validateSchemaRelations(result_schema, true)
    if (errorCount > 0) {
        console.log(errorBoldColor('Error count: ' + errorCount))
        return
    } else {
        console.log(okColor('Schema merge validation done'))
    }

    fs.writeFileSync('schema_res.json', JSON.stringify(result_schema))
    // console.log()
    // console.log()
    const generatedResult = generateSchema(result_schema)
    let [result, err] = sync(
        fs.readFileSync(__dirname + '/../' + 'prisma/schema.template.prisma', 'utf8')
    )
    if (result == null) {
        throw new Error("Can't read prisma template")
    }

    let [writeResult, writeErr] = sync(
        fs.writeFileSync(
            __dirname + '/../' + 'prisma/schema.prisma',
            result + '\n' + generatedResult
        )
    )
    if (writeErr != null) {
        throw new Error("Can't write prisma schema")
    }
    return
}
//main()
