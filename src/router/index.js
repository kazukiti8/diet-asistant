import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ビューコンポーネントのインポート
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HomeView from '@/views/HomeView.vue'
import RecordsView from '@/views/RecordsView.vue'
import WeightRecordView from '@/views/WeightRecordView.vue'
import MealRecordView from '@/views/MealRecordView.vue'

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
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/records',
    name: 'records',
    component: RecordsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/weight-record',
    name: 'weight-record',
    component: WeightRecordView,
    meta: { requiresAuth: true }
  },
  {
    path: '/meal-record',
    name: 'meal-record',
    component: MealRecordView,
    meta: { requiresAuth: true }
  },
  // プレースホルダールート（後で実装予定）
  {
    path: '/exercise-record',
    name: 'exercise-record',
    component: () => import('@/views/ExerciseRecordView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exercise-menu',
    name: 'exercise-menu',
    component: () => import('@/views/ExerciseMenuView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('@/views/ProgressView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/advice',
    name: 'advice',
    component: () => import('@/views/AdviceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile-edit',
    name: 'profile-edit',
    component: () => import('@/views/ProfileEditView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/goal-setting',
    name: 'goal-setting',
    component: () => import('@/views/GoalSettingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reminder-setting',
    name: 'reminder-setting',
    component: () => import('@/views/ReminderSettingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notification-setting',
    name: 'notification-setting',
    component: () => import('@/views/NotificationSettingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/data-backup',
    name: 'data-backup',
    component: () => import('@/views/DataBackupView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router 