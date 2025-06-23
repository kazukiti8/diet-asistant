import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useWeightStore } from './weight'
import { useMealStore } from './meal'
import { useExerciseStore } from './exercise'

export const useProgressStore = defineStore('progress', () => {
  // 他のストアを参照
  const weightStore = useWeightStore()
  const mealStore = useMealStore()
  const exerciseStore = useExerciseStore()

  // 状態
  const isLoading = ref(false)
  const selectedPeriod = ref('week') // week, month, 3months, 6months, year

  // ゲッター
  const weightProgress = computed(() => {
    const records = weightStore.sortedRecords
    if (records.length === 0) return []

    const periodDays = getPeriodDays()
    const endDate = new Date()
    const startDate = subDays(endDate, periodDays)

    return records
      .filter(record => {
        const recordDate = new Date(record.timestamp)
        return recordDate >= startDate && recordDate <= endDate
      })
      .map(record => ({
        date: format(new Date(record.timestamp), 'yyyy-MM-dd'),
        weight: record.weight,
        bodyFat: record.bodyFat,
        waist: record.waist
      }))
      .reverse()
  })

  const calorieBalance = computed(() => {
    const mealRecords = mealStore.sortedRecords
    const exerciseRecords = exerciseStore.sortedRecords
    
    if (mealRecords.length === 0 && exerciseRecords.length === 0) return []

    const periodDays = getPeriodDays()
    const endDate = new Date()
    const startDate = subDays(endDate, periodDays)

    // 日付ごとのデータを集計
    const dailyData = {}
    
    // 食事記録の集計
    mealRecords.forEach(record => {
      const date = format(new Date(record.timestamp), 'yyyy-MM-dd')
      const recordDate = new Date(record.timestamp)
      
      if (recordDate >= startDate && recordDate <= endDate) {
        if (!dailyData[date]) {
          dailyData[date] = { intake: 0, burned: 0, balance: 0 }
        }
        dailyData[date].intake += record.calories || 0
      }
    })

    // 運動記録の集計
    exerciseRecords.forEach(record => {
      const date = format(new Date(record.timestamp), 'yyyy-MM-dd')
      const recordDate = new Date(record.timestamp)
      
      if (recordDate >= startDate && recordDate <= endDate) {
        if (!dailyData[date]) {
          dailyData[date] = { intake: 0, burned: 0, balance: 0 }
        }
        dailyData[date].burned += record.caloriesBurned || 0
      }
    })

    // バランス計算
    Object.keys(dailyData).forEach(date => {
      dailyData[date].balance = dailyData[date].intake - dailyData[date].burned
    })

    return Object.keys(dailyData)
      .sort()
      .map(date => ({
        date,
        intake: dailyData[date].intake,
        burned: dailyData[date].burned,
        balance: dailyData[date].balance
      }))
  })

  const pfcProgress = computed(() => {
    const records = mealStore.sortedRecords
    if (records.length === 0) return []

    const periodDays = getPeriodDays()
    const endDate = new Date()
    const startDate = subDays(endDate, periodDays)

    // 日付ごとのPFCデータを集計
    const dailyPFC = {}
    
    records.forEach(record => {
      const date = format(new Date(record.timestamp), 'yyyy-MM-dd')
      const recordDate = new Date(record.timestamp)
      
      if (recordDate >= startDate && recordDate <= endDate) {
        if (!dailyPFC[date]) {
          dailyPFC[date] = { protein: 0, fat: 0, carbs: 0 }
        }
        dailyPFC[date].protein += record.protein || 0
        dailyPFC[date].fat += record.fat || 0
        dailyPFC[date].carbs += record.carbs || 0
      }
    })

    return Object.keys(dailyPFC)
      .sort()
      .map(date => ({
        date,
        protein: dailyPFC[date].protein,
        fat: dailyPFC[date].fat,
        carbs: dailyPFC[date].carbs
      }))
  })

  const exerciseProgress = computed(() => {
    const records = exerciseStore.sortedRecords
    if (records.length === 0) return []

    const periodDays = getPeriodDays()
    const endDate = new Date()
    const startDate = subDays(endDate, periodDays)

    // 日付ごとの運動データを集計
    const dailyExercise = {}
    
    records.forEach(record => {
      const date = format(new Date(record.timestamp), 'yyyy-MM-dd')
      const recordDate = new Date(record.timestamp)
      
      if (recordDate >= startDate && recordDate <= endDate) {
        if (!dailyExercise[date]) {
          dailyExercise[date] = { duration: 0, calories: 0, count: 0 }
        }
        dailyExercise[date].duration += record.duration || 0
        dailyExercise[date].calories += record.caloriesBurned || 0
        dailyExercise[date].count += 1
      }
    })

    return Object.keys(dailyExercise)
      .sort()
      .map(date => ({
        date,
        duration: dailyExercise[date].duration,
        calories: dailyExercise[date].calories,
        count: dailyExercise[date].count
      }))
  })

  const weeklyGoals = computed(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { locale: ja })
    const weekEnd = endOfWeek(now, { locale: ja })

    // 体重記録の週間目標
    const weightRecords = weightStore.weeklyRecords
    const weightGoal = {
      current: weightRecords.length,
      target: 3, // 週3回記録
      progress: Math.min((weightRecords.length / 3) * 100, 100)
    }

    // 運動記録の週間目標
    const exerciseRecords = exerciseStore.weeklyRecords
    const exerciseGoal = {
      current: exerciseRecords.length,
      target: 2, // 週2回運動
      progress: Math.min((exerciseRecords.length / 2) * 100, 100)
    }

    return {
      weight: weightGoal,
      exercise: exerciseGoal
    }
  })

  const summaryStats = computed(() => {
    const weightChange = weightStore.weightChange
    const todayCalories = mealStore.todayCalories
    const todayExercise = exerciseStore.todayCalories
    const averageWeight = weightStore.averageWeight

    return {
      weightChange: weightChange ? {
        value: weightChange.value,
        percent: weightChange.percent,
        isPositive: weightChange.isPositive
      } : null,
      todayCalories,
      todayExercise,
      averageWeight,
      calorieBalance: todayCalories - todayExercise
    }
  })

  const achievementRate = computed(() => {
    const weightGoal = weeklyGoals.value.weight
    const exerciseGoal = weeklyGoals.value.exercise
    
    const totalProgress = (weightGoal.progress + exerciseGoal.progress) / 2
    return Math.round(totalProgress)
  })

  const streakData = computed(() => {
    const weightRecords = weightStore.sortedRecords
    const exerciseRecords = exerciseStore.sortedRecords
    
    let weightStreak = 0
    let exerciseStreak = 0
    
    // 体重記録の連続日数を計算
    if (weightRecords.length > 0) {
      let currentStreak = 0
      let currentDate = new Date()
      
      for (let i = 0; i < 30; i++) { // 最大30日分チェック
        const checkDate = format(subDays(currentDate, i), 'yyyy-MM-dd')
        const hasRecord = weightRecords.some(record => 
          format(new Date(record.timestamp), 'yyyy-MM-dd') === checkDate
        )
        
        if (hasRecord) {
          currentStreak++
        } else {
          break
        }
      }
      weightStreak = currentStreak
    }
    
    // 運動記録の連続日数を計算
    if (exerciseRecords.length > 0) {
      let currentStreak = 0
      let currentDate = new Date()
      
      for (let i = 0; i < 30; i++) {
        const checkDate = format(subDays(currentDate, i), 'yyyy-MM-dd')
        const hasRecord = exerciseRecords.some(record => 
          format(new Date(record.timestamp), 'yyyy-MM-dd') === checkDate
        )
        
        if (hasRecord) {
          currentStreak++
        } else {
          break
        }
      }
      exerciseStreak = currentStreak
    }
    
    return {
      weight: weightStreak,
      exercise: exerciseStreak,
      max: Math.max(weightStreak, exerciseStreak)
    }
  })

  // アクション
  const loadProgressData = async () => {
    try {
      isLoading.value = true
      
      // 各ストアのデータを読み込み
      await Promise.all([
        weightStore.loadRecords(),
        mealStore.loadData(),
        exerciseStore.loadData()
      ])
    } catch (error) {
      console.error('進捗データの読み込みエラー:', error)
    } finally {
      isLoading.value = false
    }
  }

  const setPeriod = (period) => {
    selectedPeriod.value = period
  }

  const getPeriodDays = () => {
    switch (selectedPeriod.value) {
      case 'week':
        return 7
      case 'month':
        return 30
      case '3months':
        return 90
      case '6months':
        return 180
      case 'year':
        return 365
      default:
        return 7
    }
  }

  const getChartData = (chartType) => {
    switch (chartType) {
      case 'weight':
        return weightProgress.value
      case 'calories':
        return calorieBalance.value
      case 'pfc':
        return pfcProgress.value
      case 'exercise':
        return exerciseProgress.value
      default:
        return []
    }
  }

  const getChartOptions = (chartType) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: getChartTitle(chartType)
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MM/dd'
            }
          },
          title: {
            display: true,
            text: '日付'
          }
        },
        y: {
          title: {
            display: true,
            text: getYAxisLabel(chartType)
          }
        }
      }
    }

    return baseOptions
  }

  const getChartTitle = (chartType) => {
    switch (chartType) {
      case 'weight':
        return '体重推移'
      case 'calories':
        return 'カロリーバランス'
      case 'pfc':
        return 'PFCバランス'
      case 'exercise':
        return '運動記録'
      default:
        return ''
    }
  }

  const getYAxisLabel = (chartType) => {
    switch (chartType) {
      case 'weight':
        return '体重 (kg)'
      case 'calories':
        return 'カロリー (kcal)'
      case 'pfc':
        return 'グラム (g)'
      case 'exercise':
        return '時間 (分) / カロリー (kcal)'
      default:
        return ''
    }
  }

  const exportProgressData = () => {
    return {
      weightProgress: weightProgress.value,
      calorieBalance: calorieBalance.value,
      pfcProgress: pfcProgress.value,
      exerciseProgress: exerciseProgress.value,
      weeklyGoals: weeklyGoals.value,
      summaryStats: summaryStats.value,
      streakData: streakData.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  }

  return {
    // 状態
    isLoading,
    selectedPeriod,
    
    // ゲッター
    weightProgress,
    calorieBalance,
    pfcProgress,
    exerciseProgress,
    weeklyGoals,
    summaryStats,
    achievementRate,
    streakData,
    
    // アクション
    loadProgressData,
    setPeriod,
    getPeriodDays,
    getChartData,
    getChartOptions,
    exportProgressData
  }
}) 