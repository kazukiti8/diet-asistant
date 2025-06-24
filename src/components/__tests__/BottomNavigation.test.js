import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import BottomNavigation from '../BottomNavigation.vue'

// モックルーターの作成
const createMockRouter = () => {
  const routes = [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/progress', name: 'progress', component: { template: '<div>Progress</div>' } },
    { path: '/records', name: 'records', component: { template: '<div>Records</div>' } },
    { path: '/advice', name: 'advice', component: { template: '<div>Advice</div>' } },
    { path: '/settings', name: 'settings', component: { template: '<div>Settings</div>' } }
  ]
  
  return createRouter({
    history: createWebHistory(),
    routes
  })
}

describe('BottomNavigation', () => {
  let router

  beforeEach(async () => {
    router = createMockRouter()
    await router.push('/')
  })

  it('ナビゲーションアイテムが正しく表示される', () => {
    const wrapper = mount(BottomNavigation, {
      global: {
        plugins: [router]
      }
    })

    const navigationItems = wrapper.findAll('a')
    expect(navigationItems).toHaveLength(5)

    // 各ナビゲーションアイテムの確認
    const expectedItems = [
      { label: 'ホーム', icon: 'fas fa-home' },
      { label: '進捗', icon: 'fas fa-chart-line' },
      { label: '記録', icon: 'fas fa-plus-circle' },
      { label: 'アドバイス', icon: 'fas fa-lightbulb' },
      { label: '設定', icon: 'fas fa-cog' }
    ]

    expectedItems.forEach((item, index) => {
      const navItem = navigationItems[index]
      expect(navItem.text()).toContain(item.label)
      expect(navItem.find('i').classes()).toContain(item.icon)
    })
  })

  it('現在のページがアクティブ状態で表示される', async () => {
    await router.push('/progress')
    
    const wrapper = mount(BottomNavigation, {
      global: {
        plugins: [router]
      }
    })

    const activeLink = wrapper.find('a.text-primary-600')
    expect(activeLink.exists()).toBe(true)
    expect(activeLink.text()).toContain('進捗')
  })

  it('ホームページがアクティブ状態で表示される', async () => {
    await router.push('/')
    
    const wrapper = mount(BottomNavigation, {
      global: {
        plugins: [router]
      }
    })

    const activeLink = wrapper.find('a.text-primary-600')
    expect(activeLink.exists()).toBe(true)
    expect(activeLink.text()).toContain('ホーム')
  })

  it('ナビゲーションリンクが正しいパスに設定される', () => {
    const wrapper = mount(BottomNavigation, {
      global: {
        plugins: [router]
      }
    })

    const navigationItems = wrapper.findAll('a')
    const expectedPaths = ['/', '/progress', '/records', '/advice', '/settings']

    expectedPaths.forEach((path, index) => {
      expect(navigationItems[index].attributes('href')).toBe(path)
    })
  })

  it('コンポーネントが正しいCSSクラスを持つ', () => {
    const wrapper = mount(BottomNavigation, {
      global: {
        plugins: [router]
      }
    })

    const nav = wrapper.find('nav')
    expect(nav.classes()).toContain('fixed')
    expect(nav.classes()).toContain('bottom-0')
    expect(nav.classes()).toContain('bg-white')
    expect(nav.classes()).toContain('border-t')
  })

  it('アイコンが正しく表示される', () => {
    const wrapper = mount(BottomNavigation, {
      global: {
        plugins: [router]
      }
    })

    const icons = wrapper.findAll('i')
    expect(icons).toHaveLength(5)

    const expectedIcons = [
      'fas fa-home',
      'fas fa-chart-line',
      'fas fa-plus-circle',
      'fas fa-lightbulb',
      'fas fa-cog'
    ]

    expectedIcons.forEach((iconClass, index) => {
      expect(icons[index].classes()).toContain(iconClass)
    })
  })
}) 