// Firebase設定ファイル
// 環境変数から設定を取得

// 設定値の検証
const isValidConfig = (config) => {
  return config.apiKey && 
         config.apiKey !== 'your-api-key-here' && 
         config.authDomain && 
         config.authDomain !== 'your-project.firebaseapp.com'
}

// 開発環境用の設定
export const devFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "demo-measurement-id"
}

// 本番環境用の設定
export const prodFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_PROD_API_KEY || "demo-prod-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_PROD_AUTH_DOMAIN || "demo-prod-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROD_PROJECT_ID || "demo-prod-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_PROD_STORAGE_BUCKET || "demo-prod-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_PROD_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_PROD_APP_ID || "demo-prod-app-id"
}

// 環境に応じて設定を選択
const isDevelopment = import.meta.env.DEV
const selectedConfig = isDevelopment ? devFirebaseConfig : prodFirebaseConfig

// 設定が有効でない場合はモックモード
if (!isValidConfig(selectedConfig)) {
  console.warn('Firebase設定が無効です。モックモードで動作します。')
  console.log('Firebase Consoleから正しい設定値を取得して.envファイルに設定してください。')
}

export const currentFirebaseConfig = selectedConfig

// 設定手順:
// 1. プロジェクトルートに .env ファイルを作成
// 2. .env.example の内容をコピーして .env に貼り付け
// 3. Firebase Console から取得した実際の値を設定
// 4. Firebase Console (https://console.firebase.google.com/) にアクセス
// 5. プロジェクトを作成: "diet-assistant"
// 6. Webアプリを追加: "diet-assistant-web"
// 7. 表示された設定情報を .env ファイルにコピー
// 8. Authentication で「メール/パスワード」を有効化
// 9. Firestore Database を作成（テストモードで開始） 