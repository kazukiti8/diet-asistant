<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/home" class="mr-3 text-gray-600 hover:text-gray-800">
              <i class="fas fa-arrow-left text-xl"></i>
            </router-link>
            <h1 class="text-xl font-bold">運動記録</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="showFavoriteModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-heart text-xl"></i>
            </button>
            <button @click="showHistoryModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-history text-xl"></i>
            </button>
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
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">今日の運動</h2>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ todaySummary.totalCalories }}</div>
              <div class="text-sm text-gray-600">消費カロリー</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ todaySummary.totalDuration }}</div>
              <div class="text-sm text-gray-600">運動時間(分)</div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ todaySummary.exerciseCount }}</div>
              <div class="text-sm text-gray-600">運動回数</div>
            </div>
          </div>
          
          <div class="text-center">
            <button @click="showInputModal = true" class="btn-primary">
              <i class="fas fa-plus mr-2"></i>運動を記録
            </button>
          </div>
        </div>
      </section>

      <!-- Today's Exercises -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">今日の運動</h2>
            <div class="flex space-x-2">
              <button @click="showMenuModal = true" class="text-green-600 hover:text-green-800 text-sm">
                <i class="fas fa-dumbbell mr-1"></i>メニュー
              </button>
              <button @click="showInputModal = true" class="text-blue-600 hover:text-blue-800 text-sm">
                <i class="fas fa-plus mr-1"></i>追加
              </button>
            </div>
          </div>
          
          <div v-if="todayExercises.length > 0" class="space-y-3">
            <div
              v-for="exercise in todayExercises"
              :key="exercise.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewExercise(exercise)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getExerciseTypeBg(exercise.exerciseType)">
                  <i :class="getExerciseTypeIcon(exercise.exerciseType)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ exercise.name }}</p>
                  <p class="text-sm text-gray-600">{{ exercise.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ formatTime(exercise.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ exercise.caloriesBurned }}kcal</div>
                <div class="text-xs text-gray-500">{{ exercise.duration }}分</div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-running text-3xl mb-2"></i>
            <p>今日の運動を記録しましょう</p>
            <button @click="showInputModal = true" class="mt-2 text-blue-600 hover:text-blue-800">
              最初の運動を記録
            </button>
          </div>
        </div>
      </section>

      <!-- Exercise Stats -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">運動統計</h2>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ weeklyStats.totalCalories }}</div>
              <div class="text-sm text-gray-600">週間消費カロリー</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ weeklyStats.totalDuration }}</div>
              <div class="text-sm text-gray-600">週間運動時間(分)</div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-lg font-bold text-orange-600">{{ weeklyStats.averageDailyCalories }}</div>
              <div class="text-sm text-gray-600">平均日間消費カロリー</div>
            </div>
            <div class="text-center p-3 bg-purple-50 rounded-lg">
              <div class="text-lg font-bold text-purple-600">{{ weeklyStats.exerciseDays }}</div>
              <div class="text-sm text-gray-600">運動日数</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Exercises -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">最近の運動</h2>
            <button @click="showHistoryModal = true" class="text-blue-600 hover:text-blue-800 text-sm">
              すべて見る
            </button>
          </div>
          
          <div v-if="recentExercises.length > 0" class="space-y-3">
            <div
              v-for="exercise in recentExercises"
              :key="exercise.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewExercise(exercise)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getExerciseTypeBg(exercise.exerciseType)">
                  <i :class="getExerciseTypeIcon(exercise.exerciseType)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ exercise.name }}</p>
                  <p class="text-sm text-gray-600">{{ exercise.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(exercise.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ exercise.caloriesBurned }}kcal</div>
                <i class="fas fa-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-clipboard-list text-3xl mb-2"></i>
            <p>まだ記録がありません</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Exercise Input Modal -->
    <div v-if="showInputModal" class="modal-overlay" @click="showInputModal = false">
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">{{ editingExercise ? '運動を編集' : '運動を記録' }}</h3>
          <button @click="showInputModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <form @submit.prevent="saveExercise">
            <div class="mb-4">
              <label for="exerciseType" class="block text-sm font-medium text-gray-700 mb-2">
                運動タイプ
              </label>
              <select
                id="exerciseType"
                v-model="exerciseForm.exerciseType"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="cardio">有酸素運動</option>
                <option value="strength">筋力トレーニング</option>
                <option value="flexibility">ストレッチ・柔軟</option>
                <option value="sports">スポーツ</option>
              </select>
            </div>
            
            <div class="mb-4">
              <label for="exerciseName" class="block text-sm font-medium text-gray-700 mb-2">
                運動名
              </label>
              <input
                id="exerciseName"
                v-model="exerciseForm.name"
                type="text"
                class="input-field"
                placeholder="例: ウォーキング、スクワット"
                required
              />
            </div>
            
            <div class="mb-4">
              <label for="exerciseNotes" class="block text-sm font-medium text-gray-700 mb-2">
                メモ
              </label>
              <textarea
                id="exerciseNotes"
                v-model="exerciseForm.notes"
                class="input-field"
                rows="3"
                placeholder="運動の詳細や感想を記録"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
                  時間 (分)
                </label>
                <input
                  id="duration"
                  v-model.number="exerciseForm.duration"
                  type="number"
                  class="input-field"
                  placeholder="例: 30"
                  required
                />
              </div>
              <div>
                <label for="intensity" class="block text-sm font-medium text-gray-700 mb-2">
                  強度
                </label>
                <select
                  id="intensity"
                  v-model="exerciseForm.intensity"
                  class="input-field"
                  required
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label for="sets" class="block text-sm font-medium text-gray-700 mb-2">
                  セット数
                </label>
                <input
                  id="sets"
                  v-model.number="exerciseForm.sets"
                  type="number"
                  class="input-field"
                  placeholder="例: 3"
                />
              </div>
              <div>
                <label for="reps" class="block text-sm font-medium text-gray-700 mb-2">
                  回数
                </label>
                <input
                  id="reps"
                  v-model.number="exerciseForm.reps"
                  type="number"
                  class="input-field"
                  placeholder="例: 10"
                />
              </div>
              <div>
                <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">
                  重量 (kg)
                </label>
                <input
                  id="weight"
                  v-model.number="exerciseForm.weight"
                  type="number"
                  class="input-field"
                  placeholder="例: 20"
                />
              </div>
            </div>
            
            <div class="mb-4">
              <label for="distance" class="block text-sm font-medium text-gray-700 mb-2">
                距離 (km)
              </label>
              <input
                id="distance"
                v-model.number="exerciseForm.distance"
                type="number"
                class="input-field"
                placeholder="例: 5.0"
              />
            </div>
            
            <div class="mb-4">
              <label for="caloriesBurned" class="block text-sm font-medium text-gray-700 mb-2">
                消費カロリー (kcal)
              </label>
              <input
                id="caloriesBurned"
                v-model.number="exerciseForm.caloriesBurned"
                type="number"
                class="input-field"
                placeholder="例: 150"
                required
              />
            </div>
            
            <div class="flex space-x-3">
              <button type="submit" class="flex-1 btn-primary">
                {{ editingExercise ? '更新' : '記録' }}
              </button>
              <button type="button" @click="showInputModal = false" class="flex-1 btn-secondary">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay" @click="showHistoryModal = false">
      <div class="modal-content max-h-96 overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">運動記録履歴</h3>
          <button @click="showHistoryModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="exerciseHistory.length > 0" class="space-y-3">
            <div
              v-for="exercise in exerciseHistory"
              :key="exercise.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewExercise(exercise)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getExerciseTypeBg(exercise.exerciseType)">
                  <i :class="getExerciseTypeIcon(exercise.exerciseType)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ exercise.name }}</p>
                  <p class="text-sm text-gray-600">{{ exercise.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ formatDateTime(exercise.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ exercise.caloriesBurned }}kcal</div>
                <i class="fas fa-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-clipboard-list text-3xl mb-2"></i>
            <p>まだ記録がありません</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Favorite Menu Modal -->
    <div v-if="showFavoriteModal" class="modal-overlay" @click="showFavoriteModal = false">
      <div class="modal-content max-h-96 overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">お気に入りメニュー</h3>
          <button @click="showFavoriteModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="favoriteMenus.length > 0" class="space-y-3">
            <div
              v-for="menu in favoriteMenus"
              :key="menu.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="useFavoriteMenu(menu)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                  <i class="fas fa-heart"></i>
                </div>
                <div>
                  <p class="font-medium">{{ menu.name }}</p>
                  <p class="text-sm text-gray-600">{{ menu.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ menu.duration }}分</p>
                </div>
              </div>
              <div class="text-right">
                <button @click.stop="removeFavoriteMenu(menu.id)" class="text-red-600 hover:text-red-800">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-heart text-3xl mb-2"></i>
            <p>お気に入りメニューがありません</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Exercise Menu Modal -->
    <div v-if="showMenuModal" class="modal-overlay" @click="showMenuModal = false">
      <div class="modal-content max-h-96 overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">運動メニュー</h3>
          <button @click="showMenuModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="exerciseMenus.length > 0" class="space-y-3">
            <div
              v-for="menu in exerciseMenus"
              :key="menu.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="useExerciseMenu(menu)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                  <i class="fas fa-dumbbell"></i>
                </div>
                <div>
                  <p class="font-medium">{{ menu.name }}</p>
                  <p class="text-sm text-gray-600">{{ menu.notes || '詳細なし' }}</p>
                  <p class="text-xs text-gray-500">{{ menu.duration }}分</p>
                </div>
              </div>
              <div class="text-right">
                <button @click.stop="toggleFavorite(menu)" class="text-gray-400 hover:text-red-600">
                  <i :class="isFavorite(menu.id) ? 'fas fa-heart text-red-600' : 'far fa-heart'"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-dumbbell text-3xl mb-2"></i>
            <p>運動メニューがありません</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Exercise Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">運動詳細</h3>
          <button @click="showDetailModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="selectedExercise" class="space-y-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">{{ selectedExercise.caloriesBurned }}kcal</div>
              <p class="text-sm text-gray-600">{{ formatDateTime(selectedExercise.timestamp) }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-lg font-bold text-blue-600">{{ selectedExercise.duration }}分</div>
                <div class="text-sm text-gray-600">運動時間</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-lg font-bold text-green-600">{{ getIntensityLabel(selectedExercise.intensity) }}</div>
                <div class="text-sm text-gray-600">強度</div>
              </div>
            </div>
            
            <div v-if="selectedExercise.sets || selectedExercise.reps || selectedExercise.weight" class="grid grid-cols-3 gap-4">
              <div v-if="selectedExercise.sets" class="text-center p-3 bg-orange-50 rounded-lg">
                <div class="text-lg font-bold text-orange-600">{{ selectedExercise.sets }}</div>
                <div class="text-sm text-gray-600">セット数</div>
              </div>
              <div v-if="selectedExercise.reps" class="text-center p-3 bg-purple-50 rounded-lg">
                <div class="text-lg font-bold text-purple-600">{{ selectedExercise.reps }}</div>
                <div class="text-sm text-gray-600">回数</div>
              </div>
              <div v-if="selectedExercise.weight" class="text-center p-3 bg-pink-50 rounded-lg">
                <div class="text-lg font-bold text-pink-600">{{ selectedExercise.weight }}kg</div>
                <div class="text-sm text-gray-600">重量</div>
              </div>
            </div>
            
            <div v-if="selectedExercise.distance" class="text-center p-3 bg-indigo-50 rounded-lg">
              <div class="text-lg font-bold text-indigo-600">{{ selectedExercise.distance }}km</div>
              <div class="text-sm text-gray-600">距離</div>
            </div>
            
            <div v-if="selectedExercise.notes" class="p-3 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-1">メモ</div>
              <div class="text-gray-600">{{ selectedExercise.notes }}</div>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button @click="editExercise(selectedExercise)" class="flex-1 btn-secondary">
              <i class="fas fa-edit mr-2"></i>編集
            </button>
            <button @click="deleteExercise" class="flex-1 btn-danger">
              <i class="fas fa-trash mr-2"></i>削除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useExerciseStore } from '@/stores/exercise'
import BottomNavigation from '@/components/BottomNavigation.vue'

// ストアの初期化
const exerciseStore = useExerciseStore()

// リアクティブデータ
const showInputModal = ref(false)
const showHistoryModal = ref(false)
const showDetailModal = ref(false)
const showFavoriteModal = ref(false)
const showMenuModal = ref(false)
const isLoading = ref(true)
const editingExercise = ref(null)
const selectedExercise = ref(null)

// 運動フォーム
const exerciseForm = reactive({
  exerciseType: '',
  name: '',
  notes: '',
  duration: '',
  intensity: 'medium',
  sets: '',
  reps: '',
  weight: '',
  distance: '',
  caloriesBurned: ''
})

// 計算プロパティ
const todayExercises = computed(() => exerciseStore.todayRecords)
const recentExercises = computed(() => exerciseStore.sortedRecords.slice(0, 5))
const exerciseHistory = computed(() => exerciseStore.sortedRecords)
const favoriteMenus = computed(() => exerciseStore.favoriteMenus)
const exerciseMenus = computed(() => exerciseStore.exerciseMenus)

const todaySummary = computed(() => {
  return {
    totalCalories: exerciseStore.todayCalories,
    totalDuration: exerciseStore.todayDuration,
    exerciseCount: todayExercises.value.length
  }
})

const weeklyStats = computed(() => {
  return {
    totalCalories: exerciseStore.weeklyCalories,
    totalDuration: exerciseStore.weeklyDuration,
    averageDailyCalories: exerciseStore.averageDailyCalories,
    exerciseDays: new Set(
      exerciseStore.weeklyRecords.map(record => 
        new Date(record.timestamp).toDateString()
      )
    ).size
  }
})

// メソッド
const getExerciseTypeBg = (type) => {
  const colors = {
    cardio: 'bg-red-100 text-red-600',
    strength: 'bg-blue-100 text-blue-600',
    flexibility: 'bg-green-100 text-green-600',
    sports: 'bg-purple-100 text-purple-600'
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

const getExerciseTypeIcon = (type) => {
  const icons = {
    cardio: 'fas fa-heartbeat',
    strength: 'fas fa-dumbbell',
    flexibility: 'fas fa-child',
    sports: 'fas fa-futbol'
  }
  return icons[type] || 'fas fa-running'
}

const getIntensityLabel = (intensity) => {
  const labels = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return labels[intensity] || '中'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('ja-JP', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const saveExercise = async () => {
  if (!exerciseForm.exerciseType || !exerciseForm.name || !exerciseForm.duration || !exerciseForm.caloriesBurned) return
  
  try {
    const exerciseData = {
      exerciseType: exerciseForm.exerciseType,
      name: exerciseForm.name,
      notes: exerciseForm.notes || '',
      duration: exerciseForm.duration,
      intensity: exerciseForm.intensity,
      sets: exerciseForm.sets || null,
      reps: exerciseForm.reps || null,
      weight: exerciseForm.weight || null,
      distance: exerciseForm.distance || null,
      caloriesBurned: exerciseForm.caloriesBurned
    }

    if (editingExercise.value) {
      // 編集モード
      await exerciseStore.updateExerciseRecord(editingExercise.value.id, exerciseData)
      editingExercise.value = null
    } else {
      // 新規追加
      await exerciseStore.addExerciseRecord(exerciseData)
    }
    
    // フォームをリセット
    resetExerciseForm()
    showInputModal.value = false
  } catch (error) {
    console.error('運動記録保存エラー:', error)
  }
}

const editExercise = (exercise) => {
  editingExercise.value = exercise
  exerciseForm.exerciseType = exercise.exerciseType
  exerciseForm.name = exercise.name
  exerciseForm.notes = exercise.notes || ''
  exerciseForm.duration = exercise.duration
  exerciseForm.intensity = exercise.intensity
  exerciseForm.sets = exercise.sets || ''
  exerciseForm.reps = exercise.reps || ''
  exerciseForm.weight = exercise.weight || ''
  exerciseForm.distance = exercise.distance || ''
  exerciseForm.caloriesBurned = exercise.caloriesBurned
  
  showDetailModal.value = false
  showInputModal.value = true
}

const viewExercise = (exercise) => {
  selectedExercise.value = exercise
  showDetailModal.value = true
}

const deleteExercise = async () => {
  if (!selectedExercise.value) return
  
  if (confirm('この運動記録を削除しますか？')) {
    try {
      await exerciseStore.deleteExerciseRecord(selectedExercise.value.id)
      showDetailModal.value = false
      selectedExercise.value = null
    } catch (error) {
      console.error('運動記録削除エラー:', error)
    }
  }
}

const useFavoriteMenu = (menu) => {
  exerciseForm.exerciseType = menu.exerciseType || 'cardio'
  exerciseForm.name = menu.name
  exerciseForm.notes = menu.notes || ''
  exerciseForm.duration = menu.duration
  exerciseForm.intensity = menu.intensity || 'medium'
  exerciseForm.sets = menu.sets || ''
  exerciseForm.reps = menu.reps || ''
  exerciseForm.weight = menu.weight || ''
  exerciseForm.distance = menu.distance || ''
  exerciseForm.caloriesBurned = menu.caloriesBurned || ''
  
  showFavoriteModal.value = false
  showInputModal.value = true
}

const useExerciseMenu = (menu) => {
  exerciseForm.exerciseType = menu.exerciseType || 'cardio'
  exerciseForm.name = menu.name
  exerciseForm.notes = menu.notes || ''
  exerciseForm.duration = menu.duration
  exerciseForm.intensity = menu.intensity || 'medium'
  exerciseForm.sets = menu.sets || ''
  exerciseForm.reps = menu.reps || ''
  exerciseForm.weight = menu.weight || ''
  exerciseForm.distance = menu.distance || ''
  exerciseForm.caloriesBurned = menu.caloriesBurned || ''
  
  showMenuModal.value = false
  showInputModal.value = true
}

const removeFavoriteMenu = async (menuId) => {
  if (confirm('このお気に入りメニューを削除しますか？')) {
    try {
      await exerciseStore.removeFavoriteMenu(menuId)
    } catch (error) {
      console.error('お気に入りメニュー削除エラー:', error)
    }
  }
}

const toggleFavorite = async (menu) => {
  try {
    if (isFavorite(menu.id)) {
      await exerciseStore.removeFavoriteMenu(menu.id)
    } else {
      await exerciseStore.addFavoriteMenu(menu)
    }
  } catch (error) {
    console.error('お気に入り切り替えエラー:', error)
  }
}

const isFavorite = (menuId) => {
  return favoriteMenus.value.some(menu => menu.id === menuId)
}

const resetExerciseForm = () => {
  Object.keys(exerciseForm).forEach(key => {
    exerciseForm[key] = key === 'intensity' ? 'medium' : ''
  })
  editingExercise.value = null
}

const loadData = async () => {
  try {
    isLoading.value = true
    await exerciseStore.loadData()
  } catch (error) {
    console.error('データ読み込みエラー:', error)
  } finally {
    isLoading.value = false
  }
}

const route = useRoute()

// onMountedの中でクエリパラメータをチェック
onMounted(() => {
  loadData()

  // メニュー自動開始機能
  const { menuId, autoStart } = route.query
  if (menuId && autoStart === 'true') {
    // メニューIDで該当メニューを検索
    const menu = exerciseMenus.value.find(m => m.id === menuId)
    if (menu) {
      useExerciseMenu(menu)
    }
  }
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

.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}
</style> 