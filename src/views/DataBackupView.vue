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
            <h1 class="text-xl font-bold">データバックアップ</h1>
          </div>
          <div class="flex space-x-2">
            <button @click="createBackup" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-plus text-xl"></i>
            </button>
            <button @click="refreshBackups" class="p-2 text-gray-600 hover:text-gray-800">
              <i class="fas fa-sync-alt text-xl"></i>
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
      <!-- Backup Status -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">バックアップ状況</h2>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ backupCount }}</div>
              <div class="text-sm text-gray-600">バックアップ数</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ totalDataSize }}</div>
              <div class="text-sm text-gray-600">総データサイズ</div>
            </div>
          </div>
          
          <div class="p-3 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-700">
              <strong>最終バックアップ:</strong> {{ lastBackupDate || 'なし' }}<br>
              <strong>自動バックアップ:</strong> {{ autoBackupStatus }}
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">クイックアクション</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <button @click="exportData" class="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div class="text-center">
                <i class="fas fa-download text-2xl text-blue-600 mb-2"></i>
                <h3 class="font-semibold text-blue-800">データエクスポート</h3>
                <p class="text-sm text-blue-600">現在のデータをダウンロード</p>
              </div>
            </button>
            
            <button @click="showImportModal = true" class="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div class="text-center">
                <i class="fas fa-upload text-2xl text-green-600 mb-2"></i>
                <h3 class="font-semibold text-green-800">データインポート</h3>
                <p class="text-sm text-green-600">バックアップから復元</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- Auto Backup Settings -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">自動バックアップ設定</h2>
          
          <div class="space-y-4">
            <!-- Auto Backup Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">自動バックアップ</h3>
                <p class="text-sm text-gray-600">定期的にデータを自動バックアップ</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="autoBackupEnabled"
                  @change="updateAutoBackup"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Backup Frequency -->
            <div v-if="autoBackupEnabled">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                バックアップ頻度
              </label>
              <select v-model="backupFrequency" @change="updateAutoBackup" class="input-field">
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>

            <!-- Keep Period -->
            <div v-if="autoBackupEnabled">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                保持期間
              </label>
              <select v-model="keepPeriod" @change="updateAutoBackup" class="input-field">
                <option value="7">1週間</option>
                <option value="30">1ヶ月</option>
                <option value="90">3ヶ月</option>
                <option value="365">1年</option>
                <option value="0">無期限</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Backup History -->
      <section class="mb-8">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">バックアップ履歴</h2>
            <button @click="refreshBackups" class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-sync-alt mr-1"></i>更新
            </button>
          </div>
          
          <div v-if="backupHistory.length > 0" class="space-y-3">
            <div
              v-for="backup in backupHistory"
              :key="backup.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-file-archive text-blue-600"></i>
                  <div>
                    <h3 class="font-semibold">{{ backup.name }}</h3>
                    <p class="text-sm text-gray-600">
                      {{ formatDate(backup.createdAt) }} • {{ backup.size }}
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button @click="previewBackup(backup)" class="p-2 text-gray-600 hover:text-blue-600">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="downloadBackup(backup)" class="p-2 text-gray-600 hover:text-green-600">
                  <i class="fas fa-download"></i>
                </button>
                <button @click="deleteBackup(backup)" class="p-2 text-gray-600 hover:text-red-600">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <i class="fas fa-cloud text-3xl mb-2"></i>
            <p>バックアップがありません</p>
            <p class="text-sm">初回バックアップを作成してください</p>
          </div>
        </div>
      </section>

      <!-- Data Summary -->
      <section class="mb-8">
        <div class="card">
          <h2 class="text-xl font-bold mb-4">データ概要</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ dataSummary.weightRecords }}</div>
              <div class="text-sm text-gray-600">体重記録</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ dataSummary.mealRecords }}</div>
              <div class="text-sm text-gray-600">食事記録</div>
            </div>
            <div class="text-center p-3 bg-purple-50 rounded-lg">
              <div class="text-lg font-bold text-purple-600">{{ dataSummary.exerciseRecords }}</div>
              <div class="text-sm text-gray-600">運動記録</div>
            </div>
            <div class="text-center p-3 bg-yellow-50 rounded-lg">
              <div class="text-lg font-bold text-yellow-600">{{ dataSummary.totalDays }}</div>
              <div class="text-sm text-gray-600">記録日数</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Import Modal -->
    <div v-if="showImportModal" class="modal-overlay" @click="showImportModal = false">
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
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
          
          <div v-if="importPreview" class="mb-4">
            <h4 class="font-semibold mb-2">インポート内容プレビュー</h4>
            <div class="p-3 bg-gray-50 rounded text-sm">
              <div>作成日: {{ formatDate(importPreview.createdAt) }}</div>
              <div>バージョン: {{ importPreview.version }}</div>
              <div>データサイズ: {{ importPreview.size }}</div>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button @click="showImportModal = false" class="flex-1 btn-secondary">
              キャンセル
            </button>
            <button v-if="importPreview" @click="confirmImport" class="flex-1 btn-primary">
              インポート実行
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="showPreviewModal = false">
      <div class="modal-content max-h-screen overflow-y-auto" @click.stop>
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold">バックアップ詳細</h3>
          <button @click="showPreviewModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4">
          <div v-if="previewData" class="space-y-4">
            <div>
              <h4 class="font-semibold mb-2">基本情報</h4>
              <div class="p-3 bg-gray-50 rounded text-sm space-y-1">
                <div>作成日: {{ formatDate(previewData.createdAt) }}</div>
                <div>バージョン: {{ previewData.version }}</div>
                <div>データサイズ: {{ previewData.size }}</div>
              </div>
            </div>
            
            <div>
              <h4 class="font-semibold mb-2">データ内容</h4>
              <div class="p-3 bg-gray-50 rounded text-sm space-y-1">
                <div>体重記録: {{ previewData.dataSummary?.weightRecords || 0 }}件</div>
                <div>食事記録: {{ previewData.dataSummary?.mealRecords || 0 }}件</div>
                <div>運動記録: {{ previewData.dataSummary?.exerciseRecords || 0 }}件</div>
                <div>記録日数: {{ previewData.dataSummary?.totalDays || 0 }}日</div>
              </div>
            </div>
            
            <div class="flex space-x-3">
              <button @click="downloadBackup(previewData)" class="flex-1 btn-primary">
                <i class="fas fa-download mr-2"></i>ダウンロード
              </button>
              <button @click="restoreBackup(previewData)" class="flex-1 btn-secondary">
                <i class="fas fa-undo mr-2"></i>復元
              </button>
            </div>
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
import { useWeightStore } from '@/stores/weight'
import { useMealStore } from '@/stores/meal'
import { useExerciseStore } from '@/stores/exercise'
import BottomNavigation from '@/components/BottomNavigation.vue'

