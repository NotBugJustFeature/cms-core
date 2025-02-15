<template>
    <AdminDashboard>
        <h1>Listing</h1>
        <!-- {{ route.params }} -->
        <!-- {{ config.apiUrl }} -->
        {{ config.schema.collections }}
        <div v-if="config?.schema?.collections?.[route.params.collection]">
            <!-- {{ data }} -->
            <div class="bg-white shadow-md overflow-hidden">
                <div class="bg-gray-50">
                    <ul class="divide-y divide-gray-200">
                        <li
                            v-for="item in data?.data"
                            :key="item.id"
                            class="px-4 py-4 sm:px-6 hover:bg-gray-100 transition-colors duration-150 ease-in-out">
                            <div class="flex items-center justify-between">
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-indigo-600 truncate">
                                        {{
                                            item[
                                                // @ts-ignore
                                                config?.schema?.collections?.[
                                                    //@ts-ignore
                                                    route.params.collection
                                                ]?.info?.defaultField
                                            ]
                                        }}
                                    </p>
                                    <p class="mt-1 text-sm text-gray-500">ID: {{ item.id }}</p>
                                </div>
                                <div class="ml-4 flex-shrink-0 gap-2 flex">
                                    <router-link
                                        class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-200"
                                        :to="`/collection/${route.params.collection}/${item.id}`">
                                        Edit
                                    </router-link>
                                    <button
                                        class="bg-red-600 text-red-100 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-500">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </AdminDashboard>
</template>

<script setup lang="ts">
import config from '@config'
import AdminDashboard from '@cms/cms-core/components/AdminDasboard.vue'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useAxios } from '@vueuse/integrations'
const route = useRoute()

const { data } = useAxios(`${route.params.collection}`, config.axiosInstance)
</script>

<style scoped>
.p-dataview-content {
    background-color: red;
}
</style>
