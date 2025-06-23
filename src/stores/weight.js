import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'

export const useWeightStore = defineStore('weight', () => {
  // 状態
  const weightRecords = ref([])
  const isLoading = ref(false)

  // ローカルストレージのキー
  const STORAGE_KEY = 'weight_records'

  // ゲッター
  const sortedRecords = computed(() => {
    return [...weightRecords.value].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )
  })

  const latestRecord = computed(() => {
    return sortedRecords.value[0] || null
  })

  const weeklyRecords = computed(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { locale: ja })
    const weekEnd = endOfWeek(now, { locale: ja })
    
    return sortedRecords.value.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= weekStart && recordDate <= weekEnd
    })
  })

  const monthlyRecords = computed(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return sortedRecords.value.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= monthStart && recordDate <= monthEnd
    })
  })

  const weightChange = computed(() => {
    if (sortedRecords.value.length < 2) return null
    
    const latest = sortedRecords.value[0]
    const previous = sortedRecords.value[1]
    
    const change = latest.weight - previous.weight
    const changePercent = (change / previous.weight) * 100
    
    return {
      value: change,
      percent: changePercent,
      isPositive: change < 0 // 体重減少がポジティブ
    }
  })

  const averageWeight = computed(() => {
    if (sortedRecords.value.length === 0) return null
    
    const sum = sortedRecords.value.reduce((acc, record) => acc + record.weight, 0)
    return Math.round((sum / sortedRecords.value.length) * 10) / 10
  })

  const weightProgress = computed(() => {
    return sortedRecords.value
  })

  // アクション
  const loadRecords = async () => {
    try {
      isLoading.value = true
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        weightRecords.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('体重記録の読み込みエラー:', error)
      weightRecords.value = []
    } finally {
      isLoading.value = false
    }
  }

  const saveRecords = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weightRecords.value))
    } catch (error) {
      console.error('体重記録の保存エラー:', error)
    }
  }

  const addRecord = async (recordData) => {
    try {
      const newRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        weight: parseFloat(recordData.weight),
        bodyFat: recordData.bodyFat ? parseFloat(recordData.bodyFat) : null,
        waist: recordData.waist ? parseFloat(recordData.waist) : null,
        mood: recordData.mood || null,
        sleep: recordData.sleep ? parseFloat(recordData.sleep) : null,
        condition: recordData.condition || null,
        notes: recordData.notes || '',
        feelsChange: recordData.feelsChange || null
      }

      weightRecords.value.unshift(newRecord)
      saveRecords()

      // 通知
      if (window.$notify) {
        window.$notify.success('記録完了', '体重記録を追加しました')
      }

      return { success: true, record: newRecord }
    } catch (error) {
      console.error('体重記録追加エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '体重記録の追加に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const updateRecord = async (recordId, updates) => {
    try {
      const index = weightRecords.value.findIndex(record => record.id === recordId)
      if (index === -1) {
        throw new Error('記録が見つかりません')
      }

      weightRecords.value[index] = {
        ...weightRecords.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      saveRecords()

      if (window.$notify) {
        window.$notify.success('更新完了', '体重記録を更新しました')
      }

      return { success: true }
    } catch (error) {
      console.error('体重記録更新エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '体重記録の更新に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const deleteRecord = async (recordId) => {
    try {
      const index = weightRecords.value.findIndex(record => record.id === recordId)
      if (index === -1) {
        throw new Error('記録が見つかりません')
      }

      weightRecords.value.splice(index, 1)
      saveRecords()

      if (window.$notify) {
        window.$notify.success('削除完了', '体重記録を削除しました')
      }

      return { success: true }
    } catch (error) {
      console.error('体重記録削除エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '体重記録の削除に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const getRecordByDate = (date) => {
    const targetDate = format(new Date(date), 'yyyy-MM-dd')
    return weightRecords.value.find(record => 
      format(new Date(record.timestamp), 'yyyy-MM-dd') === targetDate
    )
  }

  const getRecordsByDateRange = (startDate, endDate) => {
    return weightRecords.value.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  const exportData = () => {
    return {
      records: weightRecords.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  }

  const importData = async (data) => {
    try {
      if (data.records && Array.isArray(data.records)) {
        weightRecords.value = data.records
        saveRecords()
        return { success: true, count: data.records.length }
      } else {
        throw new Error('無効なデータ形式です')
      }
    } catch (error) {
      console.error('データインポートエラー:', error)
      return { success: false, error: error.message }
    }
  }

  const clearAllData = () => {
    weightRecords.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    // 状態
    weightRecords,
    isLoading,
    
    // ゲッター
    sortedRecords,
    latestRecord,
    weeklyRecords,
    monthlyRecords,
    weightChange,
    averageWeight,
    weightProgress,
    
    // アクション
    loadRecords,
    saveRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordByDate,
    getRecordsByDateRange,
    exportData,
    importData,
    clearAllData
  }
}) 