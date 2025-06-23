<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold">おかえりなさい！</h1>
            <p class="text-sm text-gray-600">{{ userProfile?.nickname || userProfile?.username }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="showQuickAddModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-plus text-xl"></i>
            </button>
            <router-link to="/settings" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-cog text-xl"></i>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-gray-600">データを読み込み中...</p>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else class="container mx-auto px-4 py-6">
      <!-- Today's Summary -->
      <section class="mb-8 fade-in">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">今日のサマリー</h2>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ todayWeight }}</div>
              <div class="text-sm text-gray-600">体重 (kg)</div>
              <div v-if="weightChange" class="text-xs" :class="weightChange.isPositive ? 'text-green-600' : 'text-red-600'">
                {{ formatWeightChange(weightChange) }}
              </div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ todayCalories }}</div>
              <div class="text-sm text-gray-600">摂取カロリー</div>
              <div class="text-xs text-blue-600">目標: {{ calorieGoal }}</div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ todayExercise }}</div>
              <div class="text-sm text-gray-600">消費カロリー</div>
              <div class="text-xs text-gray-600">運動記録</div>
            </div>
          </div>
          
          <div class="text-center">
            <router-link to="/progress" class="text-blue-600 hover:text-blue-800 text-sm">
              <i class="fas fa-chart-line mr-1"></i>詳細を見る
            </router-link>
          </div>
        </div>
      </section>

      <!-- PFC Balance -->
      <section class="mb-8 fade-in">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">PFCバランス</h2>
            <button @click="showPfcSettingsModal = true" class="text-blue-600 hover:text-blue-800 text-sm">
              <i class="fas fa-cog mr-1"></i>目標設定
            </button>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ pfcData.protein }}g</div>
              <div class="text-sm text-gray-600">タンパク質</div>
              <div class="text-xs text-blue-600">目標: {{ pfcGoals.protein }}g</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-blue-600 h-2 rounded-full" :style="{ width: pfcProgress.protein + '%' }"></div>
              </div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ pfcData.fat }}g</div>
              <div class="text-sm text-gray-600">脂質</div>
              <div class="text-xs text-green-600">目標: {{ pfcGoals.fat }}g</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-green-600 h-2 rounded-full" :style="{ width: pfcProgress.fat + '%' }"></div>
              </div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-lg font-bold text-orange-600">{{ pfcData.carbs }}g</div>
              <div class="text-sm text-gray-600">炭水化物</div>
              <div class="text-xs text-orange-600">目標: {{ pfcGoals.carbs }}g</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-orange-600 h-2 rounded-full" :style="{ width: pfcProgress.carbs + '%' }"></div>
              </div>
            </div>
          </div>
          
          <div class="text-center">
            <button class="text-blue-600 hover:text-blue-800 text-sm">
              <i class="fas fa-chart-pie mr-1"></i>詳細を見る
            </button>
          </div>
        </div>
      </section>

      <!-- Weight Graph -->
      <section class="mb-8 fade-in">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">体重推移</h2>
            <router-link to="/weight-record" class="text-blue-600 hover:text-blue-800 text-sm">
              記録を追加
            </router-link>
          </div>
          
          <div v-if="weightProgress.length > 0" class="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center text-gray-500">
              <i class="fas fa-chart-line text-3xl mb-2"></i>
              <p>体重記録: {{ weightProgress.length }}件</p>
              <p class="text-sm">最新: {{ formatWeight(weightProgress[weightProgress.length - 1]?.weight) }}</p>
            </div>
          </div>
          
          <div v-else class="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center text-gray-500">
              <i class="fas fa-chart-line text-3xl mb-2"></i>
              <p>体重記録を追加するとグラフが表示されます</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Records -->
      <section class="mb-8 fade-in">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">最近の記録</h2>
            <router-link to="/records" class="text-blue-600 hover:text-blue-800 text-sm">
              すべて見る
            </router-link>
          </div>
          
          <div v-if="recentRecords.length > 0" class="space-y-3">
            <div
              v-for="record in recentRecords"
              :key="record.id"
              class="flex items-center justify-between p-3 rounded-lg"
              :class="getRecordBgColor(record.type)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getRecordIconBg(record.type)">
                  <i :class="getRecordIcon(record.type)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ record.title }}</p>
                  <p class="text-sm text-gray-600">{{ record.description }}</p>
                </div>
              </div>
              <span class="text-sm text-gray-500">{{ formatTime(record.timestamp) }}</span>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-clipboard-list text-3xl mb-2"></i>
            <p>まだ記録がありません</p>
            <button @click="showQuickAddModal = true" class="mt-2 text-blue-600 hover:text-blue-800">
              最初の記録を追加
            </button>
          </div>
        </div>
      </section>

      <!-- Weekly Goals -->
      <section class="mb-8 fade-in">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">今週の目標</h2>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-weight text-blue-600 mr-3"></i>
                <div>
                  <p class="font-medium">体重記録</p>
                  <p class="text-sm text-gray-600">週3回記録する</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{{ weeklyGoals.weight.current }}/{{ weeklyGoals.weight.target }}</div>
                <div class="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: weeklyGoals.weight.progress + '%' }"></div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-running text-green-600 mr-3"></i>
                <div>
                  <p class="font-medium">運動</p>
                  <p class="text-sm text-gray-600">週2回運動する</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{{ weeklyGoals.exercise.current }}/{{ weeklyGoals.exercise.target }}</div>
                <div class="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div class="bg-green-600 h-2 rounded-full" :style="{ width: weeklyGoals.exercise.progress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Achievement Rate -->
      <section class="mb-8 fade-in">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">達成率</h2>
          
          <div class="text-center">
            <div class="relative inline-block">
              <svg class="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="transparent"
                  class="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="transparent"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="circumference - (achievementRate / 100) * circumference"
                  class="text-blue-600 transition-all duration-300"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-gray-800">{{ achievementRate }}%</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mt-2">今週の目標達成率</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Quick Add Modal -->
    <div v-if="showQuickAddModal" class="modal-overlay" @click="showQuickAddModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">記録を追加</h3>
          <button @click="showQuickAddModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-2 gap-4">
            <router-link
              v-for="recordType in recordTypes"
              :key="recordType.id"
              :to="recordType.path"
              @click="showQuickAddModal = false"
              class="record-type-btn flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition"
            >
              <div class="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                   :class="recordType.bgColor">
                <i :class="recordType.icon"></i>
              </div>
              <span class="text-sm font-medium">{{ recordType.name }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- PFC Settings Modal -->
    <div v-if="showPfcSettingsModal" class="modal-overlay" @click="showPfcSettingsModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">PFCバランス目標設定</h3>
          <button @click="showPfcSettingsModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div>
              <label for="proteinGoal" class="block text-sm font-medium text-gray-700 mb-2">
                タンパク質目標 (g)
              </label>
              <input
                id="proteinGoal"
                v-model.number="pfcGoals.protein"
                type="number"
                class="input-field"
              />
            </div>
            <div>
              <label for="fatGoal" class="block text-sm font-medium text-gray-700 mb-2">
                脂質目標 (g)
              </label>
              <input
                id="fatGoal"
                v-model.number="pfcGoals.fat"
                type="number"
                class="input-field"
              />
            </div>
            <div>
              <label for="carbsGoal" class="block text-sm font-medium text-gray-700 mb-2">
                炭水化物目標 (g)
              </label>
              <input
                id="carbsGoal"
                v-model.number="pfcGoals.carbs"
                type="number"
                class="input-field"
              />
            </div>
          </div>
          <div class="flex space-x-3 mt-6">
            <button @click="savePfcSettings" class="flex-1 btn-primary">
              保存
            </button>
            <button @click="showPfcSettingsModal = false" class="flex-1 btn-secondary">
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWeightStore } from '@/stores/weight'
import { useMealStore } from '@/stores/meal'
import { useExerciseStore } from '@/stores/exercise'
import { useProgressStore } from '@/stores/progress'
import { useSettingsStore } from '@/stores/settings'
import BottomNavigation from '@/components/BottomNavigation.vue'

// ストアの初期化
const authStore = useAuthStore()
const weightStore = useWeightStore()
const mealStore = useMealStore()
const exerciseStore = useExerciseStore()
const progressStore = useProgressStore()
const settingsStore = useSettingsStore()

// リアクティブデータ
const showQuickAddModal = ref(false)
const showPfcSettingsModal = ref(false)
const isLoading = ref(true)

// ユーザー情報
const userProfile = computed(() => authStore.userProfile)

// 今日のサマリーデータ
const todayWeight = computed(() => {
  const latest = weightStore.latestRecord
  return latest ? formatWeight(latest.weight) : '--'
})

const weightChange = computed(() => weightStore.weightChange)

const todayCalories = computed(() => mealStore.todayCalories)

const calorieGoal = computed(() => settingsStore.userSettings.dailyCalorieGoal || 2000)

const todayExercise = computed(() => exerciseStore.todayCalories)

// PFCバランスデータ
const pfcData = computed(() => mealStore.todayPFC)

const pfcGoals = reactive({
  protein: 80,
  fat: 65,
  carbs: 250
})

const pfcProgress = computed(() => ({
  protein: Math.min((pfcData.value.protein / pfcGoals.protein) * 100, 100),
  fat: Math.min((pfcData.value.fat / pfcGoals.fat) * 100, 100),
  carbs: Math.min((pfcData.value.carbs / pfcGoals.carbs) * 100, 100)
}))

// 体重推移データ
const weightProgress = computed(() => progressStore.weightProgress)

// 最近の記録
const recentRecords = computed(() => {
  const records = []
  
  // 体重記録
  const weightRecords = weightStore.sortedRecords.slice(0, 2)
  weightRecords.forEach(record => {
    records.push({
      id: `weight-${record.id}`,
      type: 'weight',
      title: '体重記録',
      description: `${formatWeight(record.weight)}kg`,
      timestamp: new Date(record.timestamp)
    })
  })
  
  // 食事記録
  const mealRecords = mealStore.sortedRecords.slice(0, 2)
  mealRecords.forEach(record => {
    records.push({
      id: `meal-${record.id}`,
      type: 'meal',
      title: record.name,
      description: `${record.calories}kcal`,
      timestamp: new Date(record.timestamp)
    })
  })
  
  // 運動記録
  const exerciseRecords = exerciseStore.sortedRecords.slice(0, 2)
  exerciseRecords.forEach(record => {
    records.push({
      id: `exercise-${record.id}`,
      type: 'exercise',
      title: record.name,
      description: `${record.duration}分 • ${record.caloriesBurned}kcal`,
      timestamp: new Date(record.timestamp)
    })
  })
  
  // 日時順にソート
  return records
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)
})

