import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'

export const useExerciseStore = defineStore('exercise', () => {
  // 状態
  const exerciseRecords = ref([])
  const favoriteMenus = ref([])
  const exerciseMenus = ref([])
  const isLoading = ref(false)

  // ローカルストレージのキー
  const EXERCISE_RECORDS_KEY = 'exercise_records'
  const FAVORITE_MENUS_KEY = 'favorite_menus'
  const EXERCISE_MENUS_KEY = 'exercise_menus'

  // ゲッター
  const sortedRecords = computed(() => {
    return [...exerciseRecords.value].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )
  })

  const todayRecords = computed(() => {
    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)
    
    return sortedRecords.value.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= start && recordDate <= end
    })
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

  const todayCalories = computed(() => {
    return todayRecords.value.reduce((total, record) => {
      return total + (record.caloriesBurned || 0)
    }, 0)
  })

  const todayDuration = computed(() => {
    return todayRecords.value.reduce((total, record) => {
      return total + (record.duration || 0)
    }, 0)
  })

  const weeklyCalories = computed(() => {
    return weeklyRecords.value.reduce((total, record) => {
      return total + (record.caloriesBurned || 0)
    }, 0)
  })

  const weeklyDuration = computed(() => {
    return weeklyRecords.value.reduce((total, record) => {
      return total + (record.duration || 0)
    }, 0)
  })

  const averageDailyCalories = computed(() => {
    if (weeklyRecords.value.length === 0) return 0
    
    const uniqueDays = new Set(
      weeklyRecords.value.map(record => 
        format(new Date(record.timestamp), 'yyyy-MM-dd')
      )
    ).size
    
    return Math.round(weeklyCalories.value / uniqueDays)
  })

  const recordsByType = computed(() => {
    const types = ['cardio', 'strength', 'flexibility', 'sports']
    const result = {}
    
    types.forEach(type => {
      result[type] = todayRecords.value.filter(record => record.exerciseType === type)
    })
    
    return result
  })

  // アクション
  const loadData = async () => {
    try {
      isLoading.value = true
      
      // 運動記録の読み込み
      const storedRecords = localStorage.getItem(EXERCISE_RECORDS_KEY)
      if (storedRecords) {
        exerciseRecords.value = JSON.parse(storedRecords)
      }
      
      // お気に入りメニューの読み込み
      const storedFavorites = localStorage.getItem(FAVORITE_MENUS_KEY)
      if (storedFavorites) {
        favoriteMenus.value = JSON.parse(storedFavorites)
      }
      
      // 運動メニューの読み込み
      const storedMenus = localStorage.getItem(EXERCISE_MENUS_KEY)
      if (storedMenus) {
        exerciseMenus.value = JSON.parse(storedMenus)
      } else {
        // デフォルト運動メニューの設定
        initializeDefaultMenus()
      }
    } catch (error) {
      console.error('運動データの読み込みエラー:', error)
      exerciseRecords.value = []
      favoriteMenus.value = []
      exerciseMenus.value = []
    } finally {
      isLoading.value = false
    }
  }

  const saveData = () => {
    try {
      localStorage.setItem(EXERCISE_RECORDS_KEY, JSON.stringify(exerciseRecords.value))
      localStorage.setItem(FAVORITE_MENUS_KEY, JSON.stringify(favoriteMenus.value))
      localStorage.setItem(EXERCISE_MENUS_KEY, JSON.stringify(exerciseMenus.value))
    } catch (error) {
      console.error('運動データの保存エラー:', error)
    }
  }

  const addExerciseRecord = async (exerciseData) => {
    try {
      const newRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        exerciseType: exerciseData.exerciseType, // cardio, strength, flexibility, sports
        name: exerciseData.name,
        duration: parseFloat(exerciseData.duration) || 0, // 分単位
        caloriesBurned: parseFloat(exerciseData.caloriesBurned) || 0,
        intensity: exerciseData.intensity || 'medium', // low, medium, high
        sets: exerciseData.sets || null,
        reps: exerciseData.reps || null,
        weight: exerciseData.weight || null,
        distance: exerciseData.distance || null,
        notes: exerciseData.notes || '',
        menuId: exerciseData.menuId || null
      }

      exerciseRecords.value.unshift(newRecord)
      saveData()

      if (window.$notify) {
        window.$notify.success('記録完了', '運動記録を追加しました')
      }

      return { success: true, record: newRecord }
    } catch (error) {
      console.error('運動記録追加エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '運動記録の追加に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const updateExerciseRecord = async (recordId, updates) => {
    try {
      const index = exerciseRecords.value.findIndex(record => record.id === recordId)
      if (index === -1) {
        throw new Error('記録が見つかりません')
      }

      exerciseRecords.value[index] = {
        ...exerciseRecords.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      saveData()

      if (window.$notify) {
        window.$notify.success('更新完了', '運動記録を更新しました')
      }

      return { success: true }
    } catch (error) {
      console.error('運動記録更新エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '運動記録の更新に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const deleteExerciseRecord = async (recordId) => {
    try {
      const index = exerciseRecords.value.findIndex(record => record.id === recordId)
      if (index === -1) {
        throw new Error('記録が見つかりません')
      }

      exerciseRecords.value.splice(index, 1)
      saveData()

      if (window.$notify) {
        window.$notify.success('削除完了', '運動記録を削除しました')
      }

      return { success: true }
    } catch (error) {
      console.error('運動記録削除エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '運動記録の削除に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const addFavoriteMenu = async (menuData) => {
    try {
      const newFavorite = {
        id: Date.now().toString(),
        name: menuData.name,
        exerciseType: menuData.exerciseType,
        duration: parseFloat(menuData.duration) || 0,
        caloriesBurned: parseFloat(menuData.caloriesBurned) || 0,
        intensity: menuData.intensity || 'medium',
        exercises: menuData.exercises || [],
        notes: menuData.notes || '',
        createdAt: new Date().toISOString()
      }

      favoriteMenus.value.unshift(newFavorite)
      saveData()

      if (window.$notify) {
        window.$notify.success('保存完了', 'お気に入りに追加しました')
      }

      return { success: true, menu: newFavorite }
    } catch (error) {
      console.error('お気に入り追加エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', 'お気に入りの追加に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const removeFavoriteMenu = async (menuId) => {
    try {
      const index = favoriteMenus.value.findIndex(menu => menu.id === menuId)
      if (index === -1) {
        throw new Error('メニューが見つかりません')
      }

      favoriteMenus.value.splice(index, 1)
      saveData()

      if (window.$notify) {
        window.$notify.success('削除完了', 'お気に入りから削除しました')
      }

      return { success: true }
    } catch (error) {
      console.error('お気に入り削除エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', 'お気に入りの削除に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const getExerciseMenus = (filters = {}) => {
    let menus = [...exerciseMenus.value]

    if (filters.exerciseType) {
      menus = menus.filter(menu => menu.exerciseType === filters.exerciseType)
    }

    if (filters.intensity) {
      menus = menus.filter(menu => menu.intensity === filters.intensity)
    }

    if (filters.maxDuration) {
      menus = menus.filter(menu => menu.duration <= filters.maxDuration)
    }

    if (filters.targetMuscles && filters.targetMuscles.length > 0) {
      menus = menus.filter(menu => 
        menu.targetMuscles && 
        filters.targetMuscles.some(muscle => menu.targetMuscles.includes(muscle))
      )
    }

    return menus
  }

  const getRecordsByDate = (date) => {
    const targetDate = format(new Date(date), 'yyyy-MM-dd')
    return exerciseRecords.value.filter(record => 
      format(new Date(record.timestamp), 'yyyy-MM-dd') === targetDate
    )
  }

  const getRecordsByDateRange = (startDate, endDate) => {
    return exerciseRecords.value.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  const calculateCaloriesBurned = (exerciseType, duration, intensity, weight = 60) => {
    // 簡易的なカロリー計算（METsベース）
    const mets = {
      cardio: { low: 3, medium: 6, high: 9 },
      strength: { low: 2, medium: 4, high: 6 },
      flexibility: { low: 1, medium: 2, high: 3 },
      sports: { low: 4, medium: 7, high: 10 }
    }

    const met = mets[exerciseType]?.[intensity] || 3
    const hours = duration / 60
    const calories = met * weight * hours

    return Math.round(calories)
  }

  const initializeDefaultMenus = () => {
    exerciseMenus.value = [
      {
        id: 'menu-1',
        name: '初心者向け全身運動',
        exerciseType: 'strength',
        intensity: 'low',
        duration: 20,
        caloriesBurned: 120,
        targetMuscles: ['全身'],
        exercises: [
          { name: 'スクワット', sets: 3, reps: 10, rest: 60 },
          { name: 'プッシュアップ', sets: 3, reps: 5, rest: 60 },
          { name: 'プランク', sets: 3, duration: 30, rest: 60 }
        ],
        notes: '初心者でも安全にできる全身運動メニューです。'
      },
      {
        id: 'menu-2',
        name: '脂肪燃焼カーディオ',
        exerciseType: 'cardio',
        intensity: 'medium',
        duration: 30,
        caloriesBurned: 250,
        targetMuscles: ['下半身', '心肺機能'],
        exercises: [
          { name: 'ジョギング（その場）', duration: 10, rest: 30 },
          { name: 'ジャンピングジャック', duration: 5, rest: 30 },
          { name: 'マウンテンクライマー', duration: 5, rest: 30 },
          { name: 'バーピー', duration: 5, rest: 30 },
          { name: 'ジョギング（その場）', duration: 5, rest: 0 }
        ],
        notes: '脂肪燃焼に効果的なカーディオメニューです。'
      },
      {
        id: 'menu-3',
        name: 'ストレッチ＆柔軟性向上',
        exerciseType: 'flexibility',
        intensity: 'low',
        duration: 15,
        caloriesBurned: 50,
        targetMuscles: ['全身'],
        exercises: [
          { name: '猫のポーズ', duration: 30, rest: 10 },
          { name: 'コブラのポーズ', duration: 30, rest: 10 },
          { name: '前屈', duration: 30, rest: 10 },
          { name: '股関節ストレッチ', duration: 30, rest: 10 },
          { name: '肩回し', duration: 30, rest: 0 }
        ],
        notes: '体の柔軟性を向上させるストレッチメニューです。'
      }
    ]
    saveData()
  }

  const exportData = () => {
    return {
      exerciseRecords: exerciseRecords.value,
      favoriteMenus: favoriteMenus.value,
      exerciseMenus: exerciseMenus.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  }

  const importData = async (data) => {
    try {
      if (data.exerciseRecords && Array.isArray(data.exerciseRecords)) {
        exerciseRecords.value = data.exerciseRecords
      }
      if (data.favoriteMenus && Array.isArray(data.favoriteMenus)) {
        favoriteMenus.value = data.favoriteMenus
      }
      if (data.exerciseMenus && Array.isArray(data.exerciseMenus)) {
        exerciseMenus.value = data.exerciseMenus
      }
      
      saveData()
      return { success: true }
    } catch (error) {
      console.error('データインポートエラー:', error)
      return { success: false, error: error.message }
    }
  }

  const clearAllData = () => {
    try {
      console.log('exercise.js: clearAllData開始')
      exerciseRecords.value = []
      favoriteMenus.value = []
      exerciseMenus.value = []
      localStorage.removeItem(EXERCISE_RECORDS_KEY)
      localStorage.removeItem(FAVORITE_MENUS_KEY)
      localStorage.removeItem(EXERCISE_MENUS_KEY)
      console.log('exercise.js: clearAllData完了')
    } catch (error) {
      console.error('exercise.js: clearAllDataエラー:', error)
      throw error
    }
  }

  return {
    // 状態
    exerciseRecords,
    favoriteMenus,
    exerciseMenus,
    isLoading,
    
    // ゲッター
    sortedRecords,
    todayRecords,
    weeklyRecords,
    todayCalories,
    todayDuration,
    weeklyCalories,
    weeklyDuration,
    averageDailyCalories,
    recordsByType,
    
    // アクション
    loadData,
    saveData,
    addExerciseRecord,
    updateExerciseRecord,
    deleteExerciseRecord,
    addFavoriteMenu,
    removeFavoriteMenu,
    getExerciseMenus,
    getRecordsByDate,
    getRecordsByDateRange,
    calculateCaloriesBurned,
    exportData,
    importData,
    clearAllData
  }
}) 