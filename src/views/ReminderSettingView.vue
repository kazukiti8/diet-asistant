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
            <h1 class="text-xl font-bold">リマインダー設定</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="addCustomReminder" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-plus text-xl"></i>
            </button>
            <button @click="saveAllReminders" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-save text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-gray-600">設定を読み込み中...</p>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else class="container mx-auto px-4 py-6">
      <!-- Reminder Status -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">リマインダー状況</h2>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ activeRemindersCount }}</div>
              <div class="text-sm text-gray-600">アクティブ</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ todayRemindersCount }}</div>
              <div class="text-sm text-gray-600">今日の予定</div>
            </div>
          </div>
          
          <div class="p-3 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-700">
              <strong>次回リマインダー:</strong> {{ nextReminderTime || 'なし' }}<br>
              <strong>最終実行:</strong> {{ lastReminderExecution || 'なし' }}
            </div>
          </div>
        </div>
      </section>

      <!-- Default Reminders -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">デフォルトリマインダー</h2>
          
          <div class="space-y-4">
            <!-- Weight Reminder -->
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <i class="fas fa-weight text-blue-600 text-xl mr-3"></i>
                  <div>
                    <h3 class="font-semibold">体重記録</h3>
                    <p class="text-sm text-gray-600">毎日の体重記録を忘れずに</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="defaultReminders.weight.enabled"
                    @change="updateDefaultReminders"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div v-if="defaultReminders.weight.enabled" class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">時間</label>
                    <input
                      v-model="defaultReminders.weight.time"
                      @change="updateDefaultReminders"
                      type="time"
                      class="input-field"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">繰り返し</label>
                    <select v-model="defaultReminders.weight.repeat" @change="updateDefaultReminders" class="input-field">
                      <option value="daily">毎日</option>
                      <option value="weekly">毎週</option>
                      <option value="custom">カスタム</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
                  <input
                    v-model="defaultReminders.weight.message"
                    @change="updateDefaultReminders"
                    type="text"
                    placeholder="今日の体重を記録しましょう！"
                    class="input-field"
                  />
                </div>
              </div>
            </div>

            <!-- Meal Reminder -->
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <i class="fas fa-utensils text-green-600 text-xl mr-3"></i>
                  <div>
                    <h3 class="font-semibold">食事記録</h3>
                    <p class="text-sm text-gray-600">食事の記録を忘れずに</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="defaultReminders.meal.enabled"
                    @change="updateDefaultReminders"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div v-if="defaultReminders.meal.enabled" class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">時間</label>
                    <input
                      v-model="defaultReminders.meal.time"
                      @change="updateDefaultReminders"
                      type="time"
                      class="input-field"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">繰り返し</label>
                    <select v-model="defaultReminders.meal.repeat" @change="updateDefaultReminders" class="input-field">
                      <option value="daily">毎日</option>
                      <option value="weekly">毎週</option>
                      <option value="custom">カスタム</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
                  <input
                    v-model="defaultReminders.meal.message"
                    @change="updateDefaultReminders"
                    type="text"
                    placeholder="今日の食事を記録しましょう！"
                    class="input-field"
                  />
                </div>
              </div>
            </div>

            <!-- Exercise Reminder -->
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <i class="fas fa-dumbbell text-purple-600 text-xl mr-3"></i>
                  <div>
                    <h3 class="font-semibold">運動記録</h3>
                    <p class="text-sm text-gray-600">運動の記録を忘れずに</p>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="defaultReminders.exercise.enabled"
                    @change="updateDefaultReminders"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div v-if="defaultReminders.exercise.enabled" class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">時間</label>
                    <input
                      v-model="defaultReminders.exercise.time"
                      @change="updateDefaultReminders"
                      type="time"
                      class="input-field"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">繰り返し</label>
                    <select v-model="defaultReminders.exercise.repeat" @change="updateDefaultReminders" class="input-field">
                      <option value="daily">毎日</option>
                      <option value="weekly">毎週</option>
                      <option value="custom">カスタム</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
                  <input
                    v-model="defaultReminders.exercise.message"
                    @change="updateDefaultReminders"
                    type="text"
                    placeholder="今日の運動を記録しましょう！"
                    class="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Custom Reminders -->
      <section class="mb-8">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">カスタムリマインダー</h2>
            <button @click="addCustomReminder" class="btn-primary">
              <i class="fas fa-plus mr-2"></i>追加
            </button>
          </div>
          
          <div v-if="customReminders.length === 0" class="text-center py-8">
            <i class="fas fa-bell-slash text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">カスタムリマインダーがありません</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="(reminder, index) in customReminders"
              :key="reminder.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <i :class="getReminderIcon(reminder.type)" class="text-xl mr-3"></i>
                  <div>
                    <h3 class="font-semibold">{{ reminder.title }}</h3>
                    <p class="text-sm text-gray-600">{{ reminder.message }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="reminder.enabled"
                      @change="updateCustomReminder(index)"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <button @click="editCustomReminder(index)" class="p-1 text-gray-600 hover:text-gray-800">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteCustomReminder(index)" class="p-1 text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div v-if="reminder.enabled" class="text-sm text-gray-600">
                <div class="grid grid-cols-2 gap-2">
                  <div><strong>時間:</strong> {{ reminder.time }}</div>
                  <div><strong>繰り返し:</strong> {{ getRepeatText(reminder.repeat) }}</div>
                </div>
                <div v-if="reminder.days && reminder.days.length > 0" class="mt-2">
                  <strong>曜日:</strong> {{ reminder.days.join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Reminder History -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">リマインダー履歴</h2>
          
          <div v-if="reminderHistory.length === 0" class="text-center py-8">
            <i class="fas fa-history text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">リマインダー履歴がありません</p>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="history in reminderHistory.slice(0, 5)"
              :key="history.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center">
                <i :class="getReminderIcon(history.type)" class="text-lg mr-3"></i>
                <div>
                  <div class="font-medium">{{ history.title }}</div>
                  <div class="text-sm text-gray-600">{{ history.executedAt }}</div>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                {{ history.status === 'executed' ? '実行済み' : 'スキップ' }}
              </div>
            </div>
            
            <button @click="clearHistory" class="w-full btn-secondary">
              履歴をクリア
            </button>
          </div>
        </div>
      </section>

      <!-- Advanced Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">詳細設定</h2>
          
          <div class="space-y-4">
            <!-- Snooze Settings -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                スヌーズ時間
              </label>
              <select v-model="advancedSettings.snoozeTime" @change="updateAdvancedSettings" class="input-field">
                <option value="5">5分</option>
                <option value="10">10分</option>
                <option value="15">15分</option>
                <option value="30">30分</option>
                <option value="60">1時間</option>
              </select>
            </div>

            <!-- Max Snooze Count -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                最大スヌーズ回数
              </label>
              <select v-model="advancedSettings.maxSnoozeCount" @change="updateAdvancedSettings" class="input-field">
                <option value="1">1回</option>
                <option value="2">2回</option>
                <option value="3">3回</option>
                <option value="5">5回</option>
                <option value="0">無制限</option>
              </select>
            </div>

            <!-- Quiet Hours -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">おやすみモード</h3>
                <p class="text-sm text-gray-600">指定時間内はリマインダーを無効</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="advancedSettings.quietHours.enabled"
                  @change="updateAdvancedSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Quiet Hours Time -->
            <div v-if="advancedSettings.quietHours.enabled" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  開始時間
                </label>
                <input
                  v-model="advancedSettings.quietHours.start"
                  @change="updateAdvancedSettings"
                  type="time"
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  終了時間
                </label>
                <input
                  v-model="advancedSettings.quietHours.end"
                  @change="updateAdvancedSettings"
                  type="time"
                  class="input-field"
                />
              </div>
            </div>

            <!-- Auto-dismiss -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">自動消去</h3>
                <p class="text-sm text-gray-600">リマインダーを自動的に消去</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="advancedSettings.autoDismiss"
                  @change="updateAdvancedSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Custom Reminder Modal -->
    <div v-if="showCustomReminderModal" class="modal-overlay" @click="closeCustomReminderModal">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold">{{ editingReminder ? 'リマインダー編集' : 'カスタムリマインダー追加' }}</h3>
        </div>
        <div class="p-4">
          <form @submit.prevent="saveCustomReminder" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                タイトル
              </label>
              <input
                v-model="customReminderForm.title"
                type="text"
                required
                placeholder="リマインダーのタイトル"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                メッセージ
              </label>
              <input
                v-model="customReminderForm.message"
                type="text"
                required
                placeholder="リマインダーメッセージ"
                class="input-field"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  時間
                </label>
                <input
                  v-model="customReminderForm.time"
                  type="time"
                  required
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  タイプ
                </label>
                <select v-model="customReminderForm.type" class="input-field">
                  <option value="custom">カスタム</option>
                  <option value="weight">体重記録</option>
                  <option value="meal">食事記録</option>
                  <option value="exercise">運動記録</option>
                  <option value="motivation">モチベーション</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                繰り返し
              </label>
              <select v-model="customReminderForm.repeat" @change="onRepeatChange" class="input-field">
                <option value="once">1回のみ</option>
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="custom">カスタム</option>
              </select>
            </div>
            
            <div v-if="customReminderForm.repeat === 'custom'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                曜日
              </label>
              <div class="grid grid-cols-7 gap-2">
                <label v-for="day in weekDays" :key="day.value" class="flex items-center">
                  <input
                    v-model="customReminderForm.days"
                    :value="day.value"
                    type="checkbox"
                    class="mr-1"
                  />
                  <span class="text-sm">{{ day.label }}</span>
                </label>
              </div>
            </div>
            
            <div class="flex space-x-3">
              <button type="button" @click="closeCustomReminderModal" class="flex-1 btn-secondary">
                キャンセル
              </button>
              <button type="submit" class="flex-1 btn-primary">
                {{ editingReminder ? '更新' : '追加' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const settingsStore = useSettingsStore()

// Reactive data
const isLoading = ref(false)
const showCustomReminderModal = ref(false)
const editingReminder = ref(null)

// Default reminders
const defaultReminders = ref({
  weight: {
    enabled: true,
    time: '20:00',
    repeat: 'daily',
    message: '今日の体重を記録しましょう！'
  },
  meal: {
    enabled: true,
    time: '21:00',
    repeat: 'daily',
    message: '今日の食事を記録しましょう！'
  },
  exercise: {
    enabled: true,
    time: '19:00',
    repeat: 'daily',
    message: '今日の運動を記録しましょう！'
  }
})

// Custom reminders
const customReminders = ref([])

// Advanced settings
const advancedSettings = ref({
  snoozeTime: '10',
  maxSnoozeCount: '3',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  autoDismiss: false
})

// Reminder history
const reminderHistory = ref([])

// Custom reminder form
const customReminderForm = ref({
  title: '',
  message: '',
  time: '09:00',
  type: 'custom',
  repeat: 'daily',
  days: []
})

// Week days
const weekDays = [
  { value: 'mon', label: '月' },
  { value: 'tue', label: '火' },
  { value: 'wed', label: '水' },
  { value: 'thu', label: '木' },
  { value: 'fri', label: '金' },
  { value: 'sat', label: '土' },
  { value: 'sun', label: '日' }
]

// Computed properties
const activeRemindersCount = computed(() => {
  let count = 0
  if (defaultReminders.value.weight.enabled) count++
  if (defaultReminders.value.meal.enabled) count++
  if (defaultReminders.value.exercise.enabled) count++
  count += customReminders.value.filter(r => r.enabled).length
  return count
})

const todayRemindersCount = computed(() => {
  const today = new Date().toDateString()
  return reminderHistory.value.filter(h => 
    new Date(h.executedAt).toDateString() === today
  ).length
})

const nextReminderTime = computed(() => {
  const now = new Date()
  const today = now.toDateString()
  
  // 今日のリマインダーを取得
  const todayReminders = []
  
  if (defaultReminders.value.weight.enabled) {
    todayReminders.push({
      time: defaultReminders.value.weight.time,
      title: '体重記録'
    })
  }
  
  if (defaultReminders.value.meal.enabled) {
    todayReminders.push({
      time: defaultReminders.value.meal.time,
      title: '食事記録'
    })
  }
  
  if (defaultReminders.value.exercise.enabled) {
    todayReminders.push({
      time: defaultReminders.value.exercise.time,
      title: '運動記録'
    })
  }
  
  customReminders.value.forEach(reminder => {
    if (reminder.enabled) {
      todayReminders.push({
        time: reminder.time,
        title: reminder.title
      })
    }
  })
  
  // 次回のリマインダーを計算
  const nextReminder = todayReminders
    .map(r => {
      const [hours, minutes] = r.time.split(':')
      const reminderTime = new Date(now)
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      return { ...r, reminderTime }
    })
    .filter(r => r.reminderTime > now)
    .sort((a, b) => a.reminderTime - b.reminderTime)[0]
  
  return nextReminder ? `${nextReminder.title} - ${nextReminder.time}` : null
})

const lastReminderExecution = computed(() => {
  if (reminderHistory.value.length === 0) return null
  const last = reminderHistory.value[0]
  return new Date(last.executedAt).toLocaleString('ja-JP')
})

// Methods
const updateDefaultReminders = async () => {
  try {
    await settingsStore.updateSettings({
      defaultReminders: defaultReminders.value
    })
  } catch (error) {
    console.error('デフォルトリマインダー更新エラー:', error)
  }
}

const updateCustomReminder = async (index) => {
  try {
    await settingsStore.updateSettings({
      customReminders: customReminders.value
    })
  } catch (error) {
    console.error('カスタムリマインダー更新エラー:', error)
  }
}

const updateAdvancedSettings = async () => {
  try {
    await settingsStore.updateSettings({
      reminderAdvancedSettings: advancedSettings.value
    })
  } catch (error) {
    console.error('詳細設定更新エラー:', error)
  }
}

const saveAllReminders = async () => {
  try {
    isLoading.value = true
    await Promise.all([
      updateDefaultReminders(),
      updateCustomReminder(),
      updateAdvancedSettings()
    ])
    alert('リマインダー設定を保存しました')
  } catch (error) {
    console.error('リマインダー設定保存エラー:', error)
    alert('設定の保存に失敗しました')
  } finally {
    isLoading.value = false
  }
}

const addCustomReminder = () => {
  editingReminder.value = null
  customReminderForm.value = {
    title: '',
    message: '',
    time: '09:00',
    type: 'custom',
    repeat: 'daily',
    days: []
  }
  showCustomReminderModal.value = true
}

const editCustomReminder = (index) => {
  editingReminder.value = index
  const reminder = customReminders.value[index]
  customReminderForm.value = {
    title: reminder.title,
    message: reminder.message,
    time: reminder.time,
    type: reminder.type,
    repeat: reminder.repeat,
    days: reminder.days || []
  }
  showCustomReminderModal.value = true
}

const saveCustomReminder = () => {
  const newReminder = {
    id: editingReminder.value !== null 
      ? customReminders.value[editingReminder.value].id 
      : Date.now().toString(),
    title: customReminderForm.value.title,
    message: customReminderForm.value.message,
    time: customReminderForm.value.time,
    type: customReminderForm.value.type,
    repeat: customReminderForm.value.repeat,
    days: customReminderForm.value.days,
    enabled: true
  }
  
  if (editingReminder.value !== null) {
    customReminders.value[editingReminder.value] = newReminder
  } else {
    customReminders.value.push(newReminder)
  }
  
  updateCustomReminder()
  closeCustomReminderModal()
}

const deleteCustomReminder = (index) => {
  if (confirm('このリマインダーを削除しますか？')) {
    customReminders.value.splice(index, 1)
    updateCustomReminder()
  }
}

const closeCustomReminderModal = () => {
  showCustomReminderModal.value = false
  editingReminder.value = null
}

const onRepeatChange = () => {
  if (customReminderForm.value.repeat !== 'custom') {
    customReminderForm.value.days = []
  }
}

const getReminderIcon = (type) => {
  const icons = {
    weight: 'fas fa-weight text-blue-600',
    meal: 'fas fa-utensils text-green-600',
    exercise: 'fas fa-dumbbell text-purple-600',
    motivation: 'fas fa-heart text-red-600',
    custom: 'fas fa-bell text-gray-600'
  }
  return icons[type] || icons.custom
}

const getRepeatText = (repeat) => {
  const texts = {
    once: '1回のみ',
    daily: '毎日',
    weekly: '毎週',
    custom: 'カスタム'
  }
  return texts[repeat] || repeat
}

const clearHistory = () => {
  if (confirm('リマインダー履歴をクリアしますか？')) {
    reminderHistory.value = []
    localStorage.setItem('reminder_history', JSON.stringify([]))
  }
}

const loadReminderSettings = async () => {
  try {
    const settings = settingsStore.userSettings
    
    if (settings.defaultReminders) {
      defaultReminders.value = {
        ...defaultReminders.value,
        ...settings.defaultReminders
      }
    }
    
    if (settings.customReminders) {
      customReminders.value = settings.customReminders
    }
    
    if (settings.reminderAdvancedSettings) {
      advancedSettings.value = {
        ...advancedSettings.value,
        ...settings.reminderAdvancedSettings
      }
    }
    
    // 履歴を読み込み
    const history = localStorage.getItem('reminder_history')
    if (history) {
      reminderHistory.value = JSON.parse(history)
    }
  } catch (error) {
    console.error('リマインダー設定読み込みエラー:', error)
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  
  await settingsStore.loadSettings()
  await loadReminderSettings()
  
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

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto;
}
</style> 