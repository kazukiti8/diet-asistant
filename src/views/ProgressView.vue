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
            <h1 class="text-xl font-bold">進捗詳細</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="exportProgress" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-download text-xl"></i>
            </button>
            <button @click="showPeriodModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-calendar text-xl"></i>
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
      <!-- Period Selector -->
      <section class="mb-6">
        <div class="card">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold">期間選択</h2>
            <div class="flex space-x-2">
              <button
                v-for="period in periodOptions"
                :key="period.value"
                @click="selectPeriod(period.value)"
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium transition',
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Goal Achievement Summary -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">目標達成状況</h2>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ goalProgress.weightProgress }}%</div>
              <div class="text-sm text-gray-600">体重目標達成率</div>
              <div class="text-xs text-gray-500 mt-1">
                {{ goalProgress.currentWeight }}kg → {{ goalProgress.targetWeight }}kg
              </div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ goalProgress.calorieProgress }}%</div>
              <div class="text-sm text-gray-600">カロリー目標達成率</div>
              <div class="text-xs text-gray-500 mt-1">
                平均 {{ goalProgress.averageCalories }}kcal/日
              </div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ goalProgress.exerciseProgress }}%</div>
              <div class="text-sm text-gray-600">運動目標達成率</div>
              <div class="text-xs text-gray-500 mt-1">
                週{{ goalProgress.exerciseDays }}日
              </div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ goalProgress.overallProgress }}%</div>
              <div class="text-sm text-gray-600">総合達成率</div>
              <div class="text-xs text-gray-500 mt-1">
                全体的な進捗
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">総合進捗</span>
              <span class="text-sm text-gray-500">{{ goalProgress.overallProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                :style="{ width: goalProgress.overallProgress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Weight Progress Chart -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">体重変化</h2>
            <div class="flex space-x-2">
              <button @click="toggleChartType('weight')" class="text-blue-600 hover:text-blue-800 text-sm">
                <i class="fas fa-chart-line mr-1"></i>{{ chartType === 'line' ? '棒グラフ' : '折れ線グラフ' }}
              </button>
            </div>
          </div>
          
          <div v-if="weightData.length > 0" class="h-64">
            <LineChart
              v-if="chartType === 'line'"
              :chart-data="weightChartData"
              :chart-options="weightChartOptions"
            />
            <BarChart
              v-else
              :chart-data="weightChartData"
              :chart-options="weightChartOptions"
            />
          </div>
          
          <div v-else class="text-center py-12 text-gray-500">
            <i class="fas fa-chart-line text-3xl mb-2"></i>
            <p>体重データがありません</p>
            <router-link to="/weight-record" class="mt-2 text-blue-600 hover:text-blue-800">
              体重を記録する
            </router-link>
          </div>
        </div>
      </section>

      <!-- PFC Balance Chart -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">PFCバランス</h2>
          
          <div v-if="pfcData.hasData" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="h-64">
              <DoughnutChart
                :chart-data="pfcChartData"
                :chart-options="pfcChartOptions"
              />
            </div>
            
            <div class="space-y-4">
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-3 bg-blue-50 rounded-lg">
                  <div class="text-lg font-bold text-blue-600">{{ pfcData.protein }}g</div>
                  <div class="text-sm text-gray-600">タンパク質</div>
                  <div class="text-xs text-gray-500">{{ pfcData.proteinRatio }}%</div>
                </div>
                <div class="text-center p-3 bg-green-50 rounded-lg">
                  <div class="text-lg font-bold text-green-600">{{ pfcData.fat }}g</div>
                  <div class="text-sm text-gray-600">脂質</div>
                  <div class="text-xs text-gray-500">{{ pfcData.fatRatio }}%</div>
                </div>
                <div class="text-center p-3 bg-orange-50 rounded-lg">
                  <div class="text-lg font-bold text-orange-600">{{ pfcData.carbs }}g</div>
                  <div class="text-sm text-gray-600">炭水化物</div>
                  <div class="text-xs text-gray-500">{{ pfcData.carbsRatio }}%</div>
                </div>
              </div>
              
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="text-sm font-medium text-gray-700 mb-2">目標との比較</div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">タンパク質</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-blue-500 h-2 rounded-full"
                          :style="{ width: Math.min(pfcData.proteinRatio, 100) + '%' }"
                        ></div>
                      </div>
                      <span class="text-xs text-gray-500">{{ pfcData.proteinRatio }}%</span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">脂質</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-green-500 h-2 rounded-full"
                          :style="{ width: Math.min(pfcData.fatRatio, 100) + '%' }"
                        ></div>
                      </div>
                      <span class="text-xs text-gray-500">{{ pfcData.fatRatio }}%</span>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">炭水化物</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-orange-500 h-2 rounded-full"
                          :style="{ width: Math.min(pfcData.carbsRatio, 100) + '%' }"
                        ></div>
                      </div>
                      <span class="text-xs text-gray-500">{{ pfcData.carbsRatio }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-12 text-gray-500">
            <i class="fas fa-chart-pie text-3xl mb-2"></i>
            <p>PFCデータがありません</p>
            <router-link to="/meal-record" class="mt-2 text-blue-600 hover:text-blue-800">
              食事を記録する
            </router-link>
          </div>
        </div>
      </section>

      <!-- Exercise Progress -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">運動進捗</h2>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="text-center p-4 bg-red-50 rounded-lg">
              <div class="text-2xl font-bold text-red-600">{{ exerciseStats.totalCalories }}</div>
              <div class="text-sm text-gray-600">総消費カロリー</div>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ exerciseStats.totalDuration }}</div>
              <div class="text-sm text-gray-600">総運動時間(分)</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ exerciseStats.averageDailyCalories }}</div>
              <div class="text-sm text-gray-600">平均日間消費カロリー</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ exerciseStats.exerciseDays }}</div>
              <div class="text-sm text-gray-600">運動日数</div>
            </div>
          </div>

          <!-- Exercise Type Distribution -->
          <div v-if="exerciseStats.typeDistribution.length > 0" class="h-48">
            <DoughnutChart
              :chart-data="exerciseTypeChartData"
              :chart-options="exerciseTypeChartOptions"
            />
          </div>
        </div>
      </section>

      <!-- Detailed Statistics -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">詳細統計</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Weight Statistics -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-700">体重統計</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">開始時体重</span>
                  <span class="font-medium">{{ weightStats.startWeight }}kg</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">現在の体重</span>
                  <span class="font-medium">{{ weightStats.currentWeight }}kg</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">目標体重</span>
                  <span class="font-medium">{{ weightStats.targetWeight }}kg</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">総減量</span>
                  <span class="font-medium" :class="weightStats.totalLoss >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ weightStats.totalLoss >= 0 ? '+' : '' }}{{ weightStats.totalLoss }}kg
                  </span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">残り目標</span>
                  <span class="font-medium">{{ weightStats.remaining }}kg</span>
                </div>
              </div>
            </div>

            <!-- Meal Statistics -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-700">食事統計</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">平均摂取カロリー</span>
                  <span class="font-medium">{{ mealStats.averageCalories }}kcal</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">記録日数</span>
                  <span class="font-medium">{{ mealStats.recordDays }}日</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">目標達成率</span>
                  <span class="font-medium">{{ mealStats.goalAchievement }}%</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">最高カロリー</span>
                  <span class="font-medium">{{ mealStats.maxCalories }}kcal</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">最低カロリー</span>
                  <span class="font-medium">{{ mealStats.minCalories }}kcal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Achievement Badges -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">達成バッジ</h2>
          
          <div v-if="achievements.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="achievement in achievements"
              :key="achievement.id"
              class="text-center p-4 rounded-lg"
              :class="achievement.achieved ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'"
            >
              <div class="text-3xl mb-2">
                <i :class="[achievement.icon, achievement.achieved ? 'text-yellow-600' : 'text-gray-400']"></i>
              </div>
              <div class="text-sm font-medium" :class="achievement.achieved ? 'text-yellow-800' : 'text-gray-500'">
                {{ achievement.name }}
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ achievement.description }}</div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-trophy text-3xl mb-2"></i>
            <p>まだ達成バッジがありません</p>
            <p class="text-sm">記録を続けてバッジを獲得しましょう！</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Period Selection Modal -->
    <div v-if="showPeriodModal" class="modal-overlay" @click="showPeriodModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">期間を選択</h3>
          <button @click="showPeriodModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            <button
              v-for="period in periodOptions"
              :key="period.value"
              @click="selectPeriod(period.value); showPeriodModal = false"
              class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition"
              :class="selectedPeriod === period.value ? 'bg-blue-50 border border-blue-200' : ''"
            >
              <div class="font-medium">{{ period.label }}</div>
              <div class="text-sm text-gray-500">{{ period.description }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeightStore } from '@/stores/weight'
