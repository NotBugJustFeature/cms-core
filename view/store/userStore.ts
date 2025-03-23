import { defineStore } from 'pinia'
import { useAxios } from '@vueuse/integrations/useAxios'
import { jwtDecode } from 'jwt-decode'
import config from '@config'
import { useRouter } from 'vue-router'

const router = useRouter()

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as any,
        token: null as string | null,
        isAuthenticated: false
    }),

    actions: {
        async login(credentials: { username: string; password: string }) {
            try {
                const { data } = await useAxios(
                    '/login',
                    {
                        method: 'POST',
                        data: credentials
                    },
                    config.axiosInstance
                )
                console.log(data)
                return true
            } catch (error) {
                console.error('Login error:', error)
                return false
            }
        },

        async logout() {
            const { data } = await useAxios('/logout', {}, config.axiosInstance)
            this.user = null
            this.token = null
            this.isAuthenticated = false
            return true
        },

        async checkAuth() {
            const { data } = await useAxios('/is_authenticated', {}, config.axiosInstance)
            console.log(data)
            this.user = data.value?.user ?? {}
            this.isAuthenticated = data.value?.isAuthenticated ?? false
            return data.value?.isAuthenticated ?? false
        }
    },

    getters: {
        getUserData: (state) => state.user,
        isLoggedIn: (state) => state.isAuthenticated
    }
})
