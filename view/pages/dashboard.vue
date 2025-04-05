<template>
    <AdminDashboard slot-class="p-4">
        <!-- {{ config.schema.collections }} -->
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <h2 class="text-lg font-medium">Collections</h2>
                <div class="flex flex-row flex-wrap gap-2">
                    <a
                        v-for="collection in Object.keys(config.schema.collections)"
                        :key="collection"
                        :href="`/collection/${collection}`"
                        class="min-w-40 min-h-20 flex bg-white rounded-md p-2 justify-center items-center">
                        <h3 class="text-md font-medium w-fit">{{ collection }}</h3>
                    </a>
                </div>
            </div>
        </div>
    </AdminDashboard>
</template>

<script setup lang="ts">
import config from '@config'
import AdminDashboard from '@cms/cms-core/components/AdminDasboard.vue'
</script>

<style scoped></style>
