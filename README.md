# Google カレンダーへさくっと登録

選択範囲の日付情報を自動で読み取り、Google カレンダーの予定登録画面を開く Bookmarklet です。

## 説明

メール、Web ページ、SNS の文章にある日程を選択して実行するだけで、Google カレンダーの入力手間を減らせます。

- 旧版: 現在ページで直接解析
- CSP版: GitHub Pages 配信ランナーを利用して実行

詳細: docs/overview.md

## インストール

1. `npm run build`
2. `dist/legacy.bookmarklet.txt` または `dist/csp.bookmarklet.txt` をブックマーク URL に貼り付け
3. CSP版を使う場合は GitHub Pages を有効化して `public/csp-runner.js` を公開

詳細: docs/install.md

## テスト

- 自動: `npm test`
- 手動: docs/testing.md

## ヒストリー

- docs/history.md

## 戻る

- このリポジトリのトップへ戻る: README.md
