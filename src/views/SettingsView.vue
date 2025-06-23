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
            <h1 class="text-xl font-bold">設定</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="exportSettings" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-download text-xl"></i>
            </button>
            <button @click="showImportModal = true" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-upload text-xl"></i>
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
      <!-- User Profile Section -->
      <section class="mb-8">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">プロフィール</h2>
            <router-link to="/profile-edit" class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-edit mr-1"></i>編集
            </router-link>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {{ userInitials }}
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold">{{ userSettings.nickname || 'ユーザー' }}</h3>
              <p class="text-gray-600 text-sm">
                {{ userSettings.age }}歳 / {{ genderLabel }} / {{ userSettings.height }}cm
              </p>
              <p class="text-gray-600 text-sm">
                活動レベル: {{ activityLevelLabel }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Goals Section -->
      <section class="mb-8">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">目標設定</h2>
            <router-link to="/goal-setting" class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-edit mr-1"></i>編集
            </router-link>
          </div>
          
          <div v-if="hasGoals" class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ userSettings.targetWeight }}kg</div>
              <div class="text-sm text-gray-600">目標体重</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ userSettings.dailyCalorieGoal }}kcal</div>
              <div class="text-sm text-gray-600">目標カロリー</div>
            </div>
          </div>
          
          <div v-else class="text-center py-6 text-gray-500">
            <i class="fas fa-bullseye text-3xl mb-2"></i>
            <p>目標が設定されていません</p>
            <router-link to="/goal-setting" class="text-blue-600 hover:text-blue-800 text-sm">
              目標を設定する
            </router-link>
          </div>
        </div>
      </section>

      <!-- Settings Categories -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">アプリ設定</h2>
          
          <div class="space-y-4">
            <!-- Reminder Settings -->
            <router-link to="/reminder-setting" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center">
                <i class="fas fa-bell text-blue-600 text-xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">リマインダー設定</h3>
                  <p class="text-sm text-gray-600">記録のリマインダーを設定</p>
                </div>
              </div>
              <i class="fas fa-chevron-right text-gray-400"></i>
            </router-link>

            <!-- Notification Settings -->
            <router-link to="/notification-setting" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center">
                <i class="fas fa-bell text-green-600 text-xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">通知設定</h3>
                  <p class="text-sm text-gray-600">プッシュ通知の設定</p>
                </div>
              </div>
              <i class="fas fa-chevron-right text-gray-400"></i>
            </router-link>

            <!-- Data Backup -->
            <router-link to="/data-backup" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-center">
                <i class="fas fa-cloud text-purple-600 text-xl mr-3"></i>
                <div>
                  <h3 class="font-semibold">データバックアップ</h3>
                  <p class="text-sm text-gray-600">データのエクスポート・インポート</p>
                </div>
              </div>
              <i class="fas fa-chevron-right text-gray-400"></i>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Cheer Character Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">応援キャラクター設定</h2>
          
          <div class="space-y-4">
            <!-- Character Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                キャラクタータイプ
              </label>
              <select v-model="cheerCharacter.type" @change="updateCheerCharacter" class="input-field">
                <option value="friendly">フレンドリー</option>
                <option value="strict">厳しい</option>
                <option value="cute">かわいい</option>
                <option value="cool">クール</option>
              </select>
            </div>

            <!-- Message Frequency -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                メッセージ頻度
              </label>
              <select v-model="cheerCharacter.frequency" @change="updateCheerCharacter" class="input-field">
                <option value="low">少なめ</option>
                <option value="normal">普通</option>
                <option value="high">多め</option>
              </select>
            </div>

            <!-- Custom Messages -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                カスタムメッセージ
              </label>
              <div class="space-y-2">
                <div v-for="(message, index) in cheerCharacter.customMessages" :key="index" class="flex items-center space-x-2">
                  <input
                    v-model="cheerCharacter.customMessages[index]"
                    @change="updateCheerCharacter"
                    type="text"
                    class="flex-1 input-field text-sm"
                    placeholder="カスタムメッセージを入力"
                  />
                  <button @click="removeCustomMessage(index)" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <button @click="addCustomMessage" class="text-blue-600 hover:text-blue-800 text-sm">
                  <i class="fas fa-plus mr-1"></i>メッセージを追加
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Display Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">表示設定</h2>
          
          <div class="space-y-4">
            <!-- Theme -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                テーマ
              </label>
              <select v-model="displaySettings.theme" @change="updateDisplaySettings" class="input-field">
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
                <option value="auto">自動</option>
              </select>
            </div>

            <!-- Language -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                言語
              </label>
              <select v-model="displaySettings.language" @change="updateDisplaySettings" class="input-field">
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>

            <!-- Units -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                単位
              </label>
              <select v-model="displaySettings.units" @change="updateDisplaySettings" class="input-field">
                <option value="metric">メートル法 (kg, cm)</option>
                <option value="imperial">ヤード・ポンド法 (lb, in)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Data Sync Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">データ同期設定</h2>
          
          <div class="space-y-4">
            <!-- Auto Backup -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">自動バックアップ</h3>
                <p class="text-sm text-gray-600">定期的にデータを自動バックアップ</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="dataSyncSettings.autoBackup"
                  @change="updateDataSyncSettings"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Backup Frequency -->
            <div v-if="dataSyncSettings.autoBackup">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                バックアップ頻度
              </label>
              <select v-model="dataSyncSettings.backupFrequency" @change="updateDataSyncSettings" class="input-field">
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="mb-8">
        <div class="card border-red-200 bg-red-50">
          <h2 class="text-xl font-bold mb-4 text-red-800">危険な操作</h2>
          
          <div class="space-y-4">
            <!-- Reset to Defaults -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-red-800">設定をリセット</h3>
                <p class="text-sm text-red-600">すべての設定をデフォルトに戻します</p>
              </div>
              <button @click="resetToDefaults" class="btn-secondary text-red-600 border-red-300 hover:bg-red-100">
                リセット
              </button>
            </div>

            <!-- Clear All Data -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-red-800">すべてのデータを削除</h3>
                <p class="text-sm text-red-600">記録、設定などすべてのデータを削除します</p>
              </div>
              <button @click="clearAllData" class="btn-danger">
                削除
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- App Info -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">アプリ情報</h2>
          
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>バージョン</span>
              <span>1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span>最終更新</span>
              <span>{{ lastUpdated }}</span>
            </div>
            <div class="flex justify-between">
              <span>データサイズ</span>
              <span>{{ dataSize }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Import Modal -->
    <div v-if="showImportModal" class="modal-overlay" @click="showImportModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">データインポート</h3>
          <button @click="showImportModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              バックアップファイルを選択
            </label>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileImport"
              class="hidden"
            />
            <button @click="$refs.fileInput.click()" class="w-full btn-secondary">
              <i class="fas fa-upload mr-2"></i>ファイルを選択
            </button>
          </div>
          
          <div v-if="importError" class="p-3 bg-red-50 rounded text-sm text-red-600 mb-4">
            {{ importError }}
          </div>
          
          <div class="flex space-x-3">
            <button @click="showImportModal = false" class="flex-1 btn-secondary">
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <div class="modal-content" @click.stop>
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-red-800">{{ confirmModalTitle }}</h3>
        </div>
        <div class="p-4">
          <p class="text-gray-700 mb-4">{{ confirmModalMessage }}</p>
          <div class="flex space-x-3">
            <button @click="showConfirmModal = false" class="flex-1 btn-secondary">
              キャンセル
            </button>
            <button @click="confirmAction" class="flex-1 btn-danger">
              確認
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
const showImportModal = ref(false)
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const confirmAction = ref(null)
const importError = ref('')

// Computed properties
const userSettings = computed(() => settingsStore.userSettings)

const userInitials = computed(() => {
  const nickname = userSettings.value.nickname || 'ユーザー'
  return nickname.slice(0, 2).toUpperCase()
})

const genderLabel = computed(() => {
  return userSettings.value.gender === 'male' ? '男性' : '女性'
})

const activityLevelLabel = computed(() => {
  const labels = {
    sedentary: '座り仕事中心',
    light: '軽い運動',
    moderate: '中程度の運動',
    active: '活発な運動',
    very_active: '非常に活発な運動'
  }
  return labels[userSettings.value.activityLevel] || '未設定'
})

const hasGoals = computed(() => {
  return userSettings.value.targetWeight && userSettings.value.dailyCalorieGoal
})

const cheerCharacter = computed(() => userSettings.value.cheerCharacter)
const displaySettings = computed(() => userSettings.value.display)
const dataSyncSettings = computed(() => userSettings.value.dataSync)

const lastUpdated = computed(() => {
  return new Date().toLocaleDateString('ja-JP')
})

const dataSize = computed(() => {
  // 簡易的なデータサイズ計算
  const data = JSON.stringify(userSettings.value)
  const sizeInBytes = new Blob([data]).size
  const sizeInKB = Math.round(sizeInBytes / 1024 * 100) / 100
  return `${sizeInKB} KB`
})

// Methods
const updateCheerCharacter = async () => {
  try {
    await settingsStore.updateCheerCharacter(cheerCharacter.value)
  } catch (error) {
    console.error('応援キャラクター設定更新エラー:', error)
  }
}

const updateDisplaySettings = async () => {
  try {
    await settingsStore.updateDisplaySettings(displaySettings.value)
  } catch (error) {
    console.error('表示設定更新エラー:', error)
  }
}

const updateDataSyncSettings = async () => {
  try {
    await settingsStore.updateSettings({ dataSync: dataSyncSettings.value })
  } catch (error) {
    console.error('データ同期設定更新エラー:', error)
  }
}

const addCustomMessage = async () => {
  try {
    await settingsStore.addCustomMessage('新しいメッセージ')
  } catch (error) {
    console.error('カスタムメッセージ追加エラー:', error)
  }
}

const removeCustomMessage = async (index) => {
  try {
    await settingsStore.removeCustomMessage(index)
  } catch (error) {
    console.error('カスタムメッセージ削除エラー:', error)
  }
}

const exportSettings = () => {
  try {
    const data = settingsStore.exportSettings()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diet-app-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('設定をエクスポートしました')
  } catch (error) {
    console.error('設定エクスポートエラー:', error)
    alert('エクスポートに失敗しました')
  }
}

const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    const result = await settingsStore.importSettings(data)
    if (result.success) {
      alert('データのインポートが完了しました')
      showImportModal.value = false
      importError.value = ''
    } else {
      importError.value = result.error || 'インポートに失敗しました'
    }
  } catch (error) {
    console.error('ファイルインポートエラー:', error)
    importError.value = 'ファイルの読み込みに失敗しました'
  }
}

const resetToDefaults = () => {
  confirmModalTitle.value = '設定をリセット'
  confirmModalMessage.value = 'すべての設定をデフォルトに戻します。この操作は取り消せません。'
  confirmAction.value = async () => {
    try {
      await settingsStore.resetToDefaults()
      showConfirmModal.value = false
      alert('設定をリセットしました')
    } catch (error) {
      console.error('設定リセットエラー:', error)
      alert('リセットに失敗しました')
    }
  }
  showConfirmModal.value = true
}

const clearAllData = () => {
  confirmModalTitle.value = 'すべてのデータを削除'
  confirmModalMessage.value = '記録、設定などすべてのデータを削除します。この操作は取り消せません。'
  confirmAction.value = async () => {
    try {
      settingsStore.clearAllSettings()
      showConfirmModal.value = false
      alert('すべてのデータを削除しました')
      router.push('/login')
    } catch (error) {
      console.error('データ削除エラー:', error)
      alert('削除に失敗しました')
    }
  }
  showConfirmModal.value = true
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  await settingsStore.loadSettings()
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