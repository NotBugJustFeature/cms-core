<template>
    <AdminDashboard slot-class="p-4">
        <h1>Schema Builder</h1>
        <div class="flex gap-2 my-4">
            <button
                class="bg-blue-500 text-white px-4 py-1 rounded"
                @click="isModalOpen = true">
                Show JSON
            </button>
        </div>
        <Teleport to="body">
            <div
                v-if="isModalOpen"
                class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center p-4">
                <div class="bg-white p-4 rounded w-full flex flex-col gap-2 h-full max-w-4xl">
                    <textarea
                        ref="jsonModal"
                        class="w-full h-full p-4 rounded"
                        :value="JSON.stringify(schema, null, 2)" />
                    <div class="flex gap-2">
                        <button
                            class="bg-blue-500 text-white px-4 py-1 rounded"
                            @click="isModalOpen = false">
                            Close
                        </button>
                        <button
                            class="bg-blue-500 text-white px-4 py-1 rounded"
                            @click="saveJson">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-4 p-4 border rounded">
                <h2 class="text-xl">Info</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label>Title</label>
                        <input
                            v-model="schema.info.title"
                            type="text"
                            class="border p-2 rounded" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label>Version</label>
                        <input
                            v-model="schema.info.version"
                            type="text"
                            class="border p-2 rounded" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label>Description</label>
                        <input
                            v-model="schema.info.description"
                            type="text"
                            class="border p-2 rounded" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label>Slug</label>
                        <input
                            v-model="schema.info.slug"
                            type="text"
                            class="border p-2 rounded" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label>Type</label>
                        <select
                            v-model="schema.info.type"
                            class="border p-2 rounded">
                            <option value="plugin">Plugin</option>
                            <option value="core">Core</option>
                            <option value="api">API</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-4 p-4 border rounded">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl">Collections</h2>
                    <button
                        @click="addCollection"
                        class="bg-blue-500 text-white px-4 py-2 rounded">
                        Add Collection
                    </button>
                </div>

                <div
                    v-for="(collection, name) in schema.collections"
                    :key="name"
                    class="border p-4 rounded">
                    <div class="flex justify-between items-center mb-4">
                        <!-- {{ collection }}{{ name }} -->
                        <input
                            :value="name"
                            @change="updateCollectionName(name, $event.target.value)"
                            placeholder="Collection Name"
                            class="border p-2 rounded" />
                        <div>
                            <label class="pr-4">Default Field:</label>
                            <select
                                v-model="collection.info.defaultField"
                                class="border p-2 rounded">
                                <option
                                    v-for="(field, fieldName) in collection.fields"
                                    :key="fieldName"
                                    :value="fieldName">
                                    {{ fieldName }}
                                </option>
                            </select>
                        </div>
                        <button
                            @click="removeCollection(name)"
                            class="text-red-500">
                            Remove
                        </button>
                    </div>

                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg">Fields</h3>
                        <button
                            @click="addField(name)"
                            class="bg-green-500 text-white px-4 py-2 rounded">
                            Add Field
                        </button>
                    </div>

                    <div
                        v-for="(field, fieldName) in collection.fields"
                        :key="fieldName"
                        class="grid grid-cols-3 gap-4 mb-4">
                        <input
                            :value="fieldName"
                            @change="updateFieldName(name, fieldName, $event.target.value)"
                            placeholder="Field Name"
                            class="border p-2 rounded" />
                        <select
                            v-model="field.type"
                            class="border p-2 rounded">
                            <option value="Boolean">Boolean</option>
                            <option value="Int">Int</option>
                            <option value="Float">Float</option>
                            <option value="Text">Text</option>
                            <option value="Textarea">Textarea</option>
                            <option value="DateTime">DateTime</option>
                        </select>
                        <button
                            @click="removeField(name, fieldName)"
                            class="text-red-500">
                            Remove
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-4 p-4 border rounded">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl">Relations</h2>
                    <button
                        @click="addRelation"
                        class="bg-blue-500 text-white px-4 py-2 rounded">
                        Add Relation
                    </button>
                </div>

                <div
                    v-for="(relation, index) in schema.relations"
                    :key="index"
                    class="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 items-center">
                    <div class="flex gap-2 flex-col">
                        <select
                            v-model="relation.source_entity"
                            class="border p-2 rounded">
                            <option
                                v-for="(_, name) in schema.collections"
                                :key="name"
                                :value="name">
                                {{ name }}
                            </option>
                        </select>
                        <input
                            v-model="relation.source_field"
                            placeholder="Source Field"
                            class="border p-2 rounded" />
                    </div>
                    <select
                        v-model="relation.type"
                        class="border p-2 rounded">
                        <option value="one-to-one">One to One</option>
                        <option value="one-to-many">One to Many</option>
                        <option value="many-to-one">Many to One</option>
                        <option value="many-to-many">Many to Many</option>
                    </select>
                    <div class="flex gap-2 flex-col">
                        <select
                            v-model="relation.target_entity"
                            class="border p-2 rounded">
                            <option
                                v-for="(_, name) in schema.collections"
                                :key="name"
                                :value="name">
                                {{ name }}
                            </option>
                        </select>
                        <select
                            v-model="relation.target_field"
                            class="border p-2 rounded">
                            <option
                                v-for="(_, name) in schema.collections[relation.target_entity]
                                    ?.fields"
                                :key="name"
                                :value="name">
                                {{ name }}
                            </option>
                        </select>
                    </div>
                    <button
                        @click="removeRelation(index)"
                        class="text-red-500">
                        remove
                    </button>
                </div>
            </div>
            <Toast />
        </div>
    </AdminDashboard>
