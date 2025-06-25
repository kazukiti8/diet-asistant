import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../settings'

// Firebaseサービスのモック
vi.mock('@/services/firebase', () => ({
  DatabaseService: {
    getSettings: vi.fn(),
    updateSettings: vi.fn()
  }
}))

describe('Settings Store', () => {
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
      const store = useSettingsStore()
      
      expect(store.notifications).toBe(true)
      expect(store.reminders).toBe(true)
      expect(store.darkMode).toBe(false)
      expect(store.language).toBe('ja')
      expect(store.units).toBe('metric')
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('loadSettings', () => {
    it('設定の読み込みが成功する', async () => {
      const store = useSettingsStore()
      const mockSettings = {
        notifications: false,
        reminders: true,
        darkMode: true,
        language: 'en',
        units: 'imperial'
      }
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.getSettings.mockResolvedValue({
        success: true,
        settings: mockSettings
      })
      
      const result = await store.loadSettings()
      
      expect(result.success).toBe(true)
      expect(store.notifications).toBe(false)
      expect(store.reminders).toBe(true)
      expect(store.darkMode).toBe(true)
      expect(store.language).toBe('en')
      expect(store.units).toBe('imperial')
    })

    it('設定の読み込みが失敗する', async () => {
      const store = useSettingsStore()
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.getSettings.mockResolvedValue({
        success: false,
        error: '読み込みエラー'
      })
      
      const result = await store.loadSettings()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('読み込みエラー')
      // デフォルト値が維持される
      expect(store.notifications).toBe(true)
    })
  })

  describe('updateSettings', () => {
    it('設定の更新が成功する', async () => {
      const store = useSettingsStore()
      const newSettings = {
        notifications: false,
        darkMode: true
      }
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateSettings.mockResolvedValue({
        success: true
      })
      
      const result = await store.updateSettings(newSettings)
      
      expect(result.success).toBe(true)
      expect(store.notifications).toBe(false)
      expect(store.darkMode).toBe(true)
      expect(store.reminders).toBe(true) // 変更されていない設定は維持
    })

    it('設定の更新が失敗する', async () => {
      const store = useSettingsStore()
      const originalNotifications = store.notifications
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateSettings.mockResolvedValue({
        success: false,
        error: '更新エラー'
      })
      
      const result = await store.updateSettings({ notifications: false })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('更新エラー')
      expect(store.notifications).toBe(originalNotifications) // 変更されない
    })
  })

  describe('toggleNotifications', () => {
    it('通知設定の切り替えが成功する', async () => {
      const store = useSettingsStore()
      store.notifications = true
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateSettings.mockResolvedValue({
        success: true
      })
      
      const result = await store.toggleNotifications()
      
      expect(result.success).toBe(true)
      expect(store.notifications).toBe(false)
    })
  })

  describe('toggleReminders', () => {
    it('リマインダー設定の切り替えが成功する', async () => {
      const store = useSettingsStore()
      store.reminders = true
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateSettings.mockResolvedValue({
        success: true
      })
      
      const result = await store.toggleReminders()
      
      expect(result.success).toBe(true)
      expect(store.reminders).toBe(false)
    })
  })

  describe('toggleDarkMode', () => {
    it('ダークモード設定の切り替えが成功する', async () => {
      const store = useSettingsStore()
      store.darkMode = false
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateSettings.mockResolvedValue({
        success: true
      })
      
      const result = await store.toggleDarkMode()
      
      expect(result.success).toBe(true)
      expect(store.darkMode).toBe(true)
    })
  })

  describe('setLanguage', () => {
    it('言語設定が正しく更新される', async () => {
      const store = useSettingsStore()
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateSettings.mockResolvedValue({
        success: true
      })
      
      const result = await store.setLanguage('en')
      
      expect(result.success).toBe(true)
      expect(store.language).toBe('en')
    })

    it('無効な言語設定が拒否される', async () => {
      const store = useSettingsStore()
      const originalLanguage = store.language
      
      const result = await store.setLanguage('invalid')
      
      expect(result.success).toBe(false)
      expect(store.language).toBe(originalLanguage)
    })
  })

  describe('setUnits', () => {
    it('単位設定が正しく更新される', async () => {
      const store = useSettingsStore()
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateSettings.mockResolvedValue({
        success: true
      })
      
      const result = await store.setUnits('imperial')
      
      expect(result.success).toBe(true)
      expect(store.units).toBe('imperial')
    })

    it('無効な単位設定が拒否される', async () => {
      const store = useSettingsStore()
      const originalUnits = store.units
      
      const result = await store.setUnits('invalid')
      
      expect(result.success).toBe(false)
      expect(store.units).toBe(originalUnits)
    })
  })

  describe('resetToDefaults', () => {
    it('設定がデフォルト値にリセットされる', async () => {
      const store = useSettingsStore()
      
      // 設定を変更
      store.notifications = false
      store.darkMode = true
      store.language = 'en'
      store.units = 'imperial'
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateSettings.mockResolvedValue({
        success: true
      })
      
      const result = await store.resetToDefaults()
      
      expect(result.success).toBe(true)
      expect(store.notifications).toBe(true)
      expect(store.reminders).toBe(true)
      expect(store.darkMode).toBe(false)
      expect(store.language).toBe('ja')
      expect(store.units).toBe('metric')
    })
  })

  describe('getSettingsForExport', () => {
    it('設定のエクスポートデータが正しく生成される', () => {
      const store = useSettingsStore()
      
      store.notifications = false
      store.darkMode = true
      store.language = 'en'
      store.units = 'imperial'
      
      const exportData = store.getSettingsForExport()
      
      expect(exportData).toEqual({
        notifications: false,
        reminders: true,
        darkMode: true,
        language: 'en',
        units: 'imperial',
        exportDate: expect.any(String)
      })
    })
  })

  describe('importSettings', () => {
    it('設定のインポートが成功する', async () => {
      const store = useSettingsStore()
      const importData = {
        notifications: false,
        darkMode: true,
        language: 'en',
        units: 'imperial'
      }
      
      const { DatabaseService } = await import('@/services/firebase')
      DatabaseService.updateSettings.mockResolvedValue({
        success: true
      })
      
      const result = await store.importSettings(importData)
      
      expect(result.success).toBe(true)
      expect(store.notifications).toBe(false)
      expect(store.darkMode).toBe(true)
      expect(store.language).toBe('en')
      expect(store.units).toBe('imperial')
    })

    it('無効なインポートデータが拒否される', async () => {
      const store = useSettingsStore()
      const originalSettings = {
        notifications: store.notifications,
        darkMode: store.darkMode,
        language: store.language,
        units: store.units
      }
      
      const result = await store.importSettings({ invalid: 'data' })
      
      expect(result.success).toBe(false)
      expect(store.notifications).toBe(originalSettings.notifications)
      expect(store.darkMode).toBe(originalSettings.darkMode)
      expect(store.language).toBe(originalSettings.language)
      expect(store.units).toBe(originalSettings.units)
    })
  })
}) 