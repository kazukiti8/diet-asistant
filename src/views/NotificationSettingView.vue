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
            <h1 class="text-xl font-bold">通知設定</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="testNotification" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-bell text-xl"></i>
            </button>
            <button @click="saveAllSettings" class="p-2 text-gray-600 hover:text-gray-800">
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
      <!-- Notification Status -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">通知状況</h2>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ enabledNotificationsCount }}</div>
              <div class="text-sm text-gray-600">有効な通知</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ notificationPermissionStatus }}</div>
              <div class="text-sm text-gray-600">ブラウザ権限</div>
            </div>
          </div>
          
          <div class="p-3 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-700">
              <strong>最終通知:</strong> {{ lastNotificationTime || 'なし' }}<br>
              <strong>通知音:</strong> {{ selectedNotificationSound }}
            </div>
          </div>
        </div>
      </section>

      <!-- General Notification Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">基本設定</h2>
          
          <div class="space-y-4">
            <!-- Master Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">通知を有効にする</h3>
                <p class="text-sm text-gray-600">すべての通知の有効/無効を切り替え</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.enabled"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Notification Sound -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                通知音
              </label>
              <select v-model="notificationSettings.sound" @change="updateNotificationSettings" class="input-field">
                <option value="default">デフォルト</option>
                <option value="chime">チャイム</option>
                <option value="bell">ベル</option>
                <option value="ding">ディング</option>
                <option value="none">なし</option>
              </select>
            </div>

            <!-- Vibration -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">バイブレーション</h3>
                <p class="text-sm text-gray-600">通知時にバイブレーション</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.vibration"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Quiet Hours -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">おやすみモード</h3>
                <p class="text-sm text-gray-600">指定時間内は通知を無音</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.quietHours.enabled"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Quiet Hours Time -->
            <div v-if="notificationSettings.quietHours.enabled" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  開始時間
                </label>
                <input
                  v-model="notificationSettings.quietHours.start"
                  @change="updateNotificationSettings"
                  type="time"
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  終了時間
                </label>
                <input
                  v-model="notificationSettings.quietHours.end"
                  @change="updateNotificationSettings"
                  type="time"
                  class="input-field"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Category-specific Notifications -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">通知カテゴリ</h2>
          
          <div class="space-y-4">
            <!-- Weight Notifications -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-weight text-blue-600 text-xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">体重記録</h3>
                  <p class="text-sm text-gray-600">体重記録のリマインダー</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.categories.weight"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Meal Notifications -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-utensils text-green-600 text-xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">食事記録</h3>
                  <p class="text-sm text-gray-600">食事記録のリマインダー</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.categories.meal"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Exercise Notifications -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-dumbbell text-purple-600 text-xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">運動記録</h3>
                  <p class="text-sm text-gray-600">運動記録のリマインダー</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.categories.exercise"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Achievement Notifications -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-trophy text-yellow-600 text-xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">達成通知</h3>
                  <p class="text-sm text-gray-600">目標達成や記録更新の通知</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.categories.achievement"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Motivation Notifications -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-heart text-red-600 text-xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">モチベーション</h3>
                  <p class="text-sm text-gray-600">応援メッセージや励まし</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.categories.motivation"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Notification Timing -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">通知タイミング</h2>
          
          <div class="space-y-4">
            <!-- Daily Summary -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">日次サマリー</h3>
                <p class="text-sm text-gray-600">1日の記録をまとめて通知</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.timing.dailySummary"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Weekly Progress -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">週次進捗</h3>
                <p class="text-sm text-gray-600">週の進捗をまとめて通知</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.timing.weeklyProgress"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Streak Reminders -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">継続リマインダー</h3>
                <p class="text-sm text-gray-600">記録が途切れそうな時の通知</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.timing.streakReminder"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Advanced Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">詳細設定</h2>
          
          <div class="space-y-4">
            <!-- Notification Frequency -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                通知頻度
              </label>
              <select v-model="notificationSettings.frequency" @change="updateNotificationSettings" class="input-field">
                <option value="low">少なめ（1日1-2回）</option>
                <option value="normal">普通（1日3-5回）</option>
                <option value="high">多め（1日6-10回）</option>
              </select>
            </div>

            <!-- Notification Style -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                通知スタイル
              </label>
              <select v-model="notificationSettings.style" @change="updateNotificationSettings" class="input-field">
                <option value="simple">シンプル</option>
                <option value="detailed">詳細</option>
                <option value="motivational">モチベーション重視</option>
              </select>
            </div>

            <!-- Auto-dismiss -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">自動消去</h3>
                <p class="text-sm text-gray-600">通知を自動的に消去</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="notificationSettings.autoDismiss"
                  @change="updateNotificationSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Auto-dismiss Time -->
            <div v-if="notificationSettings.autoDismiss">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                自動消去時間
              </label>
              <select v-model="notificationSettings.autoDismissTime" @change="updateNotificationSettings" class="input-field">
                <option value="5">5秒</option>
                <option value="10">10秒</option>
                <option value="30">30秒</option>
                <option value="60">1分</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Test Section -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">テスト通知</h2>
          
          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              現在の設定で通知が正しく動作するかテストできます。
            </p>
            
            <div class="grid grid-cols-2 gap-4">
              <button @click="testNotification('weight')" class="btn-secondary">
                <i class="fas fa-weight mr-2"></i>体重記録
              </button>
              <button @click="testNotification('meal')" class="btn-secondary">
                <i class="fas fa-utensils mr-2"></i>食事記録
              </button>
              <button @click="testNotification('exercise')" class="btn-secondary">
                <i class="fas fa-dumbbell mr-2"></i>運動記録
              </button>
              <button @click="testNotification('achievement')" class="btn-secondary">
                <i class="fas fa-trophy mr-2"></i>達成通知
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Permission Modal -->
    <div v-if="showPermissionModal" class="modal-overlay" @click="showPermissionModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold">通知権限が必要です</h3>
        </div>
        <div class="p-4">
          <p class="text-gray-700 mb-4">
            通知機能を使用するには、ブラウザの通知権限を許可する必要があります。
          </p>
          <div class="flex space-x-3">
            <button @click="showPermissionModal = false" class="flex-1 btn-secondary">
              キャンセル
            </button>
            <button @click="requestNotificationPermission" class="flex-1 btn-primary">
              権限を許可
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
import { useSettingsStore } from '@/stores/settings'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const settingsStore = useSettingsStore()

