# ダイエット応援ノート

Vue.js 3で構築されたダイエット管理アプリケーションです。

## 機能

- 📊 体重・食事・運動記録の管理
- 🎯 目標設定と進捗追跡
- 💡 パーソナライズされたアドバイス
- 📈 詳細な進捗分析
- 🔔 リマインダー機能
- 📱 レスポンシブデザイン

## 技術スタック

- **フロントエンド**: Vue.js 3 + Composition API
- **ルーティング**: Vue Router 4
- **状態管理**: Pinia
- **スタイリング**: Tailwind CSS
- **アイコン**: Font Awesome
- **ビルドツール**: Vite
- **テスト**: Vitest

## セットアップ

### 前提条件

- Node.js 18.0.0以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd diet-assistant
```

2. 依存関係をインストール
```bash
npm install
```

3. 開発サーバーを起動
```bash
npm run dev
```

4. ブラウザで `http://localhost:3000` を開く

### その他のコマンド

```bash
# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview

# テストの実行
npm run test

# リンターの実行
npm run lint
```

## プロジェクト構造

```
src/
├── components/          # 共通コンポーネント
│   ├── BottomNavigation.vue
│   └── NotificationContainer.vue
├── stores/             # Piniaストア
│   └── auth.js
├── views/              # ページコンポーネント
│   ├── LoginView.vue
│   ├── HomeView.vue
│   └── ...
├── router/             # ルーティング設定
│   └── index.js
├── App.vue             # メインアプリケーション
├── main.js             # エントリーポイント
└── style.css           # グローバルスタイル
```

## 開発ガイドライン

### コンポーネント命名

- ページコンポーネント: `PascalCase` + `View` (例: `HomeView.vue`)
- 共通コンポーネント: `PascalCase` (例: `BottomNavigation.vue`)

### スタイリング

- Tailwind CSSクラスを優先使用
- カスタムCSSは `src/style.css` に定義
- コンポーネント固有のスタイルは `<style scoped>` を使用

### 状態管理

- グローバル状態: Piniaストア
- ローカル状態: `ref()` または `reactive()`
- フォーム状態: `reactive()` を使用

### 通知システム

```javascript
// 成功通知
window.$notify.success('タイトル', 'メッセージ')

// エラー通知
window.$notify.error('タイトル', 'エラーメッセージ')

// 警告通知
window.$notify.warning('タイトル', '警告メッセージ')

// 情報通知
window.$notify.info('タイトル', '情報メッセージ')
```

## 環境変数

### .envファイルの設定

1. プロジェクトルートに `.env` ファイルを作成
2. 以下の内容をコピーして `.env` ファイルに貼り付け：

```env
# Firebase設定
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# 本番環境用の設定（実際の値に置き換えてください）
# VITE_FIREBASE_PROD_API_KEY=your-production-api-key
# VITE_FIREBASE_PROD_AUTH_DOMAIN=your-production-auth-domain
# VITE_FIREBASE_PROD_PROJECT_ID=your-production-project-id
# VITE_FIREBASE_PROD_STORAGE_BUCKET=your-production-storage-bucket
# VITE_FIREBASE_PROD_MESSAGING_SENDER_ID=your-production-sender-id
# VITE_FIREBASE_PROD_APP_ID=your-production-app-id

# アプリケーション設定
VITE_APP_TITLE=ダイエット応援ノート
```

3. Firebase Console から取得した実際の値を設定
4. `.env` ファイルは `.gitignore` に含まれているため、Gitにコミットされません

### Firebase設定の取得方法

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「プロジェクトの設定」→「全般」タブ
4. 「マイアプリ」セクションで「Webアプリを追加」
5. 表示された設定情報を `.env` ファイルにコピー

## デプロイ

### Vercel

1. Vercelにプロジェクトを接続
2. ビルドコマンド: `npm run build`
3. 出力ディレクトリ: `dist`

### Netlify

1. Netlifyにプロジェクトを接続
2. ビルドコマンド: `npm run build`
3. 公開ディレクトリ: `dist`

## ライセンス

MIT License

## 貢献

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成 