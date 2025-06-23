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
            <h1 class="text-xl font-bold">体重記録</h1>
          </div>
          <button @click="showHistoryModal = true" class="p-2 text-gray-600 hover:text-gray-800">
            <i class="fas fa-history text-xl"></i>
          </button>
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
      <!-- Today's Weight -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">今日の体重</h2>
          
          <div v-if="todayRecord" class="text-center">
            <div class="text-4xl font-bold text-blue-600 mb-2">{{ formatWeight(todayRecord.weight) }}kg</div>
            <div class="text-sm text-gray-600 mb-4">
              記録日時: {{ formatDateTime(todayRecord.timestamp) }}
            </div>
            <div v-if="weightChange" class="text-sm mb-4">
              <span :class="weightChange.isPositive ? 'text-green-600' : 'text-red-600'">
                {{ formatWeightChange(weightChange) }}
              </span>
              <span class="text-gray-600"> (前回比)</span>
            </div>
            <div v-if="todayRecord.notes" class="text-sm text-gray-600 mb-4">
              {{ todayRecord.notes }}
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
          
          <div v-if="weightProgress?.length > 0" class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div class="text-center text-gray-500">
              <i class="fas fa-chart-line text-3xl mb-2"></i>
              <p>体重記録: {{ weightProgress.length }}件</p>
              <p class="text-sm">最新: {{ formatWeight(weightProgress[weightProgress.length - 1]?.weight) }}kg</p>
              <p class="text-sm">平均: {{ formatWeight(averageWeight) }}kg</p>
            </div>
          </div>
          
          <div v-else class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
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
              <div class="text-2xl font-bold text-blue-600">{{ formatWeight(currentWeight) }}</div>
              <div class="text-sm text-gray-600">現在の体重</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ formatWeightChange(totalWeightChange) }}</div>
              <div class="text-sm text-gray-600">総変化</div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ formatWeight(averageWeight) }}</div>
              <div class="text-sm text-gray-600">平均体重</div>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ recordCount }}</div>
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
                  <p class="font-medium">{{ formatWeight(record.weight) }}kg</p>
                  <p class="text-sm text-gray-600">{{ formatDate(record.timestamp) }}</p>
                  <p v-if="record.notes" class="text-xs text-gray-500">{{ record.notes }}</p>
                </div>
              </div>
              <div class="text-right">
                <div v-if="record.change" class="text-sm">
                  <span :class="record.change > 0 ? 'text-red-600' : 'text-green-600'">
                    {{ record.change > 0 ? '+' : '' }}{{ formatWeight(record.change) }}kg
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
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">{{ isEditing ? '記録を編集' : '体重を記録' }}</h3>
          <button @click="showInputModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <form @submit.prevent="saveWeight">
            <!-- 基本情報 -->
            <div class="mb-4">
              <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">
                体重 (kg) *
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

            <!-- 体脂肪率 -->
            <div class="mb-4">
              <label for="bodyFat" class="block text-sm font-medium text-gray-700 mb-2">
                体脂肪率 (%) (任意)
              </label>
              <input
                id="bodyFat"
                v-model.number="bodyFatInput"
                type="number"
                step="0.1"
                min="5"
                max="50"
                class="input-field"
                placeholder="例: 20.5"
              />
            </div>

            <!-- ウエスト -->
            <div class="mb-4">
              <label for="waist" class="block text-sm font-medium text-gray-700 mb-2">
                ウエスト (cm) (任意)
              </label>
              <input
                id="waist"
                v-model.number="waistInput"
                type="number"
                step="0.1"
                min="50"
                max="150"
                class="input-field"
                placeholder="例: 75.0"
              />
            </div>

            <!-- 気分 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                気分 (任意)
              </label>
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="mood in moods"
                  :key="mood.value"
                  type="button"
                  @click="moodInput = mood.value"
                  class="p-2 rounded-lg border transition"
                  :class="moodInput === mood.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
                >
                  <div class="text-2xl mb-1">{{ mood.emoji }}</div>
                  <div class="text-xs">{{ mood.label }}</div>
                </button>
              </div>
            </div>

            <!-- 睡眠時間 -->
            <div class="mb-4">
              <label for="sleep" class="block text-sm font-medium text-gray-700 mb-2">
                睡眠時間 (時間) (任意)
              </label>
              <input
                id="sleep"
                v-model.number="sleepInput"
                type="number"
                step="0.5"
                min="0"
                max="24"
                class="input-field"
                placeholder="例: 7.5"
              />
            </div>

            <!-- 体調 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                体調 (任意)
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="condition in conditions"
                  :key="condition.value"
                  type="button"
                  @click="conditionInput = condition.value"
                  class="p-2 rounded-lg border transition"
                  :class="conditionInput === condition.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
                >
                  {{ condition.label }}
                </button>
              </div>
            </div>

            <!-- 変化の実感 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                最近の変化を感じますか？ (任意)
              </label>
              <div class="space-y-2">
                <label v-for="feeling in feelings" :key="feeling.value" class="flex items-center">
                  <input
                    type="radio"
                    :value="feeling.value"
                    v-model="feelsChangeInput"
                    class="mr-2"
                  />
                  <span class="text-sm">{{ feeling.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- メモ -->
            <div class="mb-4">
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                メモ (任意)
              </label>
              <textarea
                id="notes"
                v-model="notesInput"
                class="input-field"
                rows="3"
                placeholder="体調や気づいたことを記録"
              ></textarea>
            </div>
            
            <div class="flex space-x-3">
              <button type="submit" class="flex-1 btn-primary">
                {{ isEditing ? '更新する' : '記録する' }}
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
                  <p class="font-medium">{{ formatWeight(record.weight) }}kg</p>
                  <p class="text-sm text-gray-600">{{ formatDateTime(record.timestamp) }}</p>
                  <p v-if="record.notes" class="text-xs text-gray-500">{{ record.notes }}</p>
                </div>
              </div>
              <div class="text-right">
                <div v-if="record.change" class="text-sm">
                  <span :class="record.change > 0 ? 'text-red-600' : 'text-green-600'">
                    {{ record.change > 0 ? '+' : '' }}{{ formatWeight(record.change) }}kg
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

    <!-- Record Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">記録詳細</h3>
          <button @click="showDetailModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="selectedRecord" class="space-y-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">{{ formatWeight(selectedRecord.weight) }}kg</div>
              <p class="text-sm text-gray-600">{{ formatDateTime(selectedRecord.timestamp) }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div v-if="selectedRecord.bodyFat" class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-lg font-bold text-blue-600">{{ selectedRecord.bodyFat }}%</div>
                <div class="text-sm text-gray-600">体脂肪率</div>
              </div>
              <div v-if="selectedRecord.waist" class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-lg font-bold text-green-600">{{ selectedRecord.waist }}cm</div>
                <div class="text-sm text-gray-600">ウエスト</div>
              </div>
            </div>
            
            <div v-if="selectedRecord.mood" class="p-3 bg-yellow-50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-1">気分</div>
              <div class="flex items-center">
                <span class="text-2xl mr-2">{{ getMoodEmoji(selectedRecord.mood) }}</span>
                <span>{{ getMoodLabel(selectedRecord.mood) }}</span>
              </div>
            </div>
            
            <div v-if="selectedRecord.sleep" class="p-3 bg-purple-50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-1">睡眠時間</div>
              <div class="text-lg font-bold text-purple-600">{{ selectedRecord.sleep }}時間</div>
            </div>
            
            <div v-if="selectedRecord.condition" class="p-3 bg-orange-50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-1">体調</div>
              <div class="text-lg font-bold text-orange-600">{{ getConditionLabel(selectedRecord.condition) }}</div>
            </div>
            
            <div v-if="selectedRecord.feelsChange" class="p-3 bg-pink-50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-1">変化の実感</div>
              <div class="text-lg font-bold text-pink-600">{{ getFeelingLabel(selectedRecord.feelsChange) }}</div>
            </div>
            
            <div v-if="selectedRecord.notes" class="p-3 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-1">メモ</div>
              <div class="text-gray-600">{{ selectedRecord.notes }}</div>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button @click="editRecord" class="flex-1 btn-secondary">
              <i class="fas fa-edit mr-2"></i>編集
            </button>
            <button @click="deleteRecord" class="flex-1 btn-danger">
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
import { useWeightStore } from '@/stores/weight'
import BottomNavigation from '@/components/BottomNavigation.vue'

// ストアの初期化
const weightStore = useWeightStore()

// リアクティブデータ
const showInputModal = ref(false)
const showHistoryModal = ref(false)
const showDetailModal = ref(false)
const isLoading = ref(true)
const isEditing = ref(false)
const editingRecordId = ref(null)

// フォーム入力
const weightInput = ref('')
const bodyFatInput = ref('')
const waistInput = ref('')
const moodInput = ref('')
const sleepInput = ref('')
const conditionInput = ref('')
const feelsChangeInput = ref('')
const notesInput = ref('')

// 選択された記録
const selectedRecord = ref(null)

// 期間選択
const periods = [
  { label: '1週間', value: 'week' },
  { label: '1ヶ月', value: 'month' },
  { label: '3ヶ月', value: 'quarter' },
  { label: '1年', value: 'year' }
]

const selectedPeriod = ref('week')

// 気分オプション
const moods = [
  { value: 'great', label: '最高', emoji: '😄' },
  { value: 'good', label: '良い', emoji: '🙂' },
  { value: 'normal', label: '普通', emoji: '😐' },
  { value: 'bad', label: '悪い', emoji: '😞' },
  { value: 'terrible', label: '最悪', emoji: '😫' }
]

// 体調オプション
const conditions = [
  { value: 'excellent', label: '優秀' },
  { value: 'good', label: '良好' },
  { value: 'normal', label: '普通' },
  { value: 'poor', label: '不良' },
  { value: 'sick', label: '体調不良' }
]

// 変化の実感オプション
const feelings = [
  { value: 'lighter', label: '軽くなった' },
  { value: 'heavier', label: '重くなった' },
  { value: 'no_change', label: '変化なし' },
  { value: 'not_sure', label: 'わからない' }
]

// 計算されたデータ
const todayRecord = computed(() => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  return weightStore.getRecordByDate(todayStr)
})

const weightChange = computed(() => weightStore.weightChange)

const recentRecords = computed(() => {
  const records = weightStore.sortedRecords || []
  return records.slice(0, 5).map(record => ({
    ...record,
    change: calculateChange(record)
  }))
})

const weightHistory = computed(() => {
  const records = weightStore.sortedRecords || []
  return records.map(record => ({
    ...record,
    change: calculateChange(record)
  }))
})

const weightProgress = computed(() => weightStore.weightProgress || [])

const currentWeight = computed(() => {
  const latest = weightStore.latestRecord
  return latest ? latest.weight : null
})

const averageWeight = computed(() => weightStore.averageWeight)

const recordCount = computed(() => weightStore.weightRecords.length)

const totalWeightChange = computed(() => {
  const records = weightStore.sortedRecords || []
  if (records.length < 2) return null
  
  const first = records[records.length - 1]
  const latest = records[0]
  return {
    value: latest.weight - first.weight,
    isPositive: latest.weight < first.weight
  }
})

// メソッド
const formatWeight = (weight) => {
  return weight ? weight.toFixed(1) : '--'
}

const formatWeightChange = (change) => {
  if (!change) return '--'
  const sign = change.isPositive ? '-' : '+'
  const value = Math.abs(change.value).toFixed(1)
  return `${sign}${value}kg`
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

const calculateChange = (record) => {
  const records = weightStore.sortedRecords || []
  const index = records.findIndex(r => r.id === record.id)
  if (index === -1 || index === records.length - 1) return null
  
  const nextRecord = records[index + 1]
  return record.weight - nextRecord.weight
}

const getMoodEmoji = (mood) => {
  const moodObj = moods.find(m => m.value === mood)
  return moodObj ? moodObj.emoji : '😐'
}

const getMoodLabel = (mood) => {
  const moodObj = moods.find(m => m.value === mood)
  return moodObj ? moodObj.label : '不明'
}

const getConditionLabel = (condition) => {
  const conditionObj = conditions.find(c => c.value === condition)
  return conditionObj ? conditionObj.label : '不明'
}

const getFeelingLabel = (feeling) => {
  const feelingObj = feelings.find(f => f.value === feeling)
  return feelingObj ? feelingObj.label : '不明'
}

const resetForm = () => {
  weightInput.value = ''
  bodyFatInput.value = ''
  waistInput.value = ''
  moodInput.value = ''
  sleepInput.value = ''
  conditionInput.value = ''
  feelsChangeInput.value = ''
  notesInput.value = ''
  isEditing.value = false
  editingRecordId.value = null
}

const saveWeight = async () => {
  if (!weightInput.value) return
  
  try {
    const recordData = {
      weight: weightInput.value,
      bodyFat: bodyFatInput.value || null,
      waist: waistInput.value || null,
      mood: moodInput.value || null,
      sleep: sleepInput.value || null,
      condition: conditionInput.value || null,
      feelsChange: feelsChangeInput.value || null,
      notes: notesInput.value || ''
    }

    if (isEditing.value && editingRecordId.value) {
      await weightStore.updateRecord(editingRecordId.value, recordData)
    } else {
      await weightStore.addRecord(recordData)
    }
    
    resetForm()
    showInputModal.value = false
  } catch (error) {
    console.error('体重記録保存エラー:', error)
  }
}

const editTodayRecord = () => {
  if (todayRecord.value) {
    editRecord(todayRecord.value)
  }
}

const editRecord = (record) => {
  isEditing.value = true
  editingRecordId.value = record.id
  
  weightInput.value = record.weight
  bodyFatInput.value = record.bodyFat || ''
  waistInput.value = record.waist || ''
  moodInput.value = record.mood || ''
  sleepInput.value = record.sleep || ''
  conditionInput.value = record.condition || ''
  feelsChangeInput.value = record.feelsChange || ''
  notesInput.value = record.notes || ''
  
  showDetailModal.value = false
  showInputModal.value = true
}

const deleteRecord = async () => {
  if (!selectedRecord.value) return
  
  if (confirm('この記録を削除しますか？')) {
    try {
      await weightStore.deleteRecord(selectedRecord.value.id)
      showDetailModal.value = false
      selectedRecord.value = null
    } catch (error) {
      console.error('記録削除エラー:', error)
    }
  }
}

const viewRecord = (record) => {
  selectedRecord.value = record
  showDetailModal.value = true
}

const loadData = async () => {
  try {
    isLoading.value = true
    await weightStore.loadRecords()
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