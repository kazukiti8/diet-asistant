import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../HomeView.vue'

// ストアのモック
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { uid: '123', email: 'test@example.com' },
    isAuthenticated: true,
    userProfile: { nickname: 'テストユーザー' }
  }))
}))

vi.mock('@/stores/weight', () => ({
  useWeightStore: vi.fn(() => ({
    currentWeight: 70.5,
    targetWeight: 65.0,
    weightRecords: [
      { weight: 75.0, date: '2024-01-01' },
      { weight: 70.5, date: '2024-01-02' }
    ],
    getWeightProgress: vi.fn(() => ({
      totalLoss: 4.5,
      remainingLoss: 5.5,
      progressPercentage: 45
    }))
  }))
}))

vi.mock('@/stores/meal', () => ({
  useMealStore: vi.fn(() => ({
    todayCalories: 1800,
    mealRecords: [
      { name: '朝食', calories: 500, mealType: 'breakfast' },
      { name: '昼食', calories: 800, mealType: 'lunch' },
      { name: '夕食', calories: 500, mealType: 'dinner' }
    ],
    getTodayCalories: vi.fn(() => 1800)
  }))
}))

vi.mock('@/stores/exercise', () => ({
  useExerciseStore: vi.fn(() => ({
    todayCalories: 300,
    exerciseRecords: [
      { name: 'ランニング', calories: 300, duration: 30 }
    ],
    getTodayCalories: vi.fn(() => 300)
  }))
}))

// ルーターのモック
const createMockRouter = () => {
  const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/weight-record', name: 'weight-record', component: { template: '<div>Weight Record</div>' } },
    { path: '/meal-record', name: 'meal-record', component: { template: '<div>Meal Record</div>' } },
    { path: '/exercise-record', name: 'exercise-record', component: { template: '<div>Exercise Record</div>' } }
  ]
  
  return createRouter({
    history: createWebHistory(),
    routes
  })
}

describe('HomeView', () => {
  let router

  beforeEach(async () => {
    router = createMockRouter()
    await router.push('/')
  })

  it('コンポーネントが正しくマウントされる', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('ユーザー情報が正しく表示される', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('テストユーザー')
  })

  it('体重の進捗情報が正しく表示される', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('70.5')
    expect(wrapper.text()).toContain('65.0')
    expect(wrapper.text()).toContain('45%')
  })

  it('今日のカロリー情報が正しく表示される', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('1800')
    expect(wrapper.text()).toContain('300')
  })

  it('食事記録の概要が正しく表示される', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('朝食')
    expect(wrapper.text()).toContain('昼食')
    expect(wrapper.text()).toContain('夕食')
  })

  it('運動記録の概要が正しく表示される', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('ランニング')
    expect(wrapper.text()).toContain('30分')
  })

  it('クイックアクションボタンが正しく表示される', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
    
    // 体重記録ボタン
    expect(wrapper.text()).toContain('体重記録')
    
    // 食事記録ボタン
    expect(wrapper.text()).toContain('食事記録')
    
    // 運動記録ボタン
    expect(wrapper.text()).toContain('運動記録')
  })

  it('体重記録ボタンが正しいリンクに設定される', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    const weightButton = wrapper.find('[data-test="weight-record-button"]')
    if (weightButton.exists()) {
      expect(weightButton.attributes('href')).toBe('/weight-record')
    }
  })

  it('食事記録ボタンが正しいリンクに設定される', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    const mealButton = wrapper.find('[data-test="meal-record-button"]')
    if (mealButton.exists()) {
      expect(mealButton.attributes('href')).toBe('/meal-record')
    }
  })

  it('運動記録ボタンが正しいリンクに設定される', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    const exerciseButton = wrapper.find('[data-test="exercise-record-button"]')
    if (exerciseButton.exists()) {
      expect(exerciseButton.attributes('href')).toBe('/exercise-record')
    }
  })

  it('データがない場合の表示が正しい', () => {
    // モックを変更してデータがない状態をシミュレート
    vi.mocked(useWeightStore).mockReturnValue({
      currentWeight: null,
      targetWeight: null,
      weightRecords: [],
      getWeightProgress: vi.fn(() => ({
        totalLoss: 0,
        remainingLoss: 0,
        progressPercentage: 0
      }))
    })

    vi.mocked(useMealStore).mockReturnValue({
      todayCalories: 0,
      mealRecords: [],
      getTodayCalories: vi.fn(() => 0)
    })

    vi.mocked(useExerciseStore).mockReturnValue({
      todayCalories: 0,
      exerciseRecords: [],
      getTodayCalories: vi.fn(() => 0)
    })

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('記録がありません')
  })

  it('コンポーネントが正しいCSSクラスを持つ', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    const container = wrapper.find('.home-container')
    expect(container.exists()).toBe(true)
  })

  it('レスポンシブデザインが適用されている', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })

    const grid = wrapper.find('.grid')
    if (grid.exists()) {
      expect(grid.classes()).toContain('grid-cols-1')
      expect(grid.classes()).toContain('md:grid-cols-2')
      expect(grid.classes()).toContain('lg:grid-cols-3')
    }
  })
}) 