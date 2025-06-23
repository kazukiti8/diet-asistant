<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/records" class="mr-3 text-gray-600 hover:text-gray-800">
              <i class="fas fa-arrow-left text-xl"></i>
            </router-link>
            <h1 class="text-xl font-bold">食事記録</h1>
          </div>
          <button @click="showHistoryModal = true" class="p-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-history text-xl"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Today's Summary -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">今日の食事</h2>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ todaySummary.totalCalories }}</div>
              <div class="text-sm text-gray-600">総カロリー</div>
              <div class="text-xs text-blue-600">目標: {{ calorieGoal }}</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ todaySummary.mealCount }}</div>
              <div class="text-sm text-gray-600">食事回数</div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ todaySummary.remaining }}</div>
              <div class="text-sm text-gray-600">残りカロリー</div>
            </div>
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              class="bg-blue-600 h-3 rounded-full transition-all duration-300"
              :style="{ width: Math.min((todaySummary.totalCalories / calorieGoal) * 100, 100) + '%' }"
            ></div>
          </div>
          
          <div class="text-center">
            <button @click="showInputModal = true" class="btn-primary">
              <i class="fas fa-plus mr-2"></i>食事を記録
            </button>
          </div>
        </div>
      </section>

      <!-- Today's Meals -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">今日の食事</h2>
            <button @click="showInputModal = true" class="text-blue-600 hover:text-blue-800 text-sm">
              <i class="fas fa-plus mr-1"></i>追加
            </button>
          </div>
          
          <div v-if="todayMeals.length > 0" class="space-y-3">
            <div
              v-for="meal in todayMeals"
              :key="meal.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="editMeal(meal)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getMealTypeBg(meal.type)">
                  <i :class="getMealTypeIcon(meal.type)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ meal.name }}</p>
                  <p class="text-sm text-gray-600">{{ meal.description }}</p>
                  <p class="text-xs text-gray-500">{{ formatTime(meal.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ meal.calories }}kcal</div>
                <div class="text-xs text-gray-500">
                  P: {{ meal.protein }}g F: {{ meal.fat }}g C: {{ meal.carbs }}g
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-utensils text-3xl mb-2"></i>
            <p>今日の食事を記録しましょう</p>
            <button @click="showInputModal = true" class="mt-2 text-blue-600 hover:text-blue-800">
              最初の食事を記録
            </button>
          </div>
        </div>
      </section>

      <!-- Nutrition Balance -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">栄養バランス</h2>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ nutritionBalance.protein }}g</div>
              <div class="text-sm text-gray-600">タンパク質</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-blue-600 h-2 rounded-full" :style="{ width: nutritionProgress.protein + '%' }"></div>
              </div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ nutritionBalance.fat }}g</div>
              <div class="text-sm text-gray-600">脂質</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-green-600 h-2 rounded-full" :style="{ width: nutritionProgress.fat + '%' }"></div>
              </div>
            </div>
            <div class="text-center p-3 bg-orange-50 rounded-lg">
              <div class="text-lg font-bold text-orange-600">{{ nutritionBalance.carbs }}g</div>
              <div class="text-sm text-gray-600">炭水化物</div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div class="bg-orange-600 h-2 rounded-full" :style="{ width: nutritionProgress.carbs + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Meals -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">最近の食事</h2>
            <button @click="showHistoryModal = true" class="text-blue-600 hover:text-blue-800 text-sm">
              すべて見る
            </button>
          </div>
          
          <div v-if="recentMeals.length > 0" class="space-y-3">
            <div
              v-for="meal in recentMeals"
              :key="meal.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewMeal(meal)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getMealTypeBg(meal.type)">
                  <i :class="getMealTypeIcon(meal.type)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ meal.name }}</p>
                  <p class="text-sm text-gray-600">{{ meal.description }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(meal.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ meal.calories }}kcal</div>
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

    <!-- Meal Input Modal -->
    <div v-if="showInputModal" class="modal-overlay" @click="showInputModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">{{ editingMeal ? '食事を編集' : '食事を記録' }}</h3>
          <button @click="showInputModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <form @submit.prevent="saveMeal">
            <div class="mb-4">
              <label for="mealType" class="block text-sm font-medium text-gray-700 mb-2">
                食事タイプ
              </label>
              <select
                id="mealType"
                v-model="mealForm.type"
                class="input-field"
                required
              >
                <option value="">選択してください</option>
                <option value="breakfast">朝食</option>
                <option value="lunch">昼食</option>
                <option value="dinner">夕食</option>
                <option value="snack">間食</option>
              </select>
            </div>
            
            <div class="mb-4">
              <label for="mealName" class="block text-sm font-medium text-gray-700 mb-2">
                食事名
              </label>
              <input
                id="mealName"
                v-model="mealForm.name"
                type="text"
                class="input-field"
                placeholder="例: 朝食、昼食、夕食"
                required
              />
            </div>
            
            <div class="mb-4">
              <label for="mealDescription" class="block text-sm font-medium text-gray-700 mb-2">
                内容
              </label>
              <textarea
                id="mealDescription"
                v-model="mealForm.description"
                class="input-field"
                rows="3"
                placeholder="食べたものを記録"
                required
              ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label for="calories" class="block text-sm font-medium text-gray-700 mb-2">
                  カロリー (kcal)
                </label>
                <input
                  id="calories"
                  v-model.number="mealForm.calories"
                  type="number"
                  class="input-field"
                  placeholder="例: 350"
                  required
                />
              </div>
              <div>
                <label for="mealTime" class="block text-sm font-medium text-gray-700 mb-2">
                  時間
                </label>
                <input
                  id="mealTime"
                  v-model="mealForm.time"
                  type="time"
                  class="input-field"
                  required
                />
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label for="protein" class="block text-sm font-medium text-gray-700 mb-2">
                  タンパク質 (g)
                </label>
                <input
                  id="protein"
                  v-model.number="mealForm.protein"
                  type="number"
                  class="input-field"
                  placeholder="例: 15"
                />
              </div>
              <div>
                <label for="fat" class="block text-sm font-medium text-gray-700 mb-2">
                  脂質 (g)
                </label>
                <input
                  id="fat"
                  v-model.number="mealForm.fat"
                  type="number"
                  class="input-field"
                  placeholder="例: 8"
                />
              </div>
              <div>
                <label for="carbs" class="block text-sm font-medium text-gray-700 mb-2">
                  炭水化物 (g)
                </label>
                <input
                  id="carbs"
                  v-model.number="mealForm.carbs"
                  type="number"
                  class="input-field"
                  placeholder="例: 45"
                />
              </div>
            </div>
            
            <div class="flex space-x-3">
              <button type="submit" class="flex-1 btn-primary">
                {{ editingMeal ? '更新' : '記録' }}
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
          <h3 class="text-lg font-semibold">食事記録履歴</h3>
          <button @click="showHistoryModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="mealHistory.length > 0" class="space-y-3">
            <div
              v-for="meal in mealHistory"
              :key="meal.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewMeal(meal)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                     :class="getMealTypeBg(meal.type)">
                  <i :class="getMealTypeIcon(meal.type)"></i>
                </div>
                <div>
                  <p class="font-medium">{{ meal.name }}</p>
                  <p class="text-sm text-gray-600">{{ meal.description }}</p>
                  <p class="text-xs text-gray-500">{{ formatDateTime(meal.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ meal.calories }}kcal</div>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

// リアクティブデータ
const showInputModal = ref(false)
const showHistoryModal = ref(false)
const editingMeal = ref(null)

// カロリー目標
const calorieGoal = ref(1500)

// 食事フォーム
const mealForm = reactive({
  type: '',
  name: '',
  description: '',
  calories: '',
  protein: '',
  fat: '',
  carbs: '',
  time: ''
})

// 今日の食事
const todayMeals = ref([
  {
    id: 1,
    type: 'breakfast',
    name: '朝食',
    description: 'パン、コーヒー、ヨーグルト',
    calories: 350,
    protein: 12,
    fat: 8,
    carbs: 45,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 2,
    type: 'lunch',
    name: '昼食',
    description: 'サラダ、鶏肉、ご飯',
    calories: 450,
    protein: 25,
    fat: 15,
    carbs: 55,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
  }
])

// 最近の食事
const recentMeals = ref([
  {
    id: 1,
    type: 'breakfast',
    name: '朝食',
    description: 'パン、コーヒー、ヨーグルト',
    calories: 350,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 2,
    type: 'lunch',
    name: '昼食',
    description: 'サラダ、鶏肉、ご飯',
    calories: 450,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: 3,
    type: 'dinner',
    name: '夕食',
    description: '魚、野菜、味噌汁',
    calories: 380,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
])

// 食事履歴
const mealHistory = ref([
  {
    id: 1,
    type: 'breakfast',
    name: '朝食',
    description: 'パン、コーヒー、ヨーグルト',
    calories: 350,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 2,
    type: 'lunch',
    name: '昼食',
    description: 'サラダ、鶏肉、ご飯',
    calories: 450,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: 3,
    type: 'dinner',
    name: '夕食',
    description: '魚、野菜、味噌汁',
    calories: 380,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    type: 'snack',
    name: '間食',
    description: 'りんご',
    calories: 80,
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000)
  }
])

// 計算プロパティ
const todaySummary = computed(() => {
  const totalCalories = todayMeals.value.reduce((sum, meal) => sum + meal.calories, 0)
  return {
    totalCalories,
    mealCount: todayMeals.value.length,
    remaining: Math.max(0, calorieGoal.value - totalCalories)
  }
})

const nutritionBalance = computed(() => {
  return todayMeals.value.reduce((balance, meal) => ({
    protein: balance.protein + (meal.protein || 0),
    fat: balance.fat + (meal.fat || 0),
    carbs: balance.carbs + (meal.carbs || 0)
  }), { protein: 0, fat: 0, carbs: 0 })
})

const nutritionProgress = computed(() => {
  const goals = { protein: 60, fat: 50, carbs: 200 }
  return {
    protein: Math.min((nutritionBalance.value.protein / goals.protein) * 100, 100),
    fat: Math.min((nutritionBalance.value.fat / goals.fat) * 100, 100),
    carbs: Math.min((nutritionBalance.value.carbs / goals.carbs) * 100, 100)
  }
})

// メソッド
const getMealTypeBg = (type) => {
  const colors = {
    breakfast: 'bg-orange-100 text-orange-600',
    lunch: 'bg-blue-100 text-blue-600',
    dinner: 'bg-purple-100 text-purple-600',
    snack: 'bg-green-100 text-green-600'
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

const getMealTypeIcon = (type) => {
  const icons = {
    breakfast: 'fas fa-sun',
    lunch: 'fas fa-cloud-sun',
    dinner: 'fas fa-moon',
    snack: 'fas fa-apple-alt'
  }
  return icons[type] || 'fas fa-utensils'
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

const saveMeal = () => {
  if (!mealForm.type || !mealForm.name || !mealForm.calories) return
  
  const newMeal = {
    id: editingMeal.value ? editingMeal.value.id : Date.now(),
    type: mealForm.type,
    name: mealForm.name,
    description: mealForm.description,
    calories: mealForm.calories,
    protein: mealForm.protein || 0,
    fat: mealForm.fat || 0,
    carbs: mealForm.carbs || 0,
    timestamp: new Date()
  }
  
  if (editingMeal.value) {
    // 編集モード
    const index = todayMeals.value.findIndex(meal => meal.id === editingMeal.value.id)
    if (index !== -1) {
      todayMeals.value[index] = newMeal
    }
    editingMeal.value = null
  } else {
    // 新規追加
    todayMeals.value.unshift(newMeal)
    recentMeals.value.unshift(newMeal)
    mealHistory.value.unshift(newMeal)
  }
  
  // フォームをリセット
  resetMealForm()
  showInputModal.value = false
  
  window.$notify?.success(editingMeal.value ? '食事を更新しました' : '食事を記録しました')
}

const editMeal = (meal) => {
  editingMeal.value = meal
  mealForm.type = meal.type
  mealForm.name = meal.name
  mealForm.description = meal.description
  mealForm.calories = meal.calories
  mealForm.protein = meal.protein || ''
  mealForm.fat = meal.fat || ''
  mealForm.carbs = meal.carbs || ''
  mealForm.time = formatTime(meal.timestamp)
  showInputModal.value = true
}

const viewMeal = (meal) => {
  // 食事の詳細表示（必要に応じて実装）
  console.log('View meal:', meal)
}

const resetMealForm = () => {
  Object.keys(mealForm).forEach(key => {
    mealForm[key] = ''
  })
}

onMounted(() => {
  // 初期化処理
})
</script> 