import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 状態
  const userSettings = ref({
    // 基本設定
    nickname: '',
    age: null,
    gender: null,
    height: null,
    activityLevel: 'moderate', // sedentary, light, moderate, active, very_active
    
    // 目標設定
    targetWeight: null,
    targetDate: null,
    weeklyWeightLoss: 0.5, // kg/week
    dailyCalorieGoal: 2000,
    
    // PFC目標
    pfcGoals: {
      protein: 80, // g
      fat: 65, // g
      carbs: 250 // g
    },
    
    // 通知設定
    notifications: {
      weight: true,
      meal: true,
      exercise: true,
      reminder: true,
      achievement: true
    },
    
    // リマインダー設定
    reminders: {
      weight: { enabled: true, time: '08:00', frequency: 'daily' },
      meal: { enabled: true, time: '12:00', frequency: 'daily' },
      exercise: { enabled: true, time: '18:00', frequency: 'daily' }
    },
    
    // 応援キャラクター設定
    cheerCharacter: {
      type: 'friendly', // friendly, strict, cute, cool
      frequency: 'normal', // low, normal, high
      customMessages: []
    },
    
    // データ同期設定
    dataSync: {
      enabled: false,
      autoBackup: true,
      backupFrequency: 'weekly' // daily, weekly, monthly
    },
    
    // 表示設定
    display: {
      theme: 'light', // light, dark, auto
      language: 'ja',
      units: 'metric' // metric, imperial
    }
  })

  const isLoading = ref(false)

  // ローカルストレージのキー
  const SETTINGS_KEY = 'user_settings'

  // ゲッター
  const isConfigured = computed(() => {
    return userSettings.value.nickname && 
           userSettings.value.age && 
           userSettings.value.gender && 
           userSettings.value.height
  })

  const bmr = computed(() => {
    const { age, gender, height, weight } = userSettings.value
    const currentWeight = weight || 60 // デフォルト値
    
    if (!age || !gender || !height) return 0
    
    // ハリス・ベネディクト方程式
    if (gender === 'male') {
      return Math.round(88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * age))
    } else {
      return Math.round(447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * age))
    }
  })

  const tdee = computed(() => {
    const activityMultipliers = {
      sedentary: 1.2,      // 座り仕事中心
      light: 1.375,        // 軽い運動（週1-3回）
      moderate: 1.55,      // 中程度の運動（週3-5回）
      active: 1.725,       // 活発な運動（週6-7回）
      very_active: 1.9     // 非常に活発な運動（毎日2回以上）
    }
    
    const multiplier = activityMultipliers[userSettings.value.activityLevel] || 1.55
    return Math.round(bmr.value * multiplier)
  })

  const recommendedCalorieGoal = computed(() => {
    const tdeeValue = tdee.value
    const weeklyLoss = userSettings.value.weeklyWeightLoss
    
    // 1kgの脂肪 = 約7700kcal
    const dailyDeficit = (weeklyLoss * 7700) / 7
    
    return Math.round(tdeeValue - dailyDeficit)
  })

  const recommendedPfcGoals = computed(() => {
    const calories = recommendedCalorieGoal.value
    
    return {
      protein: Math.round((calories * 0.25) / 4), // 25%をタンパク質
      fat: Math.round((calories * 0.25) / 9),     // 25%を脂質
      carbs: Math.round((calories * 0.5) / 4)     // 50%を炭水化物
    }
  })

  const targetDateProgress = computed(() => {
    if (!userSettings.value.targetDate || !userSettings.value.targetWeight) {
      return null
    }
    
    const targetDate = new Date(userSettings.value.targetDate)
    const today = new Date()
    const totalDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))
    
    if (totalDays <= 0) return 100
    
    // 進捗計算（簡易版）
    return Math.max(0, Math.min(100, ((365 - totalDays) / 365) * 100))
  })

  // PFC目標とカロリー目標のゲッター
  const calorieGoal = computed(() => userSettings.value.dailyCalorieGoal)
  const proteinGoal = computed(() => userSettings.value.pfcGoals.protein)
  const fatGoal = computed(() => userSettings.value.pfcGoals.fat)
  const carbsGoal = computed(() => userSettings.value.pfcGoals.carbs)

  // アクション
  const loadSettings = async () => {
    try {
      isLoading.value = true
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        userSettings.value = { ...userSettings.value, ...parsed }
      }
    } catch (error) {
      console.error('設定の読み込みエラー:', error)
    } finally {
      isLoading.value = false
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(userSettings.value))
    } catch (error) {
      console.error('設定の保存エラー:', error)
    }
  }

  const updateSettings = async (updates) => {
    try {
      userSettings.value = { ...userSettings.value, ...updates }
      saveSettings()

      if (window.$notify) {
        window.$notify.success('保存完了', '設定を更新しました')
      }

      return { success: true }
    } catch (error) {
      console.error('設定更新エラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '設定の更新に失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const updates = {
        nickname: profileData.nickname,
        age: parseInt(profileData.age),
        gender: profileData.gender,
        height: parseFloat(profileData.height),
        activityLevel: profileData.activityLevel
      }

      await updateSettings(updates)
      return { success: true }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const updateGoals = async (goalData) => {
    try {
      const updates = {
        targetWeight: parseFloat(goalData.targetWeight),
        targetDate: goalData.targetDate,
        weeklyWeightLoss: parseFloat(goalData.weeklyWeightLoss),
        dailyCalorieGoal: parseInt(goalData.dailyCalorieGoal),
        pfcGoals: {
          protein: parseInt(goalData.protein),
          fat: parseInt(goalData.fat),
          carbs: parseInt(goalData.carbs)
        }
      }

      await updateSettings(updates)
      return { success: true }
    } catch (error) {
      console.error('目標更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  // 目標設定画面専用メソッド
  const setGoals = async (goals) => {
    try {
      const updates = {
        age: goals.age,
        gender: goals.gender,
        height: goals.height,
        activityLevel: goals.activityLevel,
        targetWeight: parseFloat(goals.targetWeight),
        dailyCalorieGoal: parseInt(goals.targetCalories),
        pfcGoals: {
          protein: Math.round((goals.targetCalories * goals.proteinRatio / 100) / 4),
          fat: Math.round((goals.targetCalories * goals.fatRatio / 100) / 9),
          carbs: Math.round((goals.targetCalories * goals.carbsRatio / 100) / 4)
        },
        // 追加の目標情報
        goalPeriod: goals.goalPeriod,
        exerciseFrequency: goals.exerciseFrequency,
        exerciseDuration: goals.exerciseDuration,
        exerciseTypes: goals.exerciseTypes,
        purposes: goals.purposes,
        currentWeight: goals.currentWeight,
        createdAt: goals.createdAt,
        updatedAt: goals.updatedAt
      }

      await updateSettings(updates)
      return { success: true }
    } catch (error) {
      console.error('目標設定エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const getGoals = async () => {
    try {
      const goals = {
        age: userSettings.value.age,
        gender: userSettings.value.gender,
        height: userSettings.value.height,
        activityLevel: userSettings.value.activityLevel,
        targetWeight: userSettings.value.targetWeight,
        targetCalories: userSettings.value.dailyCalorieGoal,
        proteinRatio: userSettings.value.pfcGoals ? Math.round((userSettings.value.pfcGoals.protein * 4 / userSettings.value.dailyCalorieGoal) * 100) : 20,
        fatRatio: userSettings.value.pfcGoals ? Math.round((userSettings.value.pfcGoals.fat * 9 / userSettings.value.dailyCalorieGoal) * 100) : 25,
        carbsRatio: userSettings.value.pfcGoals ? Math.round((userSettings.value.pfcGoals.carbs * 4 / userSettings.value.dailyCalorieGoal) * 100) : 55,
        goalPeriod: userSettings.value.goalPeriod,
        exerciseFrequency: userSettings.value.exerciseFrequency,
        exerciseDuration: userSettings.value.exerciseDuration,
        exerciseTypes: userSettings.value.exerciseTypes || [],
        purposes: userSettings.value.purposes || [],
        currentWeight: userSettings.value.currentWeight,
        createdAt: userSettings.value.createdAt,
        updatedAt: userSettings.value.updatedAt
      }
      
      // 目標が設定されているかチェック
      return goals.targetWeight && goals.targetCalories ? goals : null
    } catch (error) {
      console.error('目標取得エラー:', error)
      return null
    }
  }

  const updateNotifications = async (notificationSettings) => {
    try {
      const updates = {
        notifications: { ...userSettings.value.notifications, ...notificationSettings }
      }

      await updateSettings(updates)
      return { success: true }
    } catch (error) {
      console.error('通知設定更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const updateReminders = async (reminderSettings) => {
    try {
      const updates = {
        reminders: { ...userSettings.value.reminders, ...reminderSettings }
      }

      await updateSettings(updates)
      return { success: true }
    } catch (error) {
      console.error('リマインダー設定更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const updateCheerCharacter = async (characterSettings) => {
    try {
      const updates = {
        cheerCharacter: { ...userSettings.value.cheerCharacter, ...characterSettings }
      }

      await updateSettings(updates)
      return { success: true }
    } catch (error) {
      console.error('応援キャラクター設定更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const addCustomMessage = async (message) => {
    try {
      const customMessages = [...userSettings.value.cheerCharacter.customMessages, message]
      const updates = {
        cheerCharacter: {
          ...userSettings.value.cheerCharacter,
          customMessages
        }
      }

      await updateSettings(updates)
      return { success: true }
    } catch (error) {
      console.error('カスタムメッセージ追加エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const removeCustomMessage = async (index) => {
    try {
      const customMessages = userSettings.value.cheerCharacter.customMessages.filter((_, i) => i !== index)
      const updates = {
        cheerCharacter: {
          ...userSettings.value.cheerCharacter,
          customMessages
        }
      }

      await updateSettings(updates)
      return { success: true }
    } catch (error) {
      console.error('カスタムメッセージ削除エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const updateDisplaySettings = async (displaySettings) => {
    try {
      const updates = {
        display: { ...userSettings.value.display, ...displaySettings }
      }

      await updateSettings(updates)
      return { success: true }
    } catch (error) {
      console.error('表示設定更新エラー:', error)
      return { success: false, error: error.message }
    }
  }

  const resetToDefaults = async () => {
    try {
      const defaultSettings = {
        nickname: '',
        age: null,
        gender: null,
        height: null,
        activityLevel: 'moderate',
        targetWeight: null,
        targetDate: null,
        weeklyWeightLoss: 0.5,
        dailyCalorieGoal: 2000,
        pfcGoals: {
          protein: 80,
          fat: 65,
          carbs: 250
        },
        notifications: {
          weight: true,
          meal: true,
          exercise: true,
          reminder: true,
          achievement: true
        },
        reminders: {
          weight: { enabled: true, time: '08:00', frequency: 'daily' },
          meal: { enabled: true, time: '12:00', frequency: 'daily' },
          exercise: { enabled: true, time: '18:00', frequency: 'daily' }
        },
        cheerCharacter: {
          type: 'friendly',
          frequency: 'normal',
          customMessages: []
        },
        dataSync: {
          enabled: false,
          autoBackup: true,
          backupFrequency: 'weekly'
        },
        display: {
          theme: 'light',
          language: 'ja',
          units: 'metric'
        }
      }

      userSettings.value = defaultSettings
      saveSettings()

      if (window.$notify) {
        window.$notify.success('リセット完了', '設定をデフォルトに戻しました')
      }

      return { success: true }
    } catch (error) {
      console.error('設定リセットエラー:', error)
      if (window.$notify) {
        window.$notify.error('エラー', '設定のリセットに失敗しました')
      }
      return { success: false, error: error.message }
    }
  }

  const exportSettings = () => {
    return {
      settings: userSettings.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  }

  const importSettings = async (data) => {
    try {
      if (data.settings) {
        userSettings.value = { ...userSettings.value, ...data.settings }
        saveSettings()
        return { success: true }
      } else {
        throw new Error('無効なデータ形式です')
      }
    } catch (error) {
      console.error('設定インポートエラー:', error)
      return { success: false, error: error.message }
    }
  }

  const clearAllSettings = () => {
    userSettings.value = {
      nickname: '',
      age: null,
      gender: null,
      height: null,
      activityLevel: 'moderate',
      targetWeight: null,
      targetDate: null,
      weeklyWeightLoss: 0.5,
      dailyCalorieGoal: 2000,
      pfcGoals: { protein: 80, fat: 65, carbs: 250 },
      notifications: { weight: true, meal: true, exercise: true, reminder: true, achievement: true },
      reminders: {
        weight: { enabled: true, time: '08:00', frequency: 'daily' },
        meal: { enabled: true, time: '12:00', frequency: 'daily' },
        exercise: { enabled: true, time: '18:00', frequency: 'daily' }
      },
      cheerCharacter: { type: 'friendly', frequency: 'normal', customMessages: [] },
      dataSync: { enabled: false, autoBackup: true, backupFrequency: 'weekly' },
      display: { theme: 'light', language: 'ja', units: 'metric' }
    }
    localStorage.removeItem(SETTINGS_KEY)
  }

  return {
    // 状態
    userSettings,
    isLoading,
    
    // ゲッター
    isConfigured,
    bmr,
    tdee,
    recommendedCalorieGoal,
    recommendedPfcGoals,
    targetDateProgress,
    calorieGoal,
    proteinGoal,
    fatGoal,
    carbsGoal,
    
    // アクション
    loadSettings,
    saveSettings,
    updateSettings,
    updateProfile,
    updateGoals,
    setGoals,
    getGoals,
    updateNotifications,
    updateReminders,
    updateCheerCharacter,
    addCustomMessage,
    removeCustomMessage,
    updateDisplaySettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    clearAllSettings
  }
}) 