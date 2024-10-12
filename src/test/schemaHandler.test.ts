import { expect, jest, test, describe } from '@jest/globals'
import { SchemaJson } from '../types/zod'
import { generateSchema } from '../utils/schemaHandler'

let data: SchemaJson = {
    info: {
        version: '1.0.0',
        title: 'Result_schema',
        slug: 'result',
        type: 'core'
    },
    collections: {
        First: {
            fields: {
                name: {
                    type: 'String'
                }
            }
        },
        Second: {
            fields: {
                name: {
                    type: 'String'
                }
            }
        }
    },
    relations: [],
    extends: {}
}

const one2one = `model First {
  id Int @id @default(autoincrement())
  name String? 
  second Second?
}

model Second {
  id Int @id @default(autoincrement())
  name String? 
  firstId Int @unique
  first First @relation(fields: [firstId], references: [id])
}

`
const one2many = `model First {
  id Int @id @default(autoincrement())
  name String? 
  second Second[]
}

model Second {
  id Int @id @default(autoincrement())
  name String? 
  firstId Int
  first First @relation(fields: [firstId], references: [id])
}

`

const many2one = `model First {
  id Int @id @default(autoincrement())
  name String? 
  secondId Int
  second Second @relation(fields: [secondId], references: [id])
}

model Second {
  id Int @id @default(autoincrement())
  name String? 
  first First[]
}

`
const many2many = `model First {
  id Int @id @default(autoincrement())
  name String? 
  second Second[]
}

model Second {
  id Int @id @default(autoincrement())
  name String? 
  first First[]
}

`
describe('Relations', () => {
    data.relations = [
        {
            source_entity: 'First',
            source_field: 'second',
            target_entity: 'Second',
            target_field: 'first',
            type: 'one-to-one'
        }
    ]
    test('one-to-one', () => {
        data.relations[0].type = 'one-to-one'
        expect(generateSchema(data)).toBe(one2one)
    })
    test('one-to-many', () => {
        data.relations[0].type = 'one-to-many'
        expect(generateSchema(data)).toBe(one2many)
    })
    test('many-to-one', () => {
        data.relations[0].type = 'many-to-one'
        expect(generateSchema(data)).toBe(many2one)
    })
    test('many-to-many', () => {
        data.relations[0].type = 'many-to-many'
        expect(generateSchema(data)).toBe(many2many)
    })
})
