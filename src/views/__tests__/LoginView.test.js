import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../LoginView.vue'

// ストアのモック
const mockAuthStore = {
  login: vi.fn(),
  isLoading: false,
  error: null
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => mockAuthStore)
}))

// ルーターのモック
const createMockRouter = () => {
  const routes = [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/register', name: 'register', component: { template: '<div>Register</div>' } }
  ]
  
  return createRouter({
    history: createWebHistory(),
    routes
  })
}

describe('LoginView', () => {
  let router

  beforeEach(async () => {
    router = createMockRouter()
    await router.push('/login')
    vi.clearAllMocks()
  })

  it('コンポーネントが正しくマウントされる', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('ログインフォームが正しく表示される', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('フォームの初期値が正しく設定される', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    expect(emailInput.element.value).toBe('')
    expect(passwordInput.element.value).toBe('')
  })

  it('フォームの入力が正しく処理される', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')

    expect(emailInput.element.value).toBe('test@example.com')
    expect(passwordInput.element.value).toBe('password123')
  })

  it('ログインボタンがクリックされた時にログイン処理が実行される', async () => {
    mockAuthStore.login.mockResolvedValue({ success: true })

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await form.trigger('submit')

    expect(mockAuthStore.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('ログインが成功した時にホームページにリダイレクトされる', async () => {
    mockAuthStore.login.mockResolvedValue({ success: true })
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await form.trigger('submit')

    expect(pushSpy).toHaveBeenCalledWith('/')
  })

  it('ログインが失敗した時にエラーメッセージが表示される', async () => {
    mockAuthStore.login.mockResolvedValue({ 
      success: false, 
      error: 'ログインに失敗しました' 
    })

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('wrongpassword')
    await form.trigger('submit')

    expect(wrapper.text()).toContain('ログインに失敗しました')
  })

  it('ローディング中はボタンが無効化される', async () => {
    mockAuthStore.isLoading = true

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('バリデーションエラーが正しく表示される', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const form = wrapper.find('form')
    await form.trigger('submit')

    // 空のフォームで送信した場合のバリデーション
    expect(wrapper.text()).toContain('メールアドレスを入力してください')
    expect(wrapper.text()).toContain('パスワードを入力してください')
  })

  it('メールアドレスの形式が正しくバリデーションされる', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('invalid-email')

    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(wrapper.text()).toContain('有効なメールアドレスを入力してください')
  })

  it('パスワードの最小文字数がバリデーションされる', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('123')

    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(wrapper.text()).toContain('パスワードは6文字以上で入力してください')
  })

  it('登録ページへのリンクが正しく設定される', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const registerLink = wrapper.find('a[href="/register"]')
    expect(registerLink.exists()).toBe(true)
    expect(registerLink.text()).toContain('アカウントを作成')
  })

  it('パスワード表示/非表示の切り替えが機能する', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const passwordInput = wrapper.find('input[type="password"]')
    const toggleButton = wrapper.find('button[data-test="toggle-password"]')

    // 初期状態は非表示
    expect(passwordInput.attributes('type')).toBe('password')

    // 表示に切り替え
    await toggleButton.trigger('click')
    expect(passwordInput.attributes('type')).toBe('text')

    // 非表示に戻す
    await toggleButton.trigger('click')
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('コンポーネントが正しいCSSクラスを持つ', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const container = wrapper.find('.login-container')
    expect(container.exists()).toBe(true)
  })

  it('レスポンシブデザインが適用されている', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const form = wrapper.find('form')
    expect(form.classes()).toContain('w-full')
    expect(form.classes()).toContain('max-w-md')
  })

  it('アクセシビリティが正しく設定されている', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    expect(emailInput.attributes('aria-label')).toBeDefined()
    expect(passwordInput.attributes('aria-label')).toBeDefined()
  })
}) 