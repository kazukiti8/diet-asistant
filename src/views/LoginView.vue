<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- ロゴ・タイトル -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-weight text-white text-3xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">ダイエット応援ノート</h1>
        <p class="text-gray-600">あなたのダイエットをサポートします</p>
      </div>

      <!-- ログインフォーム -->
      <div class="card">
        <h2 class="text-2xl font-bold text-center mb-6">ログイン</h2>
        
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- メールアドレス -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="メールアドレスを入力"
              :disabled="loading"
            />
          </div>

          <!-- パスワード -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-field pr-12"
                placeholder="パスワードを入力"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                :disabled="loading"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- エラーメッセージ -->
          <div v-if="error" class="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p class="text-danger-700 text-sm">{{ error }}</p>
          </div>

          <!-- ログインボタン -->
          <button
            type="submit"
            class="w-full btn-primary py-3"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ログイン中...
            </span>
            <span v-else>ログイン</span>
          </button>
        </form>

        <!-- 登録リンク -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            アカウントをお持ちでない方は
            <router-link to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
              新規登録
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.email || !form.password) {
    error.value = 'メールアドレスとパスワードを入力してください'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login({
      email: form.email,
      password: form.password
    })

    if (result.success) {
      window.$notify?.success('ログイン成功', 'おかえりなさい！')
      
      // オンボーディングが必要かチェック
      if (authStore.needsOnboarding) {
        router.push('/onboarding')
      } else {
        router.push('/')
      }
    } else {
      error.value = result.error || 'ログインに失敗しました'
    }
  } catch (err) {
    error.value = 'ログイン中にエラーが発生しました'
    console.error('ログインエラー:', err)
  } finally {
    loading.value = false
  }
}
</script> 