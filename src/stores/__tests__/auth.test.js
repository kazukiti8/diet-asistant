import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

// Firebaseサービスのモック
vi.mock('@/services/firebase', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    onAuthStateChanged: vi.fn()
  },
  DatabaseService: {
    updateUser: vi.fn()
  },
  auth: {
    currentUser: null
  }
}))

// Firebase Authのモック
vi.mock('firebase/auth', () => ({
  EmailAuthProvider: {
    credential: vi.fn()
  },
  reauthenticateWithCredential: vi.fn(),
  updatePassword: vi.fn()
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // localStorageのモック
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const store = useAuthStore()
      
      expect(store.user).toBe(null)
      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.isLoggedIn).toBe(false)
      expect(store.userProfile).toBe(null)
    })
  })

  describe('login', () => {
    it('ログインが成功する', async () => {
      const store = useAuthStore()
      const mockUser = { uid: '123', email: 'test@example.com' }
      const mockToken = 'mock-token'
      
      // AuthService.loginのモック
      const { AuthService } = await import('@/services/firebase')
      AuthService.login.mockResolvedValue({
        success: true,
        user: mockUser
      })
      
      // getIdTokenのモック
      mockUser.getIdToken = vi.fn().mockResolvedValue(mockToken)
      
      const result = await store.login({
        email: 'test@example.com',
        password: 'password123'
      })
      
      expect(result.success).toBe(true)
      expect(store.user).toEqual(mockUser)
      expect(store.token).toBe(mockToken)
      expect(store.isAuthenticated).toBe(true)
      expect(store.isLoggedIn).toBe(true)
    })

    it('ログインが失敗する', async () => {
      const store = useAuthStore()
      
      const { AuthService } = await import('@/services/firebase')
      AuthService.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials'
      })
      
      const result = await store.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(store.user).toBe(null)
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('登録が成功する', async () => {
      const store = useAuthStore()
      const mockUser = { uid: '123', email: 'test@example.com' }
      const mockToken = 'mock-token'
      
      const { AuthService } = await import('@/services/firebase')
      AuthService.register.mockResolvedValue({
        success: true,
        user: mockUser
      })
      
      mockUser.getIdToken = vi.fn().mockResolvedValue(mockToken)
      
      const result = await store.register({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        nickname: 'Test User'
      })
      
      expect(result.success).toBe(true)
      expect(store.user).toEqual(mockUser)
      expect(store.token).toBe(mockToken)
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('ログアウトが成功する', async () => {
      const store = useAuthStore()
      
      // 初期状態をログイン済みに設定
      store.user = { uid: '123' }
      store.token = 'mock-token'
      store.isAuthenticated = true
      
      const { AuthService } = await import('@/services/firebase')
      AuthService.logout.mockResolvedValue({ success: true })
      
      const result = await store.logout()
      
      expect(result.success).toBe(true)
      expect(store.user).toBe(null)
      expect(store.token).toBe(null)
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoggedIn).toBe(false)
    })
  })

  describe('updateProfile', () => {
    it('プロフィール更新が成功する', async () => {
      const store = useAuthStore()
      const mockUser = { uid: '123', email: 'test@example.com' }
      
      // ユーザーをログイン状態に設定
      store.user = mockUser
      store.isAuthenticated = true
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateUser.mockResolvedValue({ success: true })
      
      const profileData = { nickname: 'New Nickname' }
      const result = await store.updateProfile(profileData)
      
      expect(result.success).toBe(true)
      expect(store.user).toEqual({ ...mockUser, ...profileData })
    })

    it('未認証時にプロフィール更新が失敗する', async () => {
      const store = useAuthStore()
      
      const result = await store.updateProfile({ nickname: 'New Nickname' })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('ユーザーが認証されていません')
    })
  })
}) 