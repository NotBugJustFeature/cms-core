<template>
    <div id="app">
        <h1>Vue Admin Panel</h1>
        <pre>{{ userData }}</pre>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
export default defineComponent({
    name: 'App',
    setup() {
        const userData = ref({})

        onMounted(async () => {
            try {
                const response = await fetch('http://localhost:3000/api/user')
                userData.value = await response.json()
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        })

        return {
            userData: computed(() => userData?.value?.data)
        }
    }
})
</script>

<style>
/*#app {
    font-family: Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}*/
</style>
