<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/settings" class="mr-3 text-gray-600 hover:text-gray-800">
              <i class="fas fa-arrow-left text-xl"></i>
            </router-link>
            <h1 class="text-xl font-bold">プロフィール編集</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="saveProfile" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-save text-xl"></i>
            </button>
            <button @click="resetProfile" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-undo text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-gray-600">プロフィールを読み込み中...</p>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else class="container mx-auto px-4 py-6">
      <!-- Profile Header -->
      <section class="mb-8">
        <div class="card">
          <div class="text-center">
            <!-- Avatar Section -->
            <div class="relative inline-block mb-4">
              <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mx-auto">
                <img
                  v-if="profile.avatar"
                  :src="profile.avatar"
                  :alt="profile.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="fas fa-user text-3xl text-gray-400"></i>
                </div>
              </div>
              <button @click="changeAvatar" class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700">
                <i class="fas fa-camera text-sm"></i>
              </button>
            </div>
            
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ profile.name || 'ユーザー名' }}</h2>
            <p class="text-gray-600 mb-4">{{ profile.email || 'email@example.com' }}</p>
            
            <!-- Quick Stats -->
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-lg font-bold text-blue-600">{{ stats.totalDays }}</div>
                <div class="text-sm text-gray-600">記録日数</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">{{ stats.currentStreak }}</div>
                <div class="text-sm text-gray-600">継続日数</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-purple-600">{{ stats.goalsAchieved }}</div>
                <div class="text-sm text-gray-600">達成目標</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Basic Information -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">基本情報</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ユーザー名
              </label>
              <input
                v-model="profile.name"
                type="text"
                placeholder="ユーザー名を入力"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                v-model="profile.email"
                type="email"
                placeholder="メールアドレスを入力"
                class="input-field"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  年齢
                </label>
                <input
                  v-model.number="profile.age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="年齢"
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  性別
                </label>
                <select v-model="profile.gender" class="input-field">
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                  <option value="prefer_not_to_say">回答しない</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  身長 (cm)
                </label>
                <input
                  v-model.number="profile.height"
                  type="number"
                  min="100"
                  max="250"
                  placeholder="身長"
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  現在の体重 (kg)
                </label>
                <input
                  v-model.number="profile.currentWeight"
                  type="number"
                  min="30"
                  max="200"
                  step="0.1"
                  placeholder="体重"
                  class="input-field"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                活動レベル
              </label>
              <select v-model="profile.activityLevel" class="input-field">
                <option value="">選択してください</option>
                <option value="sedentary">座り仕事中心（運動なし）</option>
                <option value="lightly_active">軽い運動（週1-3回）</option>
                <option value="moderately_active">中程度の運動（週3-5回）</option>
                <option value="very_active">激しい運動（週6-7回）</option>
                <option value="extremely_active">非常に激しい運動（毎日2回以上）</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                自己紹介
              </label>
              <textarea
                v-model="profile.bio"
                rows="3"
                placeholder="自己紹介を入力してください"
                class="input-field"
              ></textarea>
            </div>
          </div>
        </div>
      </section>

      <!-- Current Goals -->
      <section class="mb-8">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">現在の目標</h2>
            <router-link to="/goal-setting" class="btn-secondary">
              <i class="fas fa-edit mr-2"></i>編集
            </router-link>
          </div>
          
          <div v-if="!currentGoals" class="text-center py-8">
            <i class="fas fa-bullseye text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600 mb-4">目標が設定されていません</p>
            <router-link to="/goal-setting" class="btn-primary">
              目標を設定する
            </router-link>
          </div>
          
          <div v-else class="space-y-4">
            <!-- Weight Goal -->
            <div v-if="currentGoals.weight" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <i class="fas fa-weight text-blue-600 text-xl mr-3"></i>
                  <h3 class="font-semibold">体重目標</h3>
                </div>
                <div class="text-sm text-gray-600">
                  {{ currentGoals.weight.target }}kg
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full"
                  :style="{ width: `${weightProgress}%` }"
                ></div>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                進捗: {{ weightProgress }}%
              </div>
            </div>
            
            <!-- Calorie Goal -->
            <div v-if="currentGoals.calories" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <i class="fas fa-fire text-orange-600 text-xl mr-3"></i>
                  <h3 class="font-semibold">カロリー目標</h3>
                </div>
                <div class="text-sm text-gray-600">
                  {{ currentGoals.calories.target }}kcal
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-orange-600 h-2 rounded-full"
                  :style="{ width: `${calorieProgress}%` }"
                ></div>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                進捗: {{ calorieProgress }}%
              </div>
            </div>
            
            <!-- Exercise Goal -->
            <div v-if="currentGoals.exercise" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <i class="fas fa-dumbbell text-purple-600 text-xl mr-3"></i>
                  <h3 class="font-semibold">運動目標</h3>
                </div>
                <div class="text-sm text-gray-600">
                  週{{ currentGoals.exercise.target }}回
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-purple-600 h-2 rounded-full"
                  :style="{ width: `${exerciseProgress}%` }"
                ></div>
              </div>
              <div class="text-sm text-gray-600 mt-1">
                進捗: {{ exerciseProgress }}%
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">統計情報</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ stats.totalWeightRecords }}</div>
              <div class="text-sm text-gray-600">体重記録</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ stats.totalMealRecords }}</div>
              <div class="text-sm text-gray-600">食事記録</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ stats.totalExerciseRecords }}</div>
              <div class="text-sm text-gray-600">運動記録</div>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <div class="text-2xl font-bold text-yellow-600">{{ stats.totalCaloriesBurned }}</div>
              <div class="text-sm text-gray-600">消費カロリー</div>
            </div>
          </div>
          
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold mb-2">最近の進捗</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>開始日:</span>
                <span>{{ stats.startDate || '未設定' }}</span>
              </div>
              <div class="flex justify-between">
                <span>体重変化:</span>
                <span :class="stats.weightChange >= 0 ? 'text-red-600' : 'text-green-600'">
                  {{ stats.weightChange >= 0 ? '+' : '' }}{{ stats.weightChange }}kg
                </span>
              </div>
              <div class="flex justify-between">
                <span>平均カロリー:</span>
                <span>{{ stats.averageCalories }}kcal</span>
              </div>
              <div class="flex justify-between">
                <span>運動頻度:</span>
                <span>週{{ stats.exerciseFrequency }}回</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Account Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">アカウント設定</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                パスワード変更
              </label>
              <button @click="changePassword" class="btn-secondary w-full">
                <i class="fas fa-key mr-2"></i>パスワードを変更
              </button>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                アカウント削除
              </label>
              <button @click="deleteAccount" class="btn-danger w-full">
                <i class="fas fa-trash mr-2"></i>アカウントを削除
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Privacy Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">プライバシー設定</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">プロフィール公開</h3>
                <p class="text-sm text-gray-600">他のユーザーにプロフィールを公開</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="privacySettings.profilePublic"
                  @change="updatePrivacySettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">進捗公開</h3>
                <p class="text-sm text-gray-600">体重や運動の進捗を公開</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="privacySettings.progressPublic"
                  @change="updatePrivacySettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">データ分析</h3>
                <p class="text-sm text-gray-600">匿名化されたデータを分析に使用</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="privacySettings.dataAnalysis"
                  @change="updatePrivacySettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Data Management -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">データ管理</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                データエクスポート
              </label>
              <button @click="exportData" class="btn-secondary w-full">
                <i class="fas fa-download mr-2"></i>データをエクスポート
              </button>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                データインポート
              </label>
              <button @click="importData" class="btn-secondary w-full">
                <i class="fas fa-upload mr-2"></i>データをインポート
              </button>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                データクリア
              </label>
              <button @click="clearData" class="btn-danger w-full">
                <i class="fas fa-trash mr-2"></i>すべてのデータを削除
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Integration Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">連携設定</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div class="flex items-center">
                <i class="fab fa-apple text-2xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">Apple Health</h3>
                  <p class="text-sm text-gray-600">健康データを同期</p>
                </div>
              </div>
              <button @click="connectAppleHealth" class="btn-secondary">
                {{ appleHealthConnected ? '切断' : '接続' }}
              </button>
            </div>
            
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div class="flex items-center">
                <i class="fab fa-google text-2xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">Google Fit</h3>
                  <p class="text-sm text-gray-600">フィットネスデータを同期</p>
                </div>
              </div>
              <button @click="connectGoogleFit" class="btn-secondary">
                {{ googleFitConnected ? '切断' : '接続' }}
              </button>
            </div>
            
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-watch text-2xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">スマートウォッチ</h3>
                  <p class="text-sm text-gray-600">活動データを同期</p>
                </div>
              </div>
              <button @click="connectSmartWatch" class="btn-secondary">
                {{ smartWatchConnected ? '切断' : '接続' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold">パスワード変更</h3>
        </div>
        <div class="p-4">
          <form @submit.prevent="updatePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                現在のパスワード
              </label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード
              </label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="8"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード（確認）
              </label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="input-field"
              />
            </div>
            
            <div class="flex space-x-3">
              <button type="button" @click="closePasswordModal" class="flex-1 btn-secondary">
                キャンセル
              </button>
              <button type="submit" class="flex-1 btn-primary">
                変更
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Hidden file input for avatar -->
    <input
      ref="avatarInput"
      type="file"
      accept="image/*"
      @change="onAvatarChange"
      class="hidden"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useWeightStore } from '@/stores/weight'
import { useMealStore } from '@/stores/meal'
import { useExerciseStore } from '@/stores/exercise'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const weightStore = useWeightStore()
const mealStore = useMealStore()
const exerciseStore = useExerciseStore()

// Reactive data
const isLoading = ref(false)
const showPasswordModal = ref(false)
const avatarInput = ref(null)

// Profile data
const profile = ref({
  name: '',
  email: '',
  age: null,
  gender: '',
  height: null,
  currentWeight: null,
  activityLevel: '',
  bio: '',
  avatar: null
})

// Privacy settings
const privacySettings = ref({
  profilePublic: false,
  progressPublic: false,
  dataAnalysis: true
})

// Password form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Connection status
const appleHealthConnected = ref(false)
const googleFitConnected = ref(false)
const smartWatchConnected = ref(false)

// Computed properties
const currentGoals = computed(() => {
  return settingsStore.userSettings.goals
})

const stats = computed(() => {
  const weightRecords = weightStore.records || []
  const mealRecords = mealStore.records || []
  const exerciseRecords = exerciseStore.records || []
  
  const totalDays = Math.max(
    weightRecords.length,
    mealRecords.length,
    exerciseRecords.length
  )
  
  const currentStreak = calculateCurrentStreak()
  const goalsAchieved = calculateGoalsAchieved()
  
  const totalWeightRecords = weightRecords.length
  const totalMealRecords = mealRecords.length
  const totalExerciseRecords = exerciseRecords.length
  const totalCaloriesBurned = exerciseRecords.reduce((sum, record) => sum + (record.caloriesBurned || 0), 0)
  
  const startDate = weightRecords.length > 0 
    ? new Date(weightRecords[0].date).toLocaleDateString('ja-JP')
    : null
  
  const weightChange = weightRecords.length >= 2
    ? (weightRecords[weightRecords.length - 1].weight - weightRecords[0].weight).toFixed(1)
    : 0
  
  const averageCalories = mealRecords.length > 0
    ? Math.round(mealRecords.reduce((sum, record) => sum + (record.calories || 0), 0) / mealRecords.length)
    : 0
  
  const exerciseFrequency = exerciseRecords.length > 0
    ? Math.round(exerciseRecords.length / Math.max(1, Math.ceil((new Date() - new Date(exerciseRecords[0].date)) / (1000 * 60 * 60 * 24 * 7))))
    : 0
  
  return {
    totalDays,
    currentStreak,
    goalsAchieved,
    totalWeightRecords,
    totalMealRecords,
    totalExerciseRecords,
    totalCaloriesBurned,
    startDate,
    weightChange,
    averageCalories,
    exerciseFrequency
  }
})

const weightProgress = computed(() => {
  if (!currentGoals.value?.weight || !profile.value.currentWeight) return 0
  const startWeight = weightStore.records?.[0]?.weight || profile.value.currentWeight
  const targetWeight = currentGoals.value.weight.target
  const currentWeight = profile.value.currentWeight
  
  const totalChange = Math.abs(startWeight - targetWeight)
  const currentChange = Math.abs(startWeight - currentWeight)
  
  return Math.min(100, Math.round((currentChange / totalChange) * 100))
})

const calorieProgress = computed(() => {
  if (!currentGoals.value?.calories) return 0
  const target = currentGoals.value.calories.target
  const average = stats.value.averageCalories
  
  return Math.min(100, Math.round((average / target) * 100))
})

const exerciseProgress = computed(() => {
  if (!currentGoals.value?.exercise) return 0
  const target = currentGoals.value.exercise.target
  const current = stats.value.exerciseFrequency
  
  return Math.min(100, Math.round((current / target) * 100))
})

// Methods
const saveProfile = async () => {
  try {
    isLoading.value = true
    await settingsStore.updateSettings({
      profile: profile.value,
      privacySettings: privacySettings.value
    })
    alert('プロフィールを保存しました')
  } catch (error) {
    console.error('プロフィール保存エラー:', error)
    alert('プロフィールの保存に失敗しました')
  } finally {
    isLoading.value = false
  }
}

const resetProfile = () => {
  if (confirm('プロフィールを元に戻しますか？')) {
    loadProfile()
  }
}

const changeAvatar = () => {
  avatarInput.value?.click()
}

const onAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profile.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const updatePrivacySettings = async () => {
  try {
    await settingsStore.updateSettings({
      privacySettings: privacySettings.value
    })
  } catch (error) {
    console.error('プライバシー設定更新エラー:', error)
  }
}

const changePassword = () => {
  showPasswordModal.value = true
}

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('新しいパスワードが一致しません')
    return
  }
  
  try {
    await authStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    alert('パスワードを変更しました')
    closePasswordModal()
  } catch (error) {
    console.error('パスワード変更エラー:', error)
    alert('パスワードの変更に失敗しました')
  }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const deleteAccount = () => {
  if (confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
    // アカウント削除の実装
    alert('アカウント削除機能は実装中です')
  }
}

