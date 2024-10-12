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

const one2one = `
model First {
  id int @id @default(autoincrement())
  name String
  second Second
}

model Second {
  id int @id @default(autoincrement())
  name String
  firstId Int
  first? First @relation(fields: [firstId], references: [id])
}`

describe('one-to-one relation', () => {
    data.relations = [
        {
            source_entity: 'First',
            source_field: 'second',
            target_entity: 'Second',
            target_field: 'first',
            type: 'one-to-one'
        }
    ]

    return expect(generateSchema(data)).toBe(
        'model first {\n  name String\n  secondId Int\n  second? @relation(fields: [secondId], references: [id])\n}\n\nmodel second {\n  name String\n  firstId Int\n  first? @relation(fields: [firstId], references: [id])\n}'
        // `
        //   name String
        //   second? @relation(fields: [secondId], references: [id])
        //   secondId Int @unique
        // }

        // model second {
        //   name String
        //   first? @relation(fields: [firstId], references: [id])
        //   firstId Int @unique
        // }`
    )
})
