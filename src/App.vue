<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- オフラインバナー -->
    <div v-if="!isOnline" class="fixed top-0 left-0 w-full bg-red-500 text-white text-center py-2 z-50">
      オフラインです。ネットワークに接続してください。
    </div>

    <!-- インストールバナー -->
    <div v-if="showInstallPrompt && isOnline" class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-primary-500 rounded-lg shadow-lg px-6 py-3 flex items-center gap-4 z-50">
      <span class="text-primary-700 font-semibold">アプリをインストールしませんか？</span>
      <button @click="installApp" class="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition">インストール</button>
      <button @click="showInstallPrompt = false" class="ml-2 text-gray-400 hover:text-gray-600">×</button>
    </div>

    <!-- インストール完了トースト -->
    <div v-if="showInstalledToast" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded shadow-lg z-50">
      アプリのインストールが完了しました！
    </div>

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
import { pwaManager } from '@/utils/pwa'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)

// PWA連携用
const isOnline = ref(navigator.onLine)
const showInstallPrompt = ref(false)
const showInstalledToast = ref(false)
let deferredPrompt = null

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

  // オフライン/オンライン状態の監視
  window.addEventListener('online', () => (isOnline.value = true))
  window.addEventListener('offline', () => (isOnline.value = false))

  // beforeinstallpromptイベントの監視
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallPrompt.value = true
  })

  // インストール完了イベント
  window.addEventListener('appinstalled', () => {
    showInstallPrompt.value = false
    showInstalledToast.value = true
    setTimeout(() => (showInstalledToast.value = false), 3000)
  })
})

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      showInstallPrompt.value = false
    }
    deferredPrompt = null
  }
}

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