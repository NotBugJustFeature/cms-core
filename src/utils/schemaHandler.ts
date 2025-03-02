import { Relation, SchemaJson } from '../types/zod'
import { sync } from '../types'
import { ZodSchemaValidator, EntityFieldType, InfoRelationType } from '../types/zod'
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
    // console.log(fs.existsSync(path), process.cwd(), __dirname)

    const [schemaString, err1] = sync<string>(() =>
        fs.readFileSync(process.cwd() + '/' + path, 'utf8')
    )
    if (err1) {
        throw new Error('Schema file not found: ' + path)
    }
    const [result, err] = sync<SchemaJson>(() => JSON.parse(schemaString))
    if (err) {
        throw new Error('Invalid schema: ' + path + '\n' + err)
    }

    Object.keys(result.collections).forEach((collection: string) => {
        let name: string = convertSchemaName(collection)
        result.collections[name] = result.collections[collection]
        if (name !== collection) delete result.collections[collection]
    })

    result.relations.forEach((relation) => {
        relation.source_entity = convertSchemaName(relation.source_entity)
        relation.target_entity = convertSchemaName(relation.target_entity)
        // result.collections[name] = result.collections[collection]
        // delete result.collections[collection]
    })
    return result //setGeneratedInfo(result)
}

function convertSchemaName(variableName: string): string {
    if (!variableName) return variableName // Handle empty input
    return variableName.charAt(0).toLowerCase() + variableName.slice(1)
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
            //console.log(collection, field.source_entity, field.target_entity, field.type)
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
    // console.log(output)
    return output
}

export function setGeneratedInfo(schema: SchemaJson): SchemaJson {
    let relations: Record<string, string[]> = {}
    let reldata: Record<string, Relation[]> = {}
    schema.relations.forEach((field) => {
        if (!Object.keys(reldata).includes(field.source_entity)) {
            reldata[field.source_entity] = []
        }
        if (!Object.keys(reldata).includes(field.target_entity)) {
            reldata[field.target_entity] = []
        }
        if (!Object.keys(relations).includes(field.source_entity)) {
            relations[field.source_entity] = []
        }
        if (!Object.keys(relations).includes(field.target_entity)) {
            relations[field.target_entity] = []
        }
        relations[field.source_entity].push(field.source_field)
        relations[field.target_entity].push(field.target_field)
        reldata[field.source_entity].push(field)
        reldata[field.target_entity].push(field)
    })

    let relationData: Record<string, { field_name: string; relation_type: InfoRelationType }[]> = {}
    Object.keys(reldata).forEach((entity) => {
        relationData[entity] = reldata[entity].map((relation) => {
            if (relation.source_entity === entity) {
                return {
                    field_name: relation.source_field,
                    relation_type: relation.type.endsWith('one') ? 'one' : 'many'
                }
            } else {
                return {
                    field_name: relation.target_field,
                    relation_type: relation.type.startsWith('one') ? 'one' : 'many'
                }
            }
        })
    })

    // console.log('reldata', reldata)
    // console.log('relationData', relationData)
    let relations2: Record<string, Record<string, boolean>> = {}
    Object.keys(relations).forEach((key) => {
        relations2[key] = {}
        relations[key].forEach((item) => (relations2[key][item] = true))
    })
    console.log('relations', relations, relations2)

    Object.keys(schema.collections).forEach((collection: string) => {
        schema.collections[collection].generatedInfo = {
            selectRelations: relations2[collection] || {},
            relationData: relationData[collection] || [],
            from: ''
        }
    })

    Object.keys(schema.collections).forEach((collection: string) => {
        console.log(schema.collections[collection])
    })

    return schema
}

export function buildField(name: string, field: EntityFieldType): string {
    let output = ''

    output += `  ${name} ${getPrimitiveType(field.type)}`
    !field.required && (output += '?')
    output += ' '
    field.unique && (output += '@unique ')
    field.default && (output += `@default(${generateDefaultValue(field)}) `)

    return output
}

function getPrimitiveType(type: string): string {
    switch (type) {
        case 'Boolean':
            return 'Boolean'
        case 'Int':
            return 'Int'
        case 'Float':
            return 'Float'
        case 'Text':
            return 'String'
        case 'Textarea':
            return 'String'
        case 'DateTime':
            return 'DateTime'
        default:
            return 'String'
    }
}

function generateDefaultValue(field: EntityFieldType): string {
    if (field.type === 'Textarea' || field.type === 'Text') {
        return `"${field.default}"`
    }
    if (['Boolean', 'Int', 'Float', 'DateTime'].includes(field.type)) {
        return `${field.default}`
    }
    return ''
}
function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
