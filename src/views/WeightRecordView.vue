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
            <h1 class="text-xl font-bold">体重記録</h1>
          </div>
          <button @click="showHistoryModal = true" class="p-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-history text-xl"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Today's Weight -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">今日の体重</h2>
          
          <div v-if="todayRecord" class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-2">{{ todayRecord.weight }}kg</div>
            <div class="text-sm text-gray-600 mb-4">
              記録日時: {{ formatDateTime(todayRecord.timestamp) }}
            </div>
            <div v-if="todayRecord.change" class="text-sm mb-4">
              <span :class="todayRecord.change > 0 ? 'text-red-600' : 'text-green-600'">
                {{ todayRecord.change > 0 ? '+' : '' }}{{ todayRecord.change }}kg
              </span>
              <span class="text-gray-600"> (前回比)</span>
            </div>
            <button @click="editTodayRecord" class="btn-secondary">
              <i class="fas fa-edit mr-2"></i>編集
            </button>
          </div>
          
          <div v-else class="text-center py-8">
            <i class="fas fa-weight text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600 mb-4">今日の体重を記録しましょう</p>
            <button @click="showInputModal = true" class="btn-primary">
              <i class="fas fa-plus mr-2"></i>体重を記録
            </button>
          </div>
        </div>
      </section>

      <!-- Weight Graph -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">体重推移</h2>
            <div class="flex space-x-2">
              <button 
                v-for="period in periods" 
                :key="period.value"
                @click="selectedPeriod = period.value"
                class="px-3 py-1 text-sm rounded-full transition"
                :class="selectedPeriod === period.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          
          <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center text-gray-500">
              <i class="fas fa-chart-line text-3xl mb-2"></i>
              <p>体重記録を追加するとグラフが表示されます</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">統計</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ statistics.currentWeight }}</div>
              <div class="text-sm text-gray-600">現在の体重</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ statistics.totalLoss }}</div>
              <div class="text-sm text-gray-600">総減量</div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ statistics.averageWeight }}</div>
              <div class="text-sm text-gray-600">平均体重</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ statistics.recordCount }}</div>
              <div class="text-sm text-gray-600">記録回数</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Records -->
      <section class="mb-8">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">最近の記録</h2>
            <button @click="showHistoryModal = true" class="text-blue-600 hover:text-blue-800 text-sm">
              すべて見る
            </button>
          </div>
          
          <div v-if="recentRecords.length > 0" class="space-y-3">
            <div
              v-for="record in recentRecords"
              :key="record.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewRecord(record)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <i class="fas fa-weight"></i>
                </div>
                <div>
                  <p class="font-medium">{{ record.weight }}kg</p>
                  <p class="text-sm text-gray-600">{{ formatDate(record.timestamp) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div v-if="record.change" class="text-sm">
                  <span :class="record.change > 0 ? 'text-red-600' : 'text-green-600'">
                    {{ record.change > 0 ? '+' : '' }}{{ record.change }}kg
                  </span>
                </div>
                <i class="fas fa-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-clipboard-list text-3xl mb-2"></i>
            <p>まだ記録がありません</p>
            <button @click="showInputModal = true" class="mt-2 text-blue-600 hover:text-blue-800">
              最初の記録を追加
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Weight Input Modal -->
    <div v-if="showInputModal" class="modal-overlay" @click="showInputModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">体重を記録</h3>
          <button @click="showInputModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <form @submit.prevent="saveWeight">
            <div class="mb-4">
              <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">
                体重 (kg)
              </label>
              <input
                id="weight"
                v-model.number="weightInput"
                type="number"
                step="0.1"
                min="30"
                max="200"
                class="input-field"
                placeholder="例: 65.2"
                required
              />
            </div>
            
            <div class="mb-4">
              <label for="memo" class="block text-sm font-medium text-gray-700 mb-2">
                メモ (任意)
              </label>
              <textarea
                id="memo"
                v-model="memoInput"
                class="input-field"
                rows="3"
                placeholder="体調や気づいたことを記録"
              ></textarea>
            </div>
            
            <div class="flex space-x-3">
              <button type="submit" class="flex-1 btn-primary">
                記録する
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
          <h3 class="text-lg font-semibold">体重記録履歴</h3>
          <button @click="showHistoryModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="weightHistory.length > 0" class="space-y-3">
            <div
              v-for="record in weightHistory"
              :key="record.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              @click="viewRecord(record)"
            >
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <i class="fas fa-weight"></i>
                </div>
                <div>
                  <p class="font-medium">{{ record.weight }}kg</p>
                  <p class="text-sm text-gray-600">{{ formatDateTime(record.timestamp) }}</p>
                  <p v-if="record.memo" class="text-xs text-gray-500">{{ record.memo }}</p>
                </div>
              </div>
              <div class="text-right">
                <div v-if="record.change" class="text-sm">
                  <span :class="record.change > 0 ? 'text-red-600' : 'text-green-600'">
                    {{ record.change > 0 ? '+' : '' }}{{ record.change }}kg
                  </span>
                </div>
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
const weightInput = ref('')
const memoInput = ref('')
const selectedPeriod = ref('week')

// 期間選択
const periods = [
  { label: '1週間', value: 'week' },
  { label: '1ヶ月', value: 'month' },
  { label: '3ヶ月', value: 'quarter' },
  { label: '1年', value: 'year' }
]

// 今日の記録
const todayRecord = ref({
  id: 1,
  weight: 65.2,
  change: -0.3,
  timestamp: new Date(),
  memo: '朝食前'
})

// 最近の記録
const recentRecords = ref([
  {
    id: 1,
    weight: 65.2,
    change: -0.3,
    timestamp: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    weight: 65.5,
    change: 0.1,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    weight: 65.4,
    change: -0.2,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    weight: 65.6,
    change: 0.3,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
])

// 体重履歴
const weightHistory = ref([
  {
    id: 1,
    weight: 65.2,
    change: -0.3,
    timestamp: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
    memo: '朝食前'
  },
  {
    id: 2,
    weight: 65.5,
    change: 0.1,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    memo: '夕食後'
  },
  {
    id: 3,
    weight: 65.4,
    change: -0.2,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    weight: 65.6,
    change: 0.3,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    memo: '運動後'
  },
  {
    id: 5,
    weight: 65.3,
    change: -0.1,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  }
])

// 統計データ
const statistics = reactive({
  currentWeight: 65.2,
  totalLoss: -2.8,
  averageWeight: 65.4,
  recordCount: 24
})

// メソッド
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

const saveWeight = () => {
  if (!weightInput.value) return
  
  const newRecord = {
    id: Date.now(),
    weight: weightInput.value,
    timestamp: new Date(),
    memo: memoInput.value || null
  }
  
  // 前回の記録との比較
  if (recentRecords.value.length > 0) {
    const lastRecord = recentRecords.value[0]
    newRecord.change = newRecord.weight - lastRecord.weight
  }
  
  // 記録を追加
  recentRecords.value.unshift(newRecord)
  weightHistory.value.unshift(newRecord)
  
  // 今日の記録を更新
  todayRecord.value = newRecord
  
  // フォームをリセット
  weightInput.value = ''
  memoInput.value = ''
  showInputModal.value = false
  
  window.$notify?.success('体重を記録しました')
}

const editTodayRecord = () => {
  if (todayRecord.value) {
    weightInput.value = todayRecord.value.weight
    memoInput.value = todayRecord.value.memo || ''
    showInputModal.value = true
  }
}

const viewRecord = (record) => {
  // 記録の詳細表示（必要に応じて実装）
  console.log('View record:', record)
}

onMounted(() => {
  // 初期化処理
})
</script> 