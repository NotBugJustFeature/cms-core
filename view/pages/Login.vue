<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-50">
        <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-lg">
            <div class="text-center">
                <h2 class="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                <p class="mt-2 text-sm text-gray-600">Please sign in to continue</p>
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
                            v-if="$form.password?.invalid"
                            severity="error"
                            size="small"
                            variant="simple">
                            {{ $form.password.error?.message }}
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
</template>

<script setup lang="ts">
import { Form } from '@primevue/forms'
import { InputText, Password, Checkbox } from 'primevue'
import { ref } from 'vue'

const formData = ref({
    username: '',
    password: '',
    remember: false
})

const onFormSubmit = (e: any) => {
    console.log('Form submitted', formData.value)
}
</script>