// 週間目標
const weeklyGoals = computed(() => progressStore.weeklyGoals)

// 達成率
const achievementRate = computed(() => progressStore.achievementRate)

// 円グラフ用の計算
const circumference = computed(() => 2 * Math.PI * 36)

// 記録タイプ
const recordTypes = [
  {
    id: 'weight',
    name: '体重',
    path: '/weight-record',
    icon: 'fas fa-weight',
    bgColor: 'bg-pink-100 text-pink-600'
  },
  {
    id: 'meal',
    name: '食事',
    path: '/meal-record',
    icon: 'fas fa-utensils',
    bgColor: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'exercise',
    name: '運動',
    path: '/exercise-record',
    icon: 'fas fa-running',
    bgColor: 'bg-green-100 text-green-600'
  },
  {
    id: 'menu',
    name: '運動メニュー',
    path: '/exercise-menu',
    icon: 'fas fa-dumbbell',
    bgColor: 'bg-purple-100 text-purple-600'
  }
]

// メソッド
const getRecordBgColor = (type) => {
  const colors = {
    weight: 'bg-blue-50',
    meal: 'bg-green-50',
    exercise: 'bg-orange-50'
  }
  return colors[type] || 'bg-gray-50'
}

const getRecordIconBg = (type) => {
  const colors = {
    weight: 'bg-pink-100 text-pink-600',
    meal: 'bg-blue-100 text-blue-600',
    exercise: 'bg-green-100 text-green-600'
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

const getRecordIcon = (type) => {
  const icons = {
    weight: 'fas fa-weight',
    meal: 'fas fa-utensils',
    exercise: 'fas fa-running'
  }
  return icons[type] || 'fas fa-clipboard'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}日前`
  } else if (hours > 0) {
    return `${hours}時間前`
  } else {
    return '今'
  }
}

const formatWeight = (weight) => {
  return weight ? weight.toFixed(1) : '--'
}

const formatWeightChange = (change) => {
  if (!change) return ''
  const sign = change.isPositive ? '-' : '+'
  const value = Math.abs(change.value).toFixed(1)
  return `${sign}${value}kg`
}

const savePfcSettings = async () => {
  try {
    await settingsStore.updateGoals({
      protein: pfcGoals.protein,
      fat: pfcGoals.fat,
      carbs: pfcGoals.carbs
    })
    showPfcSettingsModal.value = false
  } catch (error) {
    console.error('PFC設定保存エラー:', error)
  }
}

const loadData = async () => {
  try {
    isLoading.value = true
    
    // 各ストアのデータを読み込み
    await Promise.all([
      weightStore.loadRecords(),
      mealStore.loadData(),
      exerciseStore.loadData(),
      progressStore.loadProgressData(),
      settingsStore.loadSettings()
    ])
    
    // PFC目標を設定から読み込み
    const settings = settingsStore.userSettings
    pfcGoals.protein = settings.pfcGoals?.protein || 80
    pfcGoals.fat = settings.pfcGoals?.fat || 65
    pfcGoals.carbs = settings.pfcGoals?.carbs || 250
    
  } catch (error) {
    console.error('データ読み込みエラー:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-6;
}

.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}

.record-type-btn {
  @apply transition-all duration-200;
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 