<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold">記録</h1>
          <button @click="showQuickAddModal = true" class="p-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-plus text-xl"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Record Types -->
      <section class="mb-8">
        <div class="grid grid-cols-2 gap-4">
          <router-link
            v-for="recordType in recordTypes"
            :key="recordType.id"
            :to="recordType.path"
            class="record-card group"
          >
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
                 :class="recordType.bgColor">
              <i :class="recordType.icon"></i>
            </div>
            <h3 class="text-lg font-semibold mb-2">{{ recordType.name }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ recordType.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">{{ recordType.count }}件の記録</span>
              <i class="fas fa-chevron-right text-gray-400 group-hover:text-gray-600 transition"></i>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Recent Records -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">最近の記録</h2>
            <button @click="refreshRecords" class="text-blue-600 hover:text-blue-800 text-sm">
              <i class="fas fa-sync-alt mr-1"></i>更新
            </button>
          </div>
          
          <div v-if="recentRecords.length > 0" class="space-y-3">
            <div
              v-for="record in recentRecords"
              :key="record.id"
              class="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition"
              :class="getRecordBgColor(record.type)"
              @click="viewRecord(record)"
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
              <div class="text-right">
                <span class="text-sm text-gray-500">{{ formatDate(record.timestamp) }}</span>
                <i class="fas fa-chevron-right text-gray-400 ml-2"></i>
              </div>
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

      <!-- Statistics -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">統計</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ statistics.totalRecords }}</div>
              <div class="text-sm text-gray-600">総記録数</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ statistics.currentStreak }}</div>
              <div class="text-sm text-gray-600">連続記録日数</div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ statistics.thisMonth }}</div>
              <div class="text-sm text-gray-600">今月の記録</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ statistics.thisWeek }}</div>
              <div class="text-sm text-gray-600">今週の記録</div>
            </div>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()

// リアクティブデータ
const showQuickAddModal = ref(false)

// 記録タイプ
const recordTypes = ref([
  {
    id: 'weight',
    name: '体重記録',
    path: '/weight-record',
    icon: 'fas fa-weight',
    bgColor: 'bg-pink-100 text-pink-600',
    description: '体重の変化を記録',
    count: 24
  },
  {
    id: 'meal',
    name: '食事記録',
    path: '/meal-record',
    icon: 'fas fa-utensils',
    bgColor: 'bg-blue-100 text-blue-600',
    description: '食事内容とカロリーを記録',
    count: 156
  },
  {
    id: 'exercise',
    name: '運動記録',
    path: '/exercise-record',
    icon: 'fas fa-running',
    bgColor: 'bg-green-100 text-green-600',
    description: '運動内容と消費カロリーを記録',
    count: 42
  },
  {
    id: 'menu',
    name: '運動メニュー',
    path: '/exercise-menu',
    icon: 'fas fa-dumbbell',
    bgColor: 'bg-purple-100 text-purple-600',
    description: 'おすすめの運動メニュー',
    count: 8
  }
])

// 最近の記録
const recentRecords = ref([
  {
    id: 1,
    type: 'weight',
    title: '体重記録',
    description: '65.2kg (-0.3kg)',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 2,
    type: 'meal',
    title: '朝食',
    description: '350kcal • パン、コーヒー',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 3,
    type: 'exercise',
    title: 'ウォーキング',
    description: '30分 • 150kcal',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    type: 'meal',
    title: '昼食',
    description: '450kcal • サラダ、鶏肉',
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000)
  }
])

// 統計データ
const statistics = reactive({
  totalRecords: 230,
  currentStreak: 7,
  thisMonth: 45,
  thisWeek: 12
})

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

const formatDate = (timestamp) => {
  const now = new Date()
  const recordDate = new Date(timestamp)
  const diff = now - recordDate
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今日'
  } else if (days === 1) {
    return '昨日'
  } else if (days < 7) {
    return `${days}日前`
  } else {
    return recordDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }
}

const viewRecord = (record) => {
  // 記録の詳細画面に遷移
  const paths = {
    weight: '/weight-record',
    meal: '/meal-record',
    exercise: '/exercise-record'
  }
  
  if (paths[record.type]) {
    router.push(paths[record.type])
  }
}

const refreshRecords = () => {
  // 記録を更新する処理
  window.$notify?.success('記録を更新しました')
}

onMounted(() => {
  // 初期化処理
})
</script>

<style scoped>
.record-card {
  @apply bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200;
}

.record-type-btn {
  @apply bg-white;
}
</style> 