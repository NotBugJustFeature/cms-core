<template>
    <AdminDashboard slot-class="p-4 flex flex-col gap-4">
        <a :href="`/collection/${route.params.collection}`">Back to listing</a>
        <h1>{{ isNewPost ? 'Add new' : `Edit ${route.params.collection} (${data.data.id})` }}</h1>

        <div v-if="(config as any)?.schema?.collections?.[route.params.collection as any]">
            <form
                class="space-y-4"
                @submit.prevent="handleSubmit">
                <div
                    v-for="(field, fieldName) in (config as any)?.schema?.collections?.[route.params.collection as any]
                        .fields"
                    :key="fieldName"
                    class="flex flex-col">
                    <label
                        :for="fieldName.toString()"
                        class="text-sm font-medium text-gray-700">
                        {{ fieldName }}
                    </label>
                    <input
                        v-if="field.type === 'Text'"
                        :id="fieldName.toString()"
                        :name="fieldName.toString()"
                        v-model="formData[fieldName]"
                        type="text"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2" />
                </div>
                <div
                    v-for="relation in (config as any).schema.collections[route.params.collection as any]
                        .generatedInfo.relationData"
                    :key="relation.self_field_name"
                    class="flex flex-col gap-2">
                    <h2 class="text-sm font-medium text-gray-700">
                        {{ relation.self_field_name }}
                    </h2>
                    <div>
                        <multiselect
                            v-model="formData[relation.self_field_name]"
                            :options="relationOptions?.[relation.entity_name]?.data || []"
                            :multiple="relation.relation_type === 'many'"
                            track-by="id"
                            :label="(config as any)?.schema?.collections?.[relation.entity_name]?.info?.defaultField"
                            :loading="relationOptions?.[relation.entity_name]?.isLoading"
                            @search-change="updateRelationOptions(relation)"
                            @open="initOptions(relation)"></multiselect>
                    </div>
                </div>
                <div class="flex justify-end">
                    <button
                        type="submit"
                        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        {{ isNewPost ? 'Create' : 'Save' }}
                    </button>
                </div>
            </form>
        </div>
        <div v-else>
            <h1>Collection not found</h1>
        </div>
    </AdminDashboard>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import config from '@config'
import AdminDashboard from '@cms/cms-core/components/AdminDasboard.vue'
import { useRoute, useRouter } from 'vue-router'
import { useAxios } from '@vueuse/integrations'
import Multiselect from 'vue-multiselect'

const route = useRoute()
const router = useRouter()
const formData = ref({})
const relationOptions = ref<any>({})

const isNewPost = computed(() => route.params.id === 'new')

const { data } = !isNewPost.value
    ? useAxios(`${route.params.collection}/${route.params.id}`, config.axiosInstance)
    : { data: ref(null) }

const updateRelationOptions = async (relation: any) => {
    if (!relationOptions.value[relation.entity_name]) {
        relationOptions.value[relation.entity_name] = {
            data: [],
            isLoading: false
        }
    }
    relationOptions.value[relation.entity_name].isLoading = true
    const { data } = await useAxios(`/${relation.entity_name}`, config.axiosInstance)
    relationOptions.value[relation.entity_name].data = data?.value?.data
    relationOptions.value[relation.entity_name].isLoading = false
}

const initOptions = (relation: any) => {
    if (!relationOptions.value[relation.entity_name]) {
        updateRelationOptions(relation)
    }
}

watch(data, (newData) => {
    if (!newData) return
    formData.value = { ...newData.data }
})

const handleSubmit = async () => {
    let query: any = { ...formData.value }

    // Handle relations
    ;(config as any).schema.collections[
        route.params.collection as any
    ].generatedInfo.relationData.forEach((relation: any) => {
        if (!query[relation.self_field_name]) return

        if (relation.relation_type === 'many') {
            query[relation.self_field_name] = {
                set: query[relation.self_field_name].map((item: any) => ({
                    id: item.id
                }))
            }
        } else {
            query[`${relation.self_field_name}Id`] = query[relation.self_field_name].id
            delete query[relation.self_field_name]
        }
    })

    try {
        if (isNewPost.value) {
            const { data } = await useAxios(
                `/${route.params.collection}`,
                {
                    method: 'POST',
                    data: query
                },
                config.axiosInstance
            )
            // Redirect to edit page after creation
            router.push(`/collection/${route.params.collection}/${data.value.data.id}`)
        } else {
            const { data } = await useAxios(
                `/${route.params.collection}/${route.params.id}`,
                {
                    method: 'PUT',
                    data: query
                },
                config.axiosInstance
            )
        }
    } catch (error) {
        console.error('Error saving data:', error)
    }
}
</script>

<style scoped></style>
