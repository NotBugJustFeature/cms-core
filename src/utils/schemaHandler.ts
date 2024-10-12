import { Relation, SchemaJson } from '../types/zod'
import { sync } from '../types'
import { ZodSchemaValidator, EntityFieldType } from '../types/zod'
import fs from 'fs'
import { errorColor, errorBoldColor } from './utils'

import { object, SafeParseReturnType, ZodError } from 'zod'

export function validateSchema(schema: SchemaJson, printError = false): number {
    const res = ZodSchemaValidator.safeParse(schema)
    if (printError && !res.success) {
        printDetailedZodErrors(res, schema)
        return res.error.errors.length
    }
    return 0
}

export function validateSchemaRelations(schema: SchemaJson, printError = false): number {
    validateSchema(schema, printError)

    if (schema.relations) {
        let errors: string[] = []
        const res = schema.relations.reduce((acc, relation) => {
            let res = 0
            if (schema.collections) {
                if (!schema.collections[relation.source_entity]) {
                    errors.push(errorBoldColor(`collection not defined: ${relation.source_entity}`))
                    res += 1
                }
                if (!schema.collections[relation.target_entity]) {
                    errors.push(`collection not defined: ${relation.target_entity}`)
                    res += 1
                }
                if (
                    schema.collections[relation.source_entity] &&
                    schema.collections[relation.source_entity].fields[relation.source_field]
                ) {
                    errors.push(
                        `field already defined: ${relation.source_entity}[${relation.source_field}]`
                    )

                    res += 1
                }
                if (
                    schema.collections[relation.target_entity] &&
                    schema.collections[relation.target_entity].fields[relation.target_field]
                ) {
                    errors.push(
                        `field already defined: ${relation.target_entity}[${relation.target_field}]`
                    )
                    res += 1
                }
            }
            return acc + res
        }, 0)
        if (printError && errors.length > 0) {
            console.log(errorBoldColor(`Relation errors:\n${errors.join('\n')}`))
            console.log()
        }

        return res
    }
    return 0
}

export function printDetailedZodErrors(
    res: SafeParseReturnType<any, any>,
    schema: SchemaJson | undefined = undefined
) {
    if (res.success) return
    const name = schema?.info?.title || ''
    const type = schema?.info?.type || ''
    console.log(errorBoldColor(`{${type}} ${name}`))

    const error = res.error
    console.log(errorColor('Validation failed with the following issues:\n'))

    error.errors.forEach((err, index) => {
        const path = err.path.length > 0 ? err.path.join(' -> ') : 'root'

        console.log(errorColor(`Error ${index + 1}:`))
        console.log(errorColor(`Path: ${path}`))
        console.log(errorColor(`Error Message: ${err.message}\n`))
    })
}

export function loadSchema(path: string): SchemaJson {
    const schemaString = fs.readFileSync(path, 'utf8')
    const [result, err] = sync<SchemaJson>(JSON.parse(schemaString))
    if (err) {
        throw new Error('Invalid schema: ' + path + '\n' + err)
    }
    return result
}

export function mergeSchemas(schemas: SchemaJson[]): SchemaJson {
    let result: SchemaJson = {
        info: {
            version: '1.0.0',
            title: 'Result_schema',
            slug: 'result',
            type: 'core'
        },
        collections: {},
        relations: [],
        extends: {}
    }

    schemas.forEach((schema) => {
        result.collections = {
            ...result.collections,
            ...schema.collections
        }
        if (schema.relations && result.relations)
            result.relations = result.relations.concat(schema.relations)
    })
    schemas.forEach((schema) => {
        if (schema.extends) {
            Object.keys(schema.extends).forEach((extend: string) => {
                if (schema.extends && result.collections) {
                    if (!result.collections[extend]) {
                        console.log(errorBoldColor(`Schema merge collection undefined: ${extend}`))
                    } else {
                        result.collections[extend].fields = {
                            ...result.collections[extend].fields,
                            ...schema.extends[extend].fields
                        }
                    }
                }
            })
        }
    })

    return result as SchemaJson
}
export function generateSchema(schema: SchemaJson): String {
    let output = ''
    Object.keys(schema.collections).forEach((collection: string) => {
        const fields = schema.collections[collection].fields
        let model = `model ${collection} {\n`
        model += '  id Int @id @default(autoincrement())\n'

        Object.keys(fields).forEach((field) => {
            // console.log(collection, field)
            model += buildField(field, fields[field]) + '\n'
        })

        // Object.keys(fields).forEach((field) => {
        //     console.log(collection, field)
        //     model += buildField(field, fields[field]) + '\n'
        // })
        schema.relations.forEach((field) => {
            console.log(collection, field.source_entity, field.target_entity, field.type)
            if (field.source_entity === collection) {
                if (field.type === 'many-to-many' || field.type === 'one-to-many') {
                    model += `  ${field.source_field} ${field.target_entity}[]\n`
                } else if (field.type === 'many-to-one') {
                    model += `  ${field.source_field}Id Int\n`
                    model += `  ${field.source_field} ${field.target_entity} @relation(fields: [${field.source_field}Id], references: [id])\n`
                } else if (field.type === 'one-to-one') {
                    model += `  ${field.source_field} ${field.target_entity}?\n`
                }
            } else if (field.target_entity === collection) {
                if (field.type === 'many-to-many' || field.type === 'many-to-one') {
                    model += `  ${field.target_field} ${field.source_entity}[]\n`
                } else if (field.type === 'one-to-many' || field.type === 'one-to-one') {
                    model += `  ${field.target_field}Id Int${
                        field.type === 'one-to-one' ? ' @unique' : ''
                    }\n`
                    model += `  ${field.target_field} ${field.source_entity} @relation(fields: [${field.target_field}Id], references: [id])\n`
                }
            }
        })

        model += `}`
        output += model + '\n\n'
    })
    console.log(output)
    return output
}
export function buildField(name: string, field: EntityFieldType): string {
    let output = ''

    output += `  ${name} ${field.type}`
    !field.required && (output += '?')
    output += ' '
    field.unique && (output += '@unique ')
    field.default && (output += `@default(${generateDefaultValue(field)}) `)

    return output
}
function generateDefaultValue(field: EntityFieldType): string {
    if (field.type === 'String') {
        return `"${field.default}"`
    }
    if (['Boolean', 'Int', 'Float', 'DateTime'].includes(field.type)) {
        //     field.type === 'Boolean' ||
        //     field.type === 'Int' ||
        //     field.type === 'Float' ||
        //     field.type === 'DateTime'
        // ) {
        return `${field.default}`
    }
    return ''
}
function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