// Reactive data
const isLoading = ref(false)
const showPermissionModal = ref(false)
const notificationPermission = ref('default')

// Notification settings
const notificationSettings = ref({
  enabled: true,
  sound: 'default',
  vibration: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  categories: {
    weight: true,
    meal: true,
    exercise: true,
    achievement: true,
    motivation: true
  },
  timing: {
    dailySummary: true,
    weeklyProgress: true,
    streakReminder: true
  },
  frequency: 'normal',
  style: 'simple',
  autoDismiss: false,
  autoDismissTime: '10'
})

// Computed properties
const enabledNotificationsCount = computed(() => {
  if (!notificationSettings.value.enabled) return 0
  return Object.values(notificationSettings.value.categories).filter(Boolean).length
})

const notificationPermissionStatus = computed(() => {
  switch (notificationPermission.value) {
    case 'granted': return '許可済み'
    case 'denied': return '拒否済み'
    case 'default': return '未設定'
    default: return '不明'
  }
})

const selectedNotificationSound = computed(() => {
  const sounds = {
    default: 'デフォルト',
    chime: 'チャイム',
    bell: 'ベル',
    ding: 'ディング',
    none: 'なし'
  }
  return sounds[notificationSettings.value.sound] || 'デフォルト'
})

const lastNotificationTime = computed(() => {
  const lastTime = localStorage.getItem('last_notification_time')
  if (!lastTime) return null
  return new Date(lastTime).toLocaleString('ja-JP')
})

// Methods
const updateNotificationSettings = async () => {
  try {
    await settingsStore.updateSettings({
      notifications: notificationSettings.value
    })
  } catch (error) {
    console.error('通知設定更新エラー:', error)
  }
}

const saveAllSettings = async () => {
  try {
    isLoading.value = true
    await updateNotificationSettings()
    alert('設定を保存しました')
  } catch (error) {
    console.error('設定保存エラー:', error)
    alert('設定の保存に失敗しました')
  } finally {
    isLoading.value = false
  }
}

const checkNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('このブラウザは通知をサポートしていません')
    return false
  }

  notificationPermission.value = Notification.permission

  if (Notification.permission === 'default') {
    showPermissionModal.value = true
    return false
  }

  if (Notification.permission === 'denied') {
    alert('通知が拒否されています。ブラウザの設定で通知を許可してください。')
    return false
  }

  return true
}

const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    
    if (permission === 'granted') {
      showPermissionModal.value = false
      alert('通知権限が許可されました')
    } else {
      alert('通知権限が拒否されました')
    }
  } catch (error) {
    console.error('通知権限リクエストエラー:', error)
    alert('通知権限の取得に失敗しました')
  }
}

const testNotification = async (type = 'test') => {
  if (!await checkNotificationPermission()) return

  try {
    const messages = {
      weight: {
        title: '体重記録の時間です',
        body: '今日の体重を記録しましょう！',
        icon: '/favicon.ico'
      },
      meal: {
        title: '食事記録の時間です',
        body: '今日の食事を記録しましょう！',
        icon: '/favicon.ico'
      },
      exercise: {
        title: '運動記録の時間です',
        body: '今日の運動を記録しましょう！',
        icon: '/favicon.ico'
      },
      achievement: {
        title: '🎉 目標達成！',
        body: '素晴らしい進歩です！',
        icon: '/favicon.ico'
      },
      test: {
        title: 'テスト通知',
        body: '通知設定が正常に動作しています',
        icon: '/favicon.ico'
      }
    }

    const message = messages[type] || messages.test

    const notification = new Notification(message.title, {
      body: message.body,
      icon: message.icon,
      badge: '/favicon.ico',
      tag: 'diet-app-notification',
      requireInteraction: !notificationSettings.value.autoDismiss,
      silent: notificationSettings.value.sound === 'none'
    })

    // 自動消去設定
    if (notificationSettings.value.autoDismiss) {
      setTimeout(() => {
        notification.close()
      }, notificationSettings.value.autoDismissTime * 1000)
    }

    // バイブレーション設定
    if (notificationSettings.value.vibration && 'vibrate' in navigator) {
      navigator.vibrate(200)
    }

    // 最終通知時間を記録
    localStorage.setItem('last_notification_time', new Date().toISOString())

    // 通知クリック時の処理
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

  } catch (error) {
    console.error('テスト通知エラー:', error)
    alert('テスト通知の送信に失敗しました')
  }
}

const loadNotificationSettings = async () => {
  try {
    const settings = settingsStore.userSettings
    if (settings.notifications) {
      notificationSettings.value = {
        ...notificationSettings.value,
        ...settings.notifications
      }
    }
  } catch (error) {
    console.error('通知設定読み込みエラー:', error)
  }
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  
  await settingsStore.loadSettings()
  await loadNotificationSettings()
  
  // 通知権限をチェック
  await checkNotificationPermission()
  
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
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}
</style> 