const exportData = () => {
  const data = {
    profile: profile.value,
    weightRecords: weightStore.records,
    mealRecords: mealStore.records,
    exerciseRecords: exerciseStore.records,
    settings: settingsStore.userSettings
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `diet-app-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          // データインポートの実装
          alert('データインポート機能は実装中です')
        } catch (error) {
          alert('ファイルの読み込みに失敗しました')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const clearData = () => {
  if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
    // データクリアの実装
    alert('データクリア機能は実装中です')
  }
}

const connectAppleHealth = () => {
  appleHealthConnected.value = !appleHealthConnected.value
  alert(appleHealthConnected.value ? 'Apple Healthに接続しました' : 'Apple Healthから切断しました')
}

const connectGoogleFit = () => {
  googleFitConnected.value = !googleFitConnected.value
  alert(googleFitConnected.value ? 'Google Fitに接続しました' : 'Google Fitから切断しました')
}

const connectSmartWatch = () => {
  smartWatchConnected.value = !smartWatchConnected.value
  alert(smartWatchConnected.value ? 'スマートウォッチに接続しました' : 'スマートウォッチから切断しました')
}

const calculateCurrentStreak = () => {
  // 継続日数の計算ロジック
  return 7 // 仮の値
}

const calculateGoalsAchieved = () => {
  // 達成目標数の計算ロジック
  return 3 // 仮の値
}

const loadProfile = async () => {
  try {
    const settings = settingsStore.userSettings
    
    if (settings.profile) {
      profile.value = {
        ...profile.value,
        ...settings.profile
      }
    }
    
    if (settings.privacySettings) {
      privacySettings.value = {
        ...privacySettings.value,
        ...settings.privacySettings
      }
    }
  } catch (error) {
    console.error('プロフィール読み込みエラー:', error)
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  
  await Promise.all([
    settingsStore.loadSettings(),
    weightStore.loadRecords(),
    mealStore.loadData(),
    exerciseStore.loadData()
  ])
  
  await loadProfile()
  
  isLoading.value = false
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-6 mb-6;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors;
}

.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}
</style> 