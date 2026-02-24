# デプロイメントガイド

このプロジェクトには、ローカル開発用とデプロイ用の2つの設定ファイルがあります。

## ファイル構成

- **`next.config.js`** - ローカル開発用（basePath なし）
- **`next.config.local.js`** - ローカル開発用のバックアップ
- **`next.config.deploy.js`** - デプロイ用（basePath: '/inumeshi'）

## ローカル開発の手順

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:3000 を開く
```

## デプロイの手順

### 1. デプロイ用設定でビルド

```bash
# デプロイ用の設定を一時的に使用
cp next.config.deploy.js next.config.js

# ビルド実行
npm run build

# ローカル用設定に戻す
cp next.config.local.js next.config.js
```

### 2. アップロード

FileZillaなどのFTPクライアントで、`out` ディレクトリの内容を以下にアップロード:

- **アップロード先**: サーバーの `/inumeshi/` ディレクトリ
- **重要**: `_next/static/chunks/` ディレクトリを含む、すべてのファイルとフォルダをアップロードしてください

### 3. 必須ファイル

以下のファイル/ディレクトリは必ずアップロードしてください:

- `*.html` - すべてのHTMLファイル
- `_next/` - Next.jsの静的アセット（CSS、JSなど）
- `.nojekyll` - GitHub Pagesの場合に必要（該当する場合）
- 画像ファイルなど

### 4. 確認

デプロイ後、以下のURLでアクセスして確認:

```
https://yourserver.com/inumeshi/
```

## トラブルシューティング

### CSSが読み込まれない場合

- `_next/static/chunks/` ディレクトリが正しくアップロードされているか確認
- ブラウザのキャッシュをクリア（シークレットモードで確認）

### 画像が表示されない場合

- 画像パスが正しいか確認
- `basePath` の設定が有効になっているか確認

### 404エラーが発生する場合

- サーバーの `/inumeshi/` ディレクトリにファイルが正しく配置されているか確認
- `.htaccess` などのサーバー設定を確認
