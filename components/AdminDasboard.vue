<template>
    <div class="flex h-screen bg-gray-100">
        <!-- Left Navigation -->
        <div
            class="bg-white shadow-lg transition-all duration-300 flex flex-col h-screen"
            :class="[isExpanded ? 'w-64' : 'w-16']">
            <!-- Fixed Top Header -->
            <div class="p-3 border-b shrink-0">
                <button
                    @click="isExpanded = !isExpanded"
                    class="flex items-center w-full p-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <Icon
                        :icon="isExpanded ? 'mdi:menu-open' : 'mdi:menu'"
                        class="text-xl text-gray-600 shrink-0" />
                    <span
                        class="ml-3 transition-all duration-300 overflow-hidden"
                        :style="{
                            width: isExpanded ? 'auto' : '0',
                            opacity: isExpanded ? '1' : '0'
                        }">
                        Dashboard
                    </span>
                </button>
            </div>

            <!-- Scrollable Navigation Items -->
            <div class="flex-1 overflow-hidden">
                <nav
                    class="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                    <div class="p-3 overflow-x-hidden">
                        <router-link
                            v-for="item in menuItems"
                            :key="item.path"
                            :to="item.path"
                            class="flex items-center w-full p-2.5 mb-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative group">
                            <Icon
                                :icon="item.icon"
                                class="text-xl text-gray-600 shrink-0" />
                            <span
                                class="ml-3 transition-all duration-300 overflow-hidden"
                                :style="{
                                    width: isExpanded ? 'auto' : '0',
                                    opacity: isExpanded ? '1' : '0'
                                }">
                                {{ item.name }}
                            </span>
                            <!-- Tooltip for collapsed state -->
                            <div
                                v-if="!isExpanded"
                                class="absolute left-full ml-2 px-2 py-1 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                {{ item.name }}
                            </div>
                        </router-link>
                    </div>
                </nav>
            </div>

            <!-- Fixed User Button at Bottom -->
            <div class="border-t p-3 shrink-0">
                <button
                    class="flex items-center w-full p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative group">
                    <div class="flex items-center w-full">
                        <Icon
                            icon="mdi:account"
                            class="text-xl text-gray-600 shrink-0" />
                        <span
                            class="ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap"
                            :style="{
                                maxWidth: isExpanded ? '150px' : '0',
                                opacity: isExpanded ? '1' : '0'
                            }">
                            John Doe
                        </span>
                    </div>
                </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-auto">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const isExpanded = ref(false)

const menuItems = [
    { name: 'Dashboard', path: '/collection', icon: 'mdi:view-dashboard' },
    { name: 'Posts', path: '/posts', icon: 'mdi:post' },
    { name: 'Media', path: '/media', icon: 'mdi:image' },
    { name: 'Users', path: '/users', icon: 'mdi:account-group' },
    { name: 'Settings', path: '/settings', icon: 'mdi:cog' },
    { name: 'Dashboard', path: '/dashboard', icon: 'mdi:view-dashboard' },
    { name: 'Posts', path: '/posts', icon: 'mdi:post' },
    { name: 'Media', path: '/media', icon: 'mdi:image' },
    { name: 'Users', path: '/users', icon: 'mdi:account-group' },
    { name: 'Settings', path: '/settings', icon: 'mdi:cog' },
    { name: 'Dashboard', path: '/dashboard', icon: 'mdi:view-dashboard' },
    { name: 'Posts', path: '/posts', icon: 'mdi:post' },
    { name: 'Media', path: '/media', icon: 'mdi:image' },
    { name: 'Users', path: '/users', icon: 'mdi:account-group' },
    { name: 'Settings', path: '/settings', icon: 'mdi:cog' }
]

const stats = [
    { name: 'Total Posts', value: '125', icon: 'mdi:post', iconColor: 'text-blue-500' },
    { name: 'Total Users', value: '1,234', icon: 'mdi:account-group', iconColor: 'text-green-500' },
    { name: 'Media Files', value: '543', icon: 'mdi:image', iconColor: 'text-yellow-500' },
    { name: 'Comments', value: '89', icon: 'mdi:comment', iconColor: 'text-purple-500' }
]
</script>

<style scoped>
.router-link-active {
    @apply bg-gray-100 text-blue-600;
}

/* Custom scrollbar styles */
.scrollbar-thin {
    overflow-y: overlay; /* This helps with Chrome */
}

.scrollbar-thin::-webkit-scrollbar {
    width: 4px !important;
}

.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent !important;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background: #e5e7eb !important;
    border-radius: 0 !important;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #d1d5db !important;
}

/* Remove right padding since we want the scrollbar to overlay */
.scrollbar-thin > div {
    margin-right: -2px !important;
    overflow-x: hidden;
    /* padding-right: 0 !important; */
}

/* Firefox */
/* @supports (scrollbar-width: thin) {
    .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: #e5e7eb transparent;
    }
} */
</style>
