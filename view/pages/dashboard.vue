<template>
    <AdminDashboard>
        <h1>Dashboard</h1>
        {{ config.schema.collections }}
    </AdminDashboard>
</template>

<script setup lang="ts">
import config from '@config'
import AdminDashboard from '@cms/cms-core/components/AdminDasboard.vue'
</script>

<style scoped></style>