import { useMealStore } from '@/stores/meal'
import { useExerciseStore } from '@/stores/exercise'
import { useProgressStore } from '@/stores/progress'
import LineChart from '@/components/LineChart.vue'
import BarChart from '@/components/BarChart.vue'
import DoughnutChart from '@/components/DoughnutChart.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import BottomNavigation from '@/components/BottomNavigation.vue'

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ストアの初期化
const weightStore = useWeightStore()
const mealStore = useMealStore()
const exerciseStore = useExerciseStore()
const progressStore = useProgressStore()

// リアクティブデータ
const isLoading = ref(true)
const showPeriodModal = ref(false)
const selectedPeriod = ref('week')
const chartType = ref('line')

// 期間オプション
const periodOptions = [
  { value: 'week', label: '1週間', description: '過去7日間のデータ' },
  { value: 'month', label: '1ヶ月', description: '過去30日間のデータ' },
  { value: 'quarter', label: '3ヶ月', description: '過去90日間のデータ' },
  { value: 'year', label: '1年', description: '過去365日間のデータ' }
]

// 計算プロパティ
const weightData = computed(() => {
  const periodDays = getPeriodDays(selectedPeriod.value)
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000)
  
  return weightStore.weightProgress
    .filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= startDate && recordDate <= endDate
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
})

