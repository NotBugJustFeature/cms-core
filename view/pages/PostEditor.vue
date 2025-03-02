<template>
    <AdminDashboard>
        <h1>Editor</h1>
        {{ route.params }}
        {{ config?.schema?.collections?.[route.params.collection] }}
        <div
            class="p-4"
            v-if="config?.schema?.collections?.[route.params.collection]">
            <form
                class="space-y-4"
                @submit.prevent="handleSubmit">
                <div
                    v-for="(field, fieldName) in config.schema.collections[route.params.collection]
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
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div
                    v-for="relation in config.schema.collections[route.params.collection]
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
                            label="title"
                            :loading="relationOptions?.[relation.entity_name]?.isLoading"
                            @search-change="updateRelationOptions(relation)"
                            @open="initOptions(relation)"></multiselect>
                    </div>
                </div>
                <div class="flex justify-end">
                    <button
                        type="submit"
                        class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Save
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
import { onMounted, ref, watch } from 'vue'
import config from '@config'
import AdminDashboard from '@cms/cms-core/components/AdminDasboard.vue'
import { useRoute } from 'vue-router'
import { useAxios } from '@vueuse/integrations'
import Multiselect from 'vue-multiselect'

const route = useRoute()
const formData = ref({})
const relationOptions = ref<any>({})

const { data } = useAxios(`${route.params.collection}/${route.params.id}`, config.axiosInstance)

const updateRelationOptions = async (relation: any) => {
    if (!relationOptions.value[relation.entity_name]) {
        relationOptions.value[relation.entity_name] = {
            data: [],
            isLoading: false
        }
    }
    relationOptions.value[relation.entity_name].isLoading = true
    const { data } = await useAxios(`/${relation.entity_name}`, config.axiosInstance)
    console.log(data?.value?.data)
    relationOptions.value[relation.entity_name].data = data?.value?.data
    relationOptions.value[relation.entity_name].isLoading = false
}

const initOptions = (relation: any) => {
    if (!relationOptions.value[relation.entity_name]) {
        updateRelationOptions(relation)
    }
}

watch(data, (newData) => {
    console.log(newData)
    if (newData) {
        formData.value = { ...newData.data }
    }
})

const handleSubmit = () => {
    console.log(formData.value)
}
</script>

<style scoped></style>
