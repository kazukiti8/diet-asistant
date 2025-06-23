import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'

export const useMealStore = defineStore('meal', () => {
  // 状態
  const mealRecords = ref([])
  const myMenus = ref([])
  const templates = ref([])
  const isLoading = ref(false)

  // ローカルストレージのキー
  const MEAL_RECORDS_KEY = 'meal_records'
  const MY_MENUS_KEY = 'my_menus'
  const TEMPLATES_KEY = 'meal_templates'

  // ゲッター
  const sortedRecords = computed(() => {
    return [...mealRecords.value].sort((a, b) => 
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
      return total + (record.calories || 0)
    }, 0)
  })

  const todayPFC = computed(() => {
    return todayRecords.value.reduce((total, record) => {
      return {
        protein: total.protein + (record.protein || 0),
        fat: total.fat + (record.fat || 0),
        carbs: total.carbs + (record.carbs || 0)
      }
    }, { protein: 0, fat: 0, carbs: 0 })
  })

  const weeklyCalories = computed(() => {
    return weeklyRecords.value.reduce((total, record) => {
      return total + (record.calories || 0)
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

  const recordsByMealType = computed(() => {
    const types = ['breakfast', 'lunch', 'dinner', 'snack']
    const result = {}
    
    types.forEach(type => {
      result[type] = todayRecords.value.filter(record => record.mealType === type)
    })
    
    return result
  })

  // アクション
  const loadData = async () => {
    try {
      isLoading.value = true
      
      // 食事記録の読み込み
      const storedMeals = localStorage.getItem(MEAL_RECORDS_KEY)
      if (storedMeals) {
        mealRecords.value = JSON.parse(storedMeals)
      }
      
      // マイメニューの読み込み
      const storedMenus = localStorage.getItem(MY_MENUS_KEY)
      if (storedMenus) {
        myMenus.value = JSON.parse(storedMenus)
      }
      
      // テンプレートの読み込み
      const storedTemplates = localStorage.getItem(TEMPLATES_KEY)
      if (storedTemplates) {
        templates.value = JSON.parse(storedTemplates)
      } else {
        // デフォルトテンプレートの設定
        initializeDefaultTemplates()
      }
    } catch (error) {
      console.error('食事データの読み込みエラー:', error)
      mealRecords.value = []
      myMenus.value = []
      templates.value = []
    } finally {
      isLoading.value = false
    }
  }

  const saveData = () => {
    try {
      localStorage.setItem(MEAL_RECORDS_KEY, JSON.stringify(mealRecords.value))
      localStorage.setItem(MY_MENUS_KEY, JSON.stringify(myMenus.value))
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates.value))
    } catch (error) {
      console.error('食事データの保存エラー:', error)
    }
  }

  const addMealRecord = async (mealData) => {
    try {
      const newRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        mealType: mealData.mealType, // breakfast, lunch, dinner, snack
        name: mealData.name,
        calories: parseFloat(mealData.calories) || 0,
        protein: parseFloat(mealData.protein) || 0,
        fat: parseFloat(mealData.fat) || 0,
        carbs: parseFloat(mealData.carbs) || 0,
        fiber: parseFloat(mealData.fiber) || 0,
        sodium: parseFloat(mealData.sodium) || 0,
        notes: mealData.notes || '',
        ingredients: mealData.ingredients || [],
        photo: mealData.photo || null
      }

      mealRecords.value.unshift(newRecord)
      saveData()

      if (window.$notify) {
        window.$notify.success('記録完了', '食事記録を追加しました')
      }

      return { success: true, record: newRecord }
    } catch (error) {
      console.error('食事記録追加エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '食事記録の追加に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const updateMealRecord = async (recordId, updates) => {
    try {
      const index = mealRecords.value.findIndex(record => record.id === recordId)
      if (index === -1) {
        throw new Error('記録が見つかりません')
      }

      mealRecords.value[index] = {
        ...mealRecords.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      saveData()

      if (window.$notify) {
        window.$notify.success('更新完了', '食事記録を更新しました')
      }

      return { success: true }
    } catch (error) {
      console.error('食事記録更新エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '食事記録の更新に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const deleteMealRecord = async (recordId) => {
    try {
      const index = mealRecords.value.findIndex(record => record.id === recordId)
      if (index === -1) {
        throw new Error('記録が見つかりません')
      }

      mealRecords.value.splice(index, 1)
      saveData()

      if (window.$notify) {
        window.$notify.success('削除完了', '食事記録を削除しました')
      }

      return { success: true }
    } catch (error) {
      console.error('食事記録削除エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '食事記録の削除に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const addMyMenu = async (menuData) => {
    try {
      const newMenu = {
        id: Date.now().toString(),
        name: menuData.name,
        calories: parseFloat(menuData.calories) || 0,
        protein: parseFloat(menuData.protein) || 0,
        fat: parseFloat(menuData.fat) || 0,
        carbs: parseFloat(menuData.carbs) || 0,
        fiber: parseFloat(menuData.fiber) || 0,
        sodium: parseFloat(menuData.sodium) || 0,
        ingredients: menuData.ingredients || [],
        notes: menuData.notes || '',
        createdAt: new Date().toISOString()
      }

      myMenus.value.unshift(newMenu)
      saveData()

      if (window.$notify) {
        window.$notify.success('保存完了', 'マイメニューを追加しました')
      }

      return { success: true, menu: newMenu }
    } catch (error) {
      console.error('マイメニュー追加エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', 'マイメニューの追加に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const deleteMyMenu = async (menuId) => {
    try {
      const index = myMenus.value.findIndex(menu => menu.id === menuId)
      if (index === -1) {
        throw new Error('メニューが見つかりません')
      }

      myMenus.value.splice(index, 1)
      saveData()

      if (window.$notify) {
        window.$notify.success('削除完了', 'マイメニューを削除しました')
      }

      return { success: true }
    } catch (error) {
      console.error('マイメニュー削除エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', 'マイメニューの削除に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const getRecordsByDate = (date) => {
    const targetDate = format(new Date(date), 'yyyy-MM-dd')
    return mealRecords.value.filter(record => 
      format(new Date(record.timestamp), 'yyyy-MM-dd') === targetDate
    )
  }

  const getRecordsByDateRange = (startDate, endDate) => {
    return mealRecords.value.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  const calculateCalories = (protein, fat, carbs) => {
    return (protein * 4) + (fat * 9) + (carbs * 4)
  }

  const initializeDefaultTemplates = () => {
    templates.value = [
      {
        id: 'template-1',
        name: '朝食テンプレート',
        mealType: 'breakfast',
        items: [
          { name: 'ご飯', calories: 150, protein: 3, fat: 0, carbs: 33 },
          { name: '味噌汁', calories: 50, protein: 4, fat: 2, carbs: 5 },
          { name: '納豆', calories: 100, protein: 8, fat: 5, carbs: 6 }
        ]
      },
      {
        id: 'template-2',
        name: '昼食テンプレート',
        mealType: 'lunch',
        items: [
          { name: 'サラダ', calories: 80, protein: 3, fat: 4, carbs: 8 },
          { name: '鶏胸肉', calories: 165, protein: 31, fat: 3, carbs: 0 },
          { name: '玄米', calories: 110, protein: 2, fat: 1, carbs: 23 }
        ]
      },
      {
        id: 'template-3',
        name: '夕食テンプレート',
        mealType: 'dinner',
        items: [
          { name: '焼き魚', calories: 200, protein: 25, fat: 10, carbs: 0 },
          { name: '野菜炒め', calories: 120, protein: 4, fat: 8, carbs: 12 },
          { name: 'ご飯', calories: 150, protein: 3, fat: 0, carbs: 33 }
        ]
      }
    ]
    saveData()
  }

  const exportData = () => {
    return {
      mealRecords: mealRecords.value,
      myMenus: myMenus.value,
      templates: templates.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  }

  const importData = async (data) => {
    try {
      if (data.mealRecords && Array.isArray(data.mealRecords)) {
        mealRecords.value = data.mealRecords
      }
      if (data.myMenus && Array.isArray(data.myMenus)) {
        myMenus.value = data.myMenus
      }
      if (data.templates && Array.isArray(data.templates)) {
        templates.value = data.templates
      }
      
      saveData()
      return { success: true }
    } catch (error) {
      console.error('データインポートエラー:', error)
      return { success: false, error: error.message }
    }
  }

  const clearAllData = () => {
    mealRecords.value = []
    myMenus.value = []
    templates.value = []
    localStorage.removeItem(MEAL_RECORDS_KEY)
    localStorage.removeItem(MY_MENUS_KEY)
    localStorage.removeItem(TEMPLATES_KEY)
  }

  return {
    // 状態
    mealRecords,
    myMenus,
    templates,
    isLoading,
    
    // ゲッター
    sortedRecords,
    todayRecords,
    weeklyRecords,
    todayCalories,
    todayPFC,
    weeklyCalories,
    averageDailyCalories,
    recordsByMealType,
    
    // アクション
    loadData,
    saveData,
    addMealRecord,
    updateMealRecord,
    deleteMealRecord,
    addMyMenu,
    deleteMyMenu,
    getRecordsByDate,
    getRecordsByDateRange,
    calculateCalories,
    exportData,
    importData,
    clearAllData
  }
}) 