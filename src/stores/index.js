// 認証ストア
export { useAuthStore } from './auth'

// データ管理ストア
export { useWeightStore } from './weight'
export { useMealStore } from './meal'
export { useExerciseStore } from './exercise'

// 進捗・統計管理ストア
export { useProgressStore } from './progress'

// 設定管理ストア
export { useSettingsStore } from './settings'

// ストアの初期化関数
export const initializeStores = async () => {
  const { useAuthStore } = await import('./auth')
  const { useWeightStore } = await import('./weight')
  const { useMealStore } = await import('./meal')
  const { useExerciseStore } = await import('./exercise')
  const { useProgressStore } = await import('./progress')
  const { useSettingsStore } = await import('./settings')

  const authStore = useAuthStore()
  const weightStore = useWeightStore()
  const mealStore = useMealStore()
  const exerciseStore = useExerciseStore()
  const progressStore = useProgressStore()
  const settingsStore = useSettingsStore()

  // 各ストアのデータを読み込み
  await Promise.all([
    authStore.checkAuth(),
    weightStore.loadRecords(),
    mealStore.loadData(),
    exerciseStore.loadData(),
    progressStore.loadProgressData(),
    settingsStore.loadSettings()
  ])

  return {
    authStore,
    weightStore,
    mealStore,
    exerciseStore,
    progressStore,
    settingsStore
  }
} 