const router = useRouter()
const settingsStore = useSettingsStore()
const weightStore = useWeightStore()
const mealStore = useMealStore()
const exerciseStore = useExerciseStore()

// Reactive data
const isLoading = ref(false)
const showImportModal = ref(false)
const showPreviewModal = ref(false)
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const confirmAction = ref(null)
const importError = ref('')
const importPreview = ref(null)
const previewData = ref(null)
const backupHistory = ref([])
const autoBackupEnabled = ref(false)
const backupFrequency = ref('weekly')
const keepPeriod = ref('30')

// Computed properties
const backupCount = computed(() => backupHistory.value.length)

const totalDataSize = computed(() => {
  const totalSize = backupHistory.value.reduce((sum, backup) => {
    return sum + parseFloat(backup.size.replace(' KB', ''))
  }, 0)
  return `${totalSize.toFixed(1)} KB`
})

const lastBackupDate = computed(() => {
  if (backupHistory.value.length === 0) return null
  const latest = backupHistory.value[0]
  return formatDate(latest.createdAt)
})

const autoBackupStatus = computed(() => {
  return autoBackupEnabled.value ? '有効' : '無効'
})

const dataSummary = computed(() => {
  return {
    weightRecords: weightStore.weightRecords.length,
    mealRecords: mealStore.mealRecords.length,
    exerciseRecords: exerciseStore.exerciseRecords.length,
    totalDays: calculateTotalDays()
  }
})

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateTotalDays = () => {
  const allDates = new Set()
  
  // 体重記録の日付
  weightStore.weightRecords.forEach(record => {
    allDates.add(new Date(record.timestamp).toDateString())
  })
  
  // 食事記録の日付
  mealStore.mealRecords.forEach(record => {
    allDates.add(new Date(record.timestamp).toDateString())
  })
  
  // 運動記録の日付
  exerciseStore.exerciseRecords.forEach(record => {
    allDates.add(new Date(record.timestamp).toDateString())
  })
  
  return allDates.size
}

const createBackup = async () => {
  try {
    isLoading.value = true
    
    const backupData = {
      id: Date.now().toString(),
      name: `backup-${new Date().toISOString().split('T')[0]}`,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      settings: settingsStore.exportSettings(),
      weightRecords: weightStore.exportData(),
      mealRecords: mealStore.exportData(),
      exerciseRecords: exerciseStore.exportData(),
      dataSummary: dataSummary.value
    }
    
    // ローカルストレージに保存
    const existingBackups = JSON.parse(localStorage.getItem('backup_history') || '[]')
    existingBackups.unshift(backupData)
    localStorage.setItem('backup_history', JSON.stringify(existingBackups))
    
    // 履歴を更新
    await loadBackupHistory()
    
    alert('バックアップが作成されました')
  } catch (error) {
    console.error('バックアップ作成エラー:', error)
    alert('バックアップの作成に失敗しました')
  } finally {
    isLoading.value = false
  }
}

