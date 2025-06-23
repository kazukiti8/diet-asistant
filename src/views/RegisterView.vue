<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <i class="fas fa-heart text-4xl text-red-500 mb-4"></i>
        <h2 class="text-3xl font-bold text-gray-900">ダイエット応援ノート</h2>
        <p class="mt-2 text-sm text-gray-600">
          アカウントを作成してダイエットを始めましょう
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- ユーザー名 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              ユーザー名
            </label>
            <div class="mt-1">
              <input
                id="username"
                v-model="form.username"
                name="username"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ユーザー名を入力"
                :disabled="isLoading"
              />
            </div>
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- メールアドレス -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="メールアドレスを入力"
                :disabled="isLoading"
              />
            </div>
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <!-- パスワード -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="パスワードを入力"
                :disabled="isLoading"
              />
            </div>
            <div class="mt-1 flex items-center">
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-sm text-gray-500 hover:text-gray-700"
                :disabled="isLoading"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                {{ showPassword ? '非表示' : '表示' }}
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <!-- パスワード確認 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              パスワード確認
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="パスワードを再入力"
                :disabled="isLoading"
              />
            </div>
            <div class="mt-1 flex items-center">
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="text-sm text-gray-500 hover:text-gray-700"
                :disabled="isLoading"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                {{ showConfirmPassword ? '非表示' : '表示' }}
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- 利用規約同意 -->
          <div class="flex items-center">
            <input
              id="agreeTerms"
              v-model="form.agreeTerms"
              name="agreeTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              :disabled="isLoading"
            />
            <label for="agreeTerms" class="ml-2 block text-sm text-gray-900">
              <a href="#" class="text-blue-600 hover:text-blue-500">利用規約</a>
              と
              <a href="#" class="text-blue-600 hover:text-blue-500">プライバシーポリシー</a>
              に同意します
            </label>
          </div>

          <!-- エラーメッセージ -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-red-400"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>

          <!-- 登録ボタン -->
          <div>
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isLoading" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                登録中...
              </div>
              <span v-else>アカウントを作成</span>
            </button>
          </div>
        </form>

        <!-- ログインリンク -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">既にアカウントをお持ちですか？</span>
            </div>
          </div>

          <div class="mt-6">
            <router-link
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ログイン画面へ
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功メッセージ -->
    <div v-if="showSuccessMessage" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <i class="fas fa-check text-green-600 text-xl"></i>
          </div>
          <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">
            登録完了！
          </h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              アカウントが正常に作成されました。<br>
              ホーム画面に移動します。
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="goToHome"
              class="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ホーム画面へ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// フォームデータ
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// UI状態
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const showSuccessMessage = ref(false)

// バリデーションエラー
const errors = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// フォームの有効性チェック
const isFormValid = computed(() => {
  return (
    form.value.username.trim() !== '' &&
    form.value.email.trim() !== '' &&
    form.value.password.length >= 6 &&
    form.value.password === form.value.confirmPassword &&
    form.value.agreeTerms
  )
})

// バリデーション
const validateForm = () => {
  errors.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  }

  let isValid = true

  // ユーザー名のバリデーション
  if (!form.value.username.trim()) {
    errors.value.username = 'ユーザー名を入力してください'
    isValid = false
  } else if (form.value.username.length < 3) {
    errors.value.username = 'ユーザー名は3文字以上で入力してください'
    isValid = false
  } else if (form.value.username.length > 20) {
    errors.value.username = 'ユーザー名は20文字以下で入力してください'
    isValid = false
  }

  // メールアドレスのバリデーション
  if (!form.value.email.trim()) {
    errors.value.email = 'メールアドレスを入力してください'
    isValid = false
  } else if (!form.value.email.includes('@') || !form.value.email.includes('.')) {
    errors.value.email = '有効なメールアドレスを入力してください'
    isValid = false
  }

  // パスワードのバリデーション
  if (!form.value.password) {
    errors.value.password = 'パスワードを入力してください'
    isValid = false
  } else if (form.value.password.length < 6) {
    errors.value.password = 'パスワードは6文字以上で入力してください'
    isValid = false
  }

  // パスワード確認のバリデーション
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'パスワード確認を入力してください'
    isValid = false
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'パスワードが一致しません'
    isValid = false
  }

  return isValid
}

// 登録処理
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    const result = await authStore.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      nickname: form.value.username
    })

    if (result.success) {
      showSuccessMessage.value = true
      // 3秒後にホーム画面に移動
      setTimeout(() => {
        goToHome()
      }, 3000)
    } else {
      errorMessage.value = result.error || '登録に失敗しました'
    }
  } catch (error) {
    console.error('登録エラー:', error)
    errorMessage.value = '登録中にエラーが発生しました'
  } finally {
    isLoading.value = false
  }
}

// ホーム画面に移動
const goToHome = () => {
  showSuccessMessage.value = false
  router.push('/')
}

// コンポーネントマウント時
onMounted(() => {
  // 既にログインしている場合はホーム画面にリダイレクト
  if (authStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
/* カスタムスタイル */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 