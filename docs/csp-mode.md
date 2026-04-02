# CSP版

## 方式

- Bookmarklet 本体は軽量ローダ
- ローダが GitHub Pages 上の csp-runner.js を script タグで読み込む
- 選択文字列は data 属性でランナーに受け渡す

## 配信運用

- 配信方式: Option A (GitHub Pages 固定)
- 配信 URL は恒久パスで運用
- 破壊的変更時のみ `?v=` を更新

## 注意点

- Firefox はページや設定により Bookmarklet の起動自体が制限される場合がある
- ランナー URL が無効な場合は動作しない
