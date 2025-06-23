<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4"
        :class="getNotificationClasses(notification.type)"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <i :class="getNotificationIcon(notification.type)" class="text-lg"></i>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium" :class="getNotificationTextColor(notification.type)">
              {{ notification.title }}
            </p>
            <p v-if="notification.message" class="mt-1 text-sm text-gray-600">
              {{ notification.message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button
              @click="removeNotification(notification.id)"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const notifications = ref([])
let nextId = 1

// 通知を追加する関数
const addNotification = (type, title, message = '', duration = 5000) => {
  const notification = {
    id: nextId++,
    type,
    title,
    message,
    timestamp: Date.now()
  }
  
  notifications.value.push(notification)
  
  // 自動削除
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(notification.id)
    }, duration)
  }
  
  return notification.id
}

// 通知を削除する関数
const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 通知タイプに応じたクラスを取得
const getNotificationClasses = (type) => {
  const classes = {
    success: 'border-success-500',
    error: 'border-danger-500',
    warning: 'border-warning-500',
    info: 'border-primary-500'
  }
  return classes[type] || classes.info
}

// 通知タイプに応じたアイコンを取得
const getNotificationIcon = (type) => {
  const icons = {
    success: 'fas fa-check-circle text-success-500',
    error: 'fas fa-exclamation-circle text-danger-500',
    warning: 'fas fa-exclamation-triangle text-warning-500',
    info: 'fas fa-info-circle text-primary-500'
  }
  return icons[type] || icons.info
}

// 通知タイプに応じたテキスト色を取得
const getNotificationTextColor = (type) => {
  const colors = {
    success: 'text-success-800',
    error: 'text-danger-800',
    warning: 'text-warning-800',
    info: 'text-primary-800'
  }
  return colors[type] || colors.info
}

// グローバル関数として公開
onMounted(() => {
  window.$notify = {
    success: (title, message, duration) => addNotification('success', title, message, duration),
    error: (title, message, duration) => addNotification('error', title, message, duration),
    warning: (title, message, duration) => addNotification('warning', title, message, duration),
    info: (title, message, duration) => addNotification('info', title, message, duration)
  }
})
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style> 