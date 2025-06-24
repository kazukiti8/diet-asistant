const CACHE_NAME = 'diet-assistant-v1.0.1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/App.vue',
  '/src/style.css'
]

// Service Workerのインストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを開きました')
        return cache.addAll(urlsToCache)
      })
  )
})

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除します:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュに存在する場合はキャッシュから返す
        if (response) {
          return response
        }

        // キャッシュに存在しない場合はネットワークから取得
        return fetch(event.request)
          .then((response) => {
            // 有効なレスポンスでない場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // ネットワークエラーの場合、オフライン用ページを返す
            if (event.request.destination === 'document') {
              return caches.match('/index.html')
            }
          })
      })
  )
})

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'アプリを開く',
        icon: '/icons/icon.svg'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/icon.svg'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('ダイエット応援ノート', options)
  )
})

// 通知クリックの処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
}) 