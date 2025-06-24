import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PWAManager } from '../pwa'

// Service Workerのモック
const mockServiceWorker = {
  register: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}

// Notificationのモック
const mockNotification = {
  requestPermission: vi.fn(),
  permission: 'default'
}

// Cache APIのモック
const mockCache = {
  open: vi.fn(),
  keys: vi.fn(),
  delete: vi.fn()
}

// グローバルオブジェクトのモック
global.navigator = {
  serviceWorker: mockServiceWorker,
  onLine: true
}

global.Notification = mockNotification
global.caches = mockCache

describe('PWAManager', () => {
  let pwaManager

  beforeEach(() => {
    pwaManager = new PWAManager()
    vi.clearAllMocks()
  })

  describe('初期化', () => {
    it('Service Workerがサポートされている場合、isSupportedがtrueになる', () => {
      expect(pwaManager.isSupported).toBe(true)
    })

    it('Service Workerがサポートされていない場合、isSupportedがfalseになる', () => {
      const originalServiceWorker = global.navigator.serviceWorker
      delete global.navigator.serviceWorker
      
      const manager = new PWAManager()
      expect(manager.isSupported).toBe(false)
      
      global.navigator.serviceWorker = originalServiceWorker
    })
  })

  describe('registerServiceWorker', () => {
    it('Service Workerの登録が成功する', async () => {
      const mockRegistration = { scope: '/', active: { state: 'activated' } }
      mockServiceWorker.register.mockResolvedValue(mockRegistration)

      const result = await pwaManager.registerServiceWorker()

      expect(result).toBe(true)
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js')
      expect(pwaManager.registration).toEqual(mockRegistration)
    })

    it('Service Workerの登録が失敗する', async () => {
      mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'))

      const result = await pwaManager.registerServiceWorker()

      expect(result).toBe(false)
    })

    it('Service Workerがサポートされていない場合、falseを返す', async () => {
      const originalServiceWorker = global.navigator.serviceWorker
      delete global.navigator.serviceWorker
      
      const manager = new PWAManager()
      const result = await manager.registerServiceWorker()
      
      expect(result).toBe(false)
      
      global.navigator.serviceWorker = originalServiceWorker
    })
  })

  describe('requestNotificationPermission', () => {
    it('通知権限のリクエストが成功する', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted')

      const result = await pwaManager.requestNotificationPermission()

      expect(result).toBe(true)
      expect(mockNotification.requestPermission).toHaveBeenCalled()
    })

    it('通知権限が拒否される', async () => {
      mockNotification.requestPermission.mockResolvedValue('denied')

      const result = await pwaManager.requestNotificationPermission()

      expect(result).toBe(false)
    })

    it('Service Workerが登録されていない場合、falseを返す', async () => {
      const result = await pwaManager.requestNotificationPermission()

      expect(result).toBe(false)
    })
  })

  describe('sendNotification', () => {
    it('通知の送信が成功する', async () => {
      const mockRegistration = { showNotification: vi.fn() }
      pwaManager.registration = mockRegistration

      const result = await pwaManager.sendNotification('テスト通知')

      expect(result).toBe(true)
      expect(mockRegistration.showNotification).toHaveBeenCalledWith('テスト通知', {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100]
      })
    })

    it('Service Workerが登録されていない場合、falseを返す', async () => {
      const result = await pwaManager.sendNotification('テスト通知')

      expect(result).toBe(false)
    })
  })

  describe('isOnline', () => {
    it('オンライン状態を正しく返す', () => {
      global.navigator.onLine = true
      expect(pwaManager.isOnline()).toBe(true)

      global.navigator.onLine = false
      expect(pwaManager.isOnline()).toBe(false)
    })
  })

  describe('onOfflineStatusChange', () => {
    it('オンライン/オフライン状態の変更を監視する', () => {
      const callback = vi.fn()
      pwaManager.onOfflineStatusChange(callback)

      // オンラインイベントをシミュレート
      const onlineEvent = new Event('online')
      window.dispatchEvent(onlineEvent)

      expect(callback).toHaveBeenCalledWith(true)

      // オフラインイベントをシミュレート
      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)

      expect(callback).toHaveBeenCalledWith(false)
    })
  })

  describe('clearCache', () => {
    it('キャッシュのクリアが成功する', async () => {
      const mockCacheNames = ['cache-1', 'cache-2']
      mockCache.keys.mockResolvedValue(mockCacheNames)
      mockCache.delete.mockResolvedValue(true)

      const result = await pwaManager.clearCache()

      expect(result).toBe(true)
      expect(mockCache.keys).toHaveBeenCalled()
      expect(mockCache.delete).toHaveBeenCalledTimes(2)
    })

    it('キャッシュのクリアが失敗する', async () => {
      mockCache.keys.mockRejectedValue(new Error('Cache clear failed'))

      const result = await pwaManager.clearCache()

      expect(result).toBe(false)
    })
  })
}) 