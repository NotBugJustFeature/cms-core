<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-50">
        <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-lg">
            <div>
                <div
                    class="text-center"
                    v-if="!isInitMode">
                    <h2 class="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                    <p class="mt-2 text-sm text-gray-600">Please sign in to continue</p>
                </div>
                <div
                    class="text-center"
                    v-if="isInitMode">
                    <h2 class="text-3xl font-bold tracking-tight text-gray-900">
                        Create an account
                    </h2>
                </div>

                <Form
                    v-slot="$form"
                    @submit="onFormSubmit"
                    class="mt-8 space-y-6">
                    <div class="space-y-4">
                        <div class="flex flex-col gap-1">
                            <InputText
                                name="username"
                                type="text"
                                placeholder="Email or username"
                                class="w-full"
                                v-model="formData.username" />
                            <Message
                                v-if="$form.username?.invalid"
                                severity="error"
                                size="small"
                                variant="simple">
                                {{ $form.username.error?.message }}
                            </Message>
                        </div>

                        <div class="flex flex-col gap-1">
                            <Password
                                name="password"
                                placeholder="Password"
                                v-model="formData.password"
                                :feedback="false"
                                class="w-full"
                                toggleMask />
                            <Message
                                v-if="userStore.errorMessage"
                                severity="error"
                                size="small"
                                variant="simple">
                                {{ userStore.errorMessage }}
                            </Message>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        severity="primary"
                        label="Sign in"
                        class="w-full" />
                </Form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Form } from '@primevue/forms'
import { InputText, Password, Checkbox } from 'primevue'
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../store/userStore'
import config from '@config'
import { useAxios } from '@vueuse/integrations'
import { useRouter } from 'vue-router'

const router = useRouter()
const { data: initModeResponse, isLoading } = useAxios(`/is_init_mode`, config.axiosInstance)
const isInitMode = computed(() => initModeResponse.value?.isInitMode ?? false)

const userStore = useUserStore()

onMounted(async () => {
    if (await userStore.checkAuth()) {
        router.push('/')
    }
})

const formData = ref({
    username: '',
    password: ''
})

const onFormSubmit = async (e: any) => {
    router.push('/')
    if (
        isInitMode.value
            ? await userStore.register(formData.value)
            : await userStore.login(formData.value)
    ) {
        await router.push('/')
        // router.push('/')
    }
}
</script>
