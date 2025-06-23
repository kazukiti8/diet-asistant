<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
    <div class="flex justify-around items-center py-2">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.path"
        class="flex flex-col items-center py-2 px-3 transition-colors duration-200"
        :class="isActive(item.path) ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'"
      >
        <i :class="item.icon" class="text-xl mb-1"></i>
        <span class="text-xs">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navigationItems = [
  {
    name: 'home',
    label: 'ホーム',
    path: '/',
    icon: 'fas fa-home'
  },
  {
    name: 'progress',
    label: '進捗',
    path: '/progress',
    icon: 'fas fa-chart-line'
  },
  {
    name: 'records',
    label: '記録',
    path: '/records',
    icon: 'fas fa-plus-circle'
  },
  {
    name: 'advice',
    label: 'アドバイス',
    path: '/advice',
    icon: 'fas fa-lightbulb'
  },
  {
    name: 'settings',
    label: '設定',
    path: '/settings',
    icon: 'fas fa-cog'
  }
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script> 