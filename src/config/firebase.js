// Firebase設定ファイル
// 環境変数から設定を取得

// 開発環境用の設定
export const devFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// 本番環境用の設定
export const prodFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_PROD_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_PROD_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROD_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_PROD_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_PROD_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_PROD_APP_ID
}

// 環境に応じて設定を選択
const isDevelopment = import.meta.env.DEV
export const currentFirebaseConfig = isDevelopment ? devFirebaseConfig : prodFirebaseConfig

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