const exportData = () => {
  try {
    const backupData = {
      id: Date.now().toString(),
      name: `export-${new Date().toISOString().split('T')[0]}`,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      settings: settingsStore.exportSettings(),
      weightRecords: weightStore.exportData(),
      mealRecords: mealStore.exportData(),
      exerciseRecords: exerciseStore.exportData(),
      dataSummary: dataSummary.value
    }
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diet-app-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('データをエクスポートしました')
  } catch (error) {
    console.error('データエクスポートエラー:', error)
    alert('エクスポートに失敗しました')
  }
}

const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    // プレビュー表示
    importPreview.value = {
      ...data,
      size: `${(file.size / 1024).toFixed(1)} KB`
    }
    
    importError.value = ''
  } catch (error) {
    console.error('ファイル読み込みエラー:', error)
    importError.value = 'ファイルの読み込みに失敗しました'
    importPreview.value = null
  }
}

const confirmImport = async () => {
  if (!importPreview.value) return

  try {
    isLoading.value = true
    
    // 各ストアにデータをインポート
    if (importPreview.value.settings) {
      await settingsStore.importSettings(importPreview.value.settings)
    }
    
    if (importPreview.value.weightRecords) {
      await weightStore.importData(importPreview.value.weightRecords)
    }
    
    if (importPreview.value.mealRecords) {
      await mealStore.importData(importPreview.value.mealRecords)
    }
    
    if (importPreview.value.exerciseRecords) {
      await exerciseStore.importData(importPreview.value.exerciseRecords)
    }
    
    showImportModal.value = false
    importPreview.value = null
    alert('データのインポートが完了しました')
    
    // ページをリロードしてデータを反映
    window.location.reload()
  } catch (error) {
    console.error('データインポートエラー:', error)
    alert('インポートに失敗しました')
  } finally {
    isLoading.value = false
  }
}

const previewBackup = (backup) => {
  previewData.value = backup
  showPreviewModal.value = true
}

const downloadBackup = (backup) => {
  try {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${backup.name}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('バックアップダウンロードエラー:', error)
    alert('ダウンロードに失敗しました')
  }
}

const restoreBackup = (backup) => {
  confirmModalTitle.value = 'バックアップを復元'
  confirmModalMessage.value = '現在のデータが上書きされます。この操作は取り消せません。'
  confirmAction.value = async () => {
    try {
      await confirmImport()
      showConfirmModal.value = false
      showPreviewModal.value = false
    } catch (error) {
      console.error('バックアップ復元エラー:', error)
      alert('復元に失敗しました')
    }
  }
  showConfirmModal.value = true
}

const deleteBackup = (backup) => {
  confirmModalTitle.value = 'バックアップを削除'
  confirmModalMessage.value = 'このバックアップを削除しますか？'
  confirmAction.value = async () => {
    try {
      const existingBackups = JSON.parse(localStorage.getItem('backup_history') || '[]')
      const filteredBackups = existingBackups.filter(b => b.id !== backup.id)
      localStorage.setItem('backup_history', JSON.stringify(filteredBackups))
      
      await loadBackupHistory()
      showConfirmModal.value = false
      alert('バックアップを削除しました')
    } catch (error) {
      console.error('バックアップ削除エラー:', error)
      alert('削除に失敗しました')
    }
  }
  showConfirmModal.value = true
}

const updateAutoBackup = async () => {
  try {
    await settingsStore.updateSettings({
      dataSync: {
        enabled: autoBackupEnabled.value,
        autoBackup: autoBackupEnabled.value,
        backupFrequency: backupFrequency.value
      }
    })
  } catch (error) {
    console.error('自動バックアップ設定更新エラー:', error)
  }
}

const loadBackupHistory = async () => {
  try {
    const existingBackups = JSON.parse(localStorage.getItem('backup_history') || '[]')
    backupHistory.value = existingBackups.map(backup => ({
      ...backup,
      size: `${(JSON.stringify(backup).length / 1024).toFixed(1)} KB`
    }))
  } catch (error) {
    console.error('バックアップ履歴読み込みエラー:', error)
    backupHistory.value = []
  }
}

const refreshBackups = async () => {
  await loadBackupHistory()
}

// Lifecycle
onMounted(async () => {
  isLoading.value = true
  
  // 各ストアのデータを読み込み
  await Promise.all([
    settingsStore.loadSettings(),
    weightStore.loadRecords(),
    mealStore.loadData(),
    exerciseStore.loadData()
  ])
  
  // バックアップ履歴を読み込み
  await loadBackupHistory()
  
  // 自動バックアップ設定を読み込み
  const settings = settingsStore.userSettings
  autoBackupEnabled.value = settings.dataSync?.autoBackup || false
  backupFrequency.value = settings.dataSync?.backupFrequency || 'weekly'
  keepPeriod.value = settings.dataSync?.keepPeriod || '30'
  
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