const weightChartData = computed(() => ({
  labels: weightData.value.map(record => 
    new Date(record.timestamp).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  ),
  datasets: [
    {
      label: '体重 (kg)',
      data: weightData.value.map(record => record.weight),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
}))

const weightChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          return `体重: ${context.parsed.y}kg`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}))

const pfcData = computed(() => {
  const periodDays = getPeriodDays(selectedPeriod.value)
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000)
  
  const meals = mealStore.mealRecords.filter(record => {
    const recordDate = new Date(record.timestamp)
    return recordDate >= startDate && recordDate <= endDate
  })
  
  if (meals.length === 0) {
    return { hasData: false }
  }
  
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0)
  const totalFat = meals.reduce((sum, meal) => sum + (meal.fat || 0), 0)
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)
  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
  
  const proteinRatio = totalCalories > 0 ? Math.round((totalProtein * 4 / totalCalories) * 100) : 0
  const fatRatio = totalCalories > 0 ? Math.round((totalFat * 9 / totalCalories) * 100) : 0
  const carbsRatio = totalCalories > 0 ? Math.round((totalCarbs * 4 / totalCalories) * 100) : 0
  
  return {
    hasData: true,
    protein: Math.round(totalProtein / meals.length),
    fat: Math.round(totalFat / meals.length),
    carbs: Math.round(totalCarbs / meals.length),
    proteinRatio,
    fatRatio,
    carbsRatio
  }
})

const pfcChartData = computed(() => ({
  labels: ['タンパク質', '脂質', '炭水化物'],
  datasets: [
    {
      data: [pfcData.value.proteinRatio, pfcData.value.fatRatio, pfcData.value.carbsRatio],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(249, 115, 22, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(249, 115, 22)'
      ],
      borderWidth: 2
    }
  ]
}))

const pfcChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.label}: ${context.parsed}%`
        }
      }
    }
  }
}))

const exerciseStats = computed(() => {
  const periodDays = getPeriodDays(selectedPeriod.value)
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000)
  
  const exercises = exerciseStore.exerciseRecords.filter(record => {
    const recordDate = new Date(record.timestamp)
    return recordDate >= startDate && recordDate <= endDate
  })
  
  const totalCalories = exercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned || 0), 0)
  const totalDuration = exercises.reduce((sum, exercise) => sum + (exercise.duration || 0), 0)
  const exerciseDays = new Set(
    exercises.map(exercise => new Date(exercise.timestamp).toDateString())
  ).size
  
  // 運動タイプ別分布
  const typeCount = {}
  exercises.forEach(exercise => {
    const type = exercise.exerciseType || 'other'
    typeCount[type] = (typeCount[type] || 0) + 1
  })
  
  const typeDistribution = Object.entries(typeCount).map(([type, count]) => ({
    type: getExerciseTypeLabel(type),
    count,
    percentage: Math.round((count / exercises.length) * 100)
  }))
  
  return {
    totalCalories,
    totalDuration,
    averageDailyCalories: Math.round(totalCalories / periodDays),
    exerciseDays,
    typeDistribution
  }
})

const exerciseTypeChartData = computed(() => ({
  labels: exerciseStats.value.typeDistribution.map(item => item.type),
  datasets: [
    {
      data: exerciseStats.value.typeDistribution.map(item => item.count),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(168, 85, 247)'
      ],
      borderWidth: 2
    }
  ]
}))

const exerciseTypeChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        usePointStyle: true
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const item = exerciseStats.value.typeDistribution[context.dataIndex]
          return `${item.type}: ${item.count}回 (${item.percentage}%)`
        }
      }
    }
  }
}))

const goalProgress = computed(() => {
  const currentWeight = weightStore.currentWeight
  const targetWeight = weightStore.targetWeight || currentWeight
  const startWeight = weightStore.startWeight || currentWeight
  
  const weightProgress = startWeight && targetWeight 
    ? Math.max(0, Math.min(100, Math.round(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100)))
    : 0
  
  const averageCalories = mealStore.averageDailyCalories
  const targetCalories = 2000 // 仮の目標カロリー
  const calorieProgress = targetCalories > 0 
    ? Math.max(0, Math.min(100, Math.round((averageCalories / targetCalories) * 100)))
    : 0
  
  const exerciseProgress = Math.min(100, Math.round((exerciseStats.value.exerciseDays / 7) * 100))
  
  const overallProgress = Math.round((weightProgress + calorieProgress + exerciseProgress) / 3)
  
  return {
    weightProgress,
    calorieProgress,
    exerciseProgress,
    overallProgress,
    currentWeight,
    targetWeight,
    averageCalories,
    exerciseDays: exerciseStats.value.exerciseDays
  }
})

const weightStats = computed(() => {
  const currentWeight = weightStore.currentWeight
  const targetWeight = weightStore.targetWeight || currentWeight
  const startWeight = weightStore.startWeight || currentWeight
  
  return {
    startWeight: startWeight || '---',
    currentWeight: currentWeight || '---',
    targetWeight: targetWeight || '---',
    totalLoss: startWeight && currentWeight ? Math.round((startWeight - currentWeight) * 10) / 10 : 0,
    remaining: currentWeight && targetWeight ? Math.round((currentWeight - targetWeight) * 10) / 10 : 0
  }
})

const mealStats = computed(() => {
  const periodDays = getPeriodDays(selectedPeriod.value)
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000)
  
  const meals = mealStore.mealRecords.filter(record => {
    const recordDate = new Date(record.timestamp)
    return recordDate >= startDate && recordDate <= endDate
  })
  
  const calories = meals.map(meal => meal.calories || 0)
  const recordDays = new Set(
    meals.map(meal => new Date(meal.timestamp).toDateString())
  ).size
  
  return {
    averageCalories: calories.length > 0 ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length) : 0,
    recordDays,
    goalAchievement: Math.min(100, Math.round((recordDays / periodDays) * 100)),
    maxCalories: calories.length > 0 ? Math.max(...calories) : 0,
    minCalories: calories.length > 0 ? Math.min(...calories) : 0
  }
})

const achievements = computed(() => {
  const achievements = []
  
  // 体重関連
  if (weightStats.value.totalLoss >= 1) {
    achievements.push({
      id: 'weight-1kg',
      name: '1kg減量',
      description: '1kgの減量を達成',
      icon: 'fas fa-weight',
      achieved: true
    })
  }
  
  if (weightStats.value.totalLoss >= 5) {
    achievements.push({
      id: 'weight-5kg',
      name: '5kg減量',
      description: '5kgの減量を達成',
      icon: 'fas fa-weight',
      achieved: true
    })
  }
  
  // 運動関連
  if (exerciseStats.value.exerciseDays >= 3) {
    achievements.push({
      id: 'exercise-3days',
      name: '運動習慣',
      description: '週3日以上の運動',
      icon: 'fas fa-running',
      achieved: true
    })
  }
  
  if (exerciseStats.value.totalCalories >= 1000) {
    achievements.push({
      id: 'exercise-1000cal',
      name: 'カロリー消費',
      description: '1000kcalの運動消費',
      icon: 'fas fa-fire',
      achieved: true
    })
  }
  
  // 記録関連
  if (mealStats.value.recordDays >= 7) {
    achievements.push({
      id: 'meal-7days',
      name: '食事記録',
      description: '7日間の食事記録',
      icon: 'fas fa-utensils',
      achieved: true
    })
  }
  
  return achievements
})

// メソッド
const getPeriodDays = (period) => {
  const days = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365
  }
  return days[period] || 7
}

const getExerciseTypeLabel = (type) => {
  const labels = {
    cardio: '有酸素運動',
    strength: '筋力トレーニング',
    flexibility: 'ストレッチ・柔軟',
    sports: 'スポーツ',
    other: 'その他'
  }
  return labels[type] || 'その他'
}

const selectPeriod = (period) => {
  selectedPeriod.value = period
}

const toggleChartType = (type) => {
  chartType.value = chartType.value === 'line' ? 'bar' : 'line'
}

const exportProgress = () => {
  const data = {
    period: selectedPeriod.value,
    weightData: weightData.value,
    exerciseStats: exerciseStats.value,
    mealStats: mealStats.value,
    goalProgress: goalProgress.value,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `progress-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  if (window.$notify) {
    window.$notify.success('エクスポート完了', '進捗データをダウンロードしました')
  }
}

// 初期化
onMounted(async () => {
  try {
    isLoading.value = true
    await Promise.all([
      weightStore.loadRecords(),
      mealStore.loadRecords(),
      exerciseStore.loadRecords(),
      progressStore.loadRecords()
    ])
  } catch (error) {
    console.error('データ読み込みエラー:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-6;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}
</style> 