// Firebase設定ファイル
// Firebase Consoleから取得した設定をここに貼り付けてください

export const firebaseConfig = {
  // Firebase Consoleから取得した設定をここに貼り付けてください
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}

// 開発環境用の設定例（実際の値に置き換えてください）
export const devFirebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "diet-assistant-dev.firebaseapp.com",
  projectId: "diet-assistant-dev",
  storageBucket: "diet-assistant-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
}

// 本番環境用の設定例（実際の値に置き換えてください）
export const prodFirebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "diet-assistant-prod.firebaseapp.com",
  projectId: "diet-assistant-prod",
  storageBucket: "diet-assistant-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
}

// 環境に応じて設定を選択
const isDevelopment = import.meta.env.DEV
export const currentFirebaseConfig = isDevelopment ? devFirebaseConfig : prodFirebaseConfig

// 設定手順:
// 1. Firebase Console (https://console.firebase.google.com/) にアクセス
// 2. プロジェクトを作成: "diet-assistant"
// 3. Webアプリを追加: "diet-assistant-web"
// 4. 表示された設定情報を上記の devFirebaseConfig にコピー
// 5. Authentication で「メール/パスワード」を有効化
// 6. Firestore Database を作成（テストモードで開始） 