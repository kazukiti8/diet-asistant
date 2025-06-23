import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'ホーム' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'ログイン' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'ユーザー登録' }
  },
  {
    path: '/records',
    name: 'RecordSelection',
    component: () => import('@/views/RecordSelectionView.vue'),
    meta: { title: '記録' }
  },
  {
    path: '/weight-record',
    name: 'WeightRecord',
    component: () => import('@/views/WeightRecordView.vue'),
    meta: { title: '体重記録' }
  },
  {
    path: '/meal-record',
    name: 'MealRecord',
    component: () => import('@/views/MealRecordView.vue'),
    meta: { title: '食事記録' }
  },
  {
    path: '/exercise-record',
    name: 'ExerciseRecord',
    component: () => import('@/views/ExerciseRecordView.vue'),
    meta: { title: '運動記録' }
  },
  {
    path: '/exercise-menu',
    name: 'ExerciseMenu',
    component: () => import('@/views/ExerciseMenuView.vue'),
    meta: { title: '運動メニュー提案' }
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import('@/views/ProgressView.vue'),
    meta: { title: '進捗詳細' }
  },
  {
    path: '/advice',
    name: 'Advice',
    component: () => import('@/views/AdviceView.vue'),
    meta: { title: 'アドバイス' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '設定' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: 'プロフィール編集' }
  },
  {
    path: '/goals',
    name: 'Goals',
    component: () => import('@/views/GoalsView.vue'),
    meta: { title: '目標設定' }
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('@/views/RemindersView.vue'),
    meta: { title: 'リマインダー設定' }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationsView.vue'),
    meta: { title: '通知設定' }
  },
  {
    path: '/backup',
    name: 'Backup',
    component: () => import('@/views/BackupView.vue'),
    meta: { title: 'データバックアップ' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ページタイトルの設定
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - ダイエット応援ノート` : 'ダイエット応援ノート'
  next()
})

export default router 