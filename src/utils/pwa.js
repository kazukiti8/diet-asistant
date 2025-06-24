// PWA機能の管理
export class PWAManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator
    this.registration = null
    // 開発環境の判定を修正
    this.isDevelopment = this.checkIfDevelopment()
  }

  // 開発環境かどうかを判定
  checkIfDevelopment() {
    try {
      // Vite環境変数が利用可能な場合
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.DEV === true
      }
      // Node.js環境変数が利用可能な場合
      if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV === 'development'
      }
      // デフォルトは開発環境とみなす
      return true
    } catch (error) {
      console.warn('開発環境の判定に失敗しました:', error)
      return true
    }
  }

  // Service Workerの登録
  async registerServiceWorker() {
    // 開発環境ではService Workerを登録しない
    if (this.isDevelopment) {
      console.log('開発環境のため、Service Workerの登録をスキップします')
      return false
    }

    if (!this.isSupported) {
      console.log('Service Workerはサポートされていません')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Workerが登録されました:', this.registration)
      return true
    } catch (error) {
      console.error('Service Workerの登録に失敗しました:', error)
      return false
    }
  }

  // プッシュ通知の権限をリクエスト
  async requestNotificationPermission() {
    if (!this.isSupported || !this.registration) {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('通知権限のリクエストに失敗しました:', error)
      return false
    }
  }

  // プッシュ通知を送信
  async sendNotification(title, options = {}) {
    if (!this.isSupported || !this.registration) {
      return false
    }

    try {
      await this.registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        ...options
      })
      return true
    } catch (error) {
      console.error('通知の送信に失敗しました:', error)
      return false
    }
  }

  // アプリのインストールを促す
  showInstallPrompt() {
    if (!this.isSupported || !this.registration) {
      return false
    }

    // インストール可能な場合の処理
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      // インストールボタンを表示するなどの処理
      console.log('アプリのインストールが可能です')
    })
  }

  // オフライン状態の確認
  isOnline() {
    return navigator.onLine
  }

  // オフライン状態の監視
  onOfflineStatusChange(callback) {
    window.addEventListener('online', () => callback(true))
    window.addEventListener('offline', () => callback(false))
  }

  // キャッシュのクリア
  async clearCache() {
    if (!this.isSupported) {
      return false
    }

    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('キャッシュがクリアされました')
      return true
    } catch (error) {
      console.error('キャッシュのクリアに失敗しました:', error)
      return false
    }
  }
}

// シングルトンインスタンス
export const pwaManager = new PWAManager() 