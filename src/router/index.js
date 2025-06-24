import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ビューコンポーネントのインポート
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import HomeView from '@/views/HomeView.vue'
import RecordsView from '@/views/RecordsView.vue'
import WeightRecordView from '@/views/WeightRecordView.vue'
import MealRecordView from '@/views/MealRecordView.vue'
import ExerciseRecordView from '@/views/ExerciseRecordView.vue'
import ExerciseMenuView from '@/views/ExerciseMenuView.vue'
import ProgressView from '@/views/ProgressView.vue'
import AdviceView from '@/views/AdviceView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ProfileEditView from '@/views/ProfileEditView.vue'
import GoalSettingView from '@/views/GoalSettingView.vue'
import ReminderSettingView from '@/views/ReminderSettingView.vue'
import NotificationSettingView from '@/views/NotificationSettingView.vue'
import DataBackupView from '@/views/DataBackupView.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: OnboardingView,
    meta: { requiresAuth: true, requiresOnboarding: true }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/records',
    name: 'records',
    component: RecordsView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/weight-record',
    name: 'weight-record',
    component: WeightRecordView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/meal-record',
    name: 'meal-record',
    component: MealRecordView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/exercise-record',
    name: 'exercise-record',
    component: ExerciseRecordView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/exercise-menu',
    name: 'exercise-menu',
    component: ExerciseMenuView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/progress',
    name: 'progress',
    component: ProgressView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/advice',
    name: 'advice',
    component: AdviceView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/profile-edit',
    name: 'profile-edit',
    component: ProfileEditView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/goal-setting',
    name: 'goal-setting',
    component: GoalSettingView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/reminder-setting',
    name: 'reminder-setting',
    component: ReminderSettingView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/notification-setting',
    name: 'notification-setting',
    component: NotificationSettingView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  },
  {
    path: '/data-backup',
    name: 'data-backup',
    component: DataBackupView,
    meta: { requiresAuth: true, requiresOnboarding: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ナビゲーションガード
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  console.log('ナビゲーションガード:', { to: to.path, from: from.path })
  console.log('認証状態:', { 
    isAuthenticated: authStore.isAuthenticated, 
    isInitialized: authStore.isInitialized,
    needsOnboarding: authStore.needsOnboarding 
  })
  
  // 認証状態が初期化されていない場合は初期化を待つ
  if (!authStore.isInitialized) {
    console.log('認証状態を初期化中...')
    await authStore.checkAuth()
  }
  
  // 認証が必要なページで未認証の場合
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('未認証のためログイン画面にリダイレクト')
    next('/login')
    return
  }
  
  // ログイン済みでログインページにアクセスした場合
  if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('ログイン済みのためリダイレクト')
    // オンボーディングが必要かチェック
    if (authStore.needsOnboarding) {
      console.log('オンボーディングが必要なためオンボーディング画面にリダイレクト')
      next('/onboarding')
    } else {
      console.log('オンボーディング完了済みのためホーム画面にリダイレクト')
      next('/home')
    }
    return
  }
  
  // 認証済みでオンボーディングが必要な場合
  if (authStore.isAuthenticated && authStore.needsOnboarding && to.meta.requiresOnboarding === false) {
    console.log('オンボーディングが必要なためオンボーディング画面にリダイレクト')
    next('/onboarding')
    return
  }
  
  // オンボーディング完了済みでオンボーディングページにアクセスした場合
  if (to.path === '/onboarding' && authStore.isAuthenticated && !authStore.needsOnboarding) {
    console.log('オンボーディング完了済みのためホーム画面にリダイレクト')
    next('/home')
    return
  }
  
  console.log('ナビゲーション許可:', to.path)
  next()
})

export default router 