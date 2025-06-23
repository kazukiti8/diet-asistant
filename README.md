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

`.env` ファイルを作成して環境変数を設定できます：

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=ダイエット応援ノート
```

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