# インストール

## 1. ブックマークレット文字列を生成

```bash
npm run build
```

生成物:
- dist/legacy.bookmarklet.txt
- dist/csp.bookmarklet.txt

## 2. ブラウザへ登録

1. ブラウザで新規ブックマークを作成
2. URL 欄に `dist/*.bookmarklet.txt` の内容を貼り付け
3. 名前をつけて保存

## 3. 使い分け

- 通常サイト: 旧版
- GitHub / X など CSP が強いサイト: CSP版

## GitHub Pages 固定 URL

CSP版ローダは次を読み込みます。

- https://oharato.github.io/add-google-calender/csp-runner.js?v=3

## 4. GitHub Pages を有効化

1. GitHub リポジトリの Settings を開く
2. Pages を選択
3. Build and deployment の Source を GitHub Actions に設定
4. main へ push すると `.github/workflows/deploy-pages.yml` が `public/` を配信

公開 URL を変更した場合は `src/bookmarklet-csp-loader.js` を更新してください。
