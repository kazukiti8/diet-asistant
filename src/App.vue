<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- ローディング状態 -->
    <div v-if="loading" class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-gray-600">読み込み中...</p>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <router-view v-else />

    <!-- 通知コンポーネント -->
    <NotificationContainer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationContainer from '@/components/NotificationContainer.vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  try {
    // 認証状態の確認
    await authStore.checkAuth()
    
    // 初期化処理
    await initializeApp()
  } catch (error) {
    console.error('アプリケーション初期化エラー:', error)
  } finally {
    loading.value = false
  }
})

const initializeApp = async () => {
  // アプリケーションの初期化処理
  // 例: ユーザー設定の読み込み、データの初期化など
}
</script>

<style>
#app {
  font-family: 'Inter', system-ui, sans-serif;
}

/* スムーズなページ遷移 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style> 