</template>

<script setup lang="ts">
import { ref, shallowRef, useTemplateRef } from 'vue'
import AdminDashboard from '@cms/cms-core/components/AdminDasboard.vue'
import SchemaBuilderCollection from '@cms/cms-core/components/SchemaBuilderCollection.vue'
import SchemaBuilderElement from '@cms/cms-core/components/SchemaBuilderElement.vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { SchemaJson } from '@cms/cms-core/src/types/zod'
import { Icon } from '@iconify/vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
const toast = useToast()

const isModalOpen = ref(false)
const jsonModal = ref<HTMLTextAreaElement | null>(null)

const schema = ref<SchemaJson>({
    info: {
        version: '1.0.0',
        title: '',
        description: '',
        slug: '',
        type: 'plugin'
    },
    collections: {
        collection1: {
            fields: {
                field1: {
                    type: 'Text'
                }
            },
            info: {
                defaultField: 'field1'
            }
        },
        collection2: {
            fields: {
                field1: {
                    type: 'Text'
                }
            },
            info: {
                defaultField: 'field1'
            }
        }
    },
    relations: [],
    extends: {}
})

const addCollection = () => {
    const name = `collection_${Object.keys(schema.value.collections).length + 1}`
    schema.value.collections[name] = {
        fields: {},
        info: {
            defaultField: 'field1'
        }
    }
}

const removeCollection = (name: string) => {
    delete schema.value.collections[name]
}

const addField = (collection: string) => {
    const name = `field_${Object.keys(schema.value.collections[collection].fields).length + 1}`
    schema.value.collections[collection].fields[name] = {
        type: 'Text'
    }
}

const removeField = (collection: any, fieldName: string) => {
    delete schema.value.collections[collection].fields[fieldName]
}

const updateCollectionName = (name: string, newName: string) => {
    schema.value.collections[newName] = schema.value.collections[name]
    delete schema.value.collections[name]
    console.log(schema.value.collections)
}

const updateFieldName = (collection: string, fieldName: string, newName: string) => {
    schema.value.collections[collection].fields[newName] =
        schema.value.collections[collection].fields[fieldName]
    delete schema.value.collections[collection].fields[fieldName]
    console.log(schema.value.collections)
}
const addRelation = () => {
    schema.value.relations.push({
        source_entity: '',
        source_field: '',
        target_entity: '',
        target_field: '',
        type: 'one-to-many'
    })
}

const removeRelation = (index: number) => {
    schema.value.relations.splice(index, 1)
}

const saveJson = () => {
    console.log(jsonModal.value?.value)
    try {
        const json = JSON.parse(jsonModal.value?.value || '{}')
        if (json) {
            console.log(json)
            schema.value = json
            toast.add({ severity: 'success', summary: 'Success', detail: 'JSON saved', life: 3000 })
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid JSON', life: 3000 })
        }
    } catch (error) {
        console.error('asd')
        toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid JSON', life: 3000 })
    }
}
</script>
