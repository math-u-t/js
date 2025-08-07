# `import.js` ドキュメント[v1.0.0]

## 目次
- [`import.js` ドキュメント](#importjs-ドキュメント)
  - [概要](#概要)
  - [特徴](#特徴)
  - [使い方](#使い方)
    - [スクリプトの読み込み(CDN)](#スクリプトの読み込み(CDN))
    - [コンテンツの読み込み](#コンテンツの読み込み)
  - [Markdown の対応機能](#Markdown-の対応機能)
    - [数式記法例](#数式記法例)
  - [CSS スタイルの自動読み込み](#CSS-スタイルの自動読み込み)
  - [エラーハンドリング](#エラーハンドリング)
  - [サンプル構成](#サンプル構成)
  - [開発者向けメモ](#開発者向けメモ)
  - [既知の制限](#既知の制限)
  - [今後の追加予定機能](#今後の追加予定機能)

## 概要

`import.js` は、HTML ドキュメント内で `<import src="...">` タグを使用することで、Markdown や HTML ファイルをクライアントサイドで動的に読み込める JavaScript スクリプトです。

読み込んだコンテンツは整形されてページ内に挿入され、必要な CSS やライブラリも自動的に適用されます。

## 特徴

- **Markdown レンダリング対応**
  `markdown-it` と複数のプラグインにより、高機能な Markdown 表現が可能です。

- **HTML のインライン読み込み**
  `.html` ファイルも同様に `<import>` タグで読み込めます。

- **スタイル自動読み込み**
  `style.css` や `markdown.css` を自動で読み込み、見た目を整えます。

- **循環参照の検出**
  同一ソースの多重読み込みを防止します。

## 使い方

### スクリプトの読み込み(CDN)

HTML の `<head>` 内に次のように記述してください。

```html
<script src="https://math-u-t.github.io/src/import.js" defer></script>
```

### コンテンツの読み込み

読み込みたい場所に以下のように `<import>` タグを記述します。

```html
<import src="content.md"></import>
<import src="component.html"></import>
```

`.md`(Markdown)および `.html` ファイルがサポートされています。

## Markdown の対応機能

読み込まれた Markdown は `markdown-it` によって以下の拡張機能付きでレンダリングされます。

- `markdown-it-footnote`: 脚注記法
- `markdown-it-task-lists`: チェックリスト
- `markdown-it-emoji`: 絵文字(例: `:smile:`)
- `markdown-it-deflist`: 定義リスト
- **MathJax(v3)対応**: 数式レンダリング(TeX 記法)

### 数式記法例

```markdown
これはインライン数式です: \( E = mc^2 \)

これはブロック数式です:

\[
\int_0^1 x^2 \, dx = \frac{1}{3}
\]
```

## CSS スタイルの自動読み込み

以下の CSS ファイルを自動で読み込みます。

- `markdown.css`
  Markdown 用スタイル。読み込み優先順。

  1. ローカルの `markdown.css`
  2. Fallback CDN

     ```
     https://math-u-t.github.io/marh-u-t/src/markdown.css
     ```

- `style.css`
  ページ全体のスタイル。存在しない場合は警告を表示します(致命的エラーにはなりません)。

## エラーハンドリング

- ファイルの読み込みに失敗した場合、該当箇所に赤いエラーメッセージを表示します。
- 循環参照(同一ファイルの多重読み込み)は自動的に検出・防止されます。

## サンプル構成

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>インポートデモ</title>
  <script src="https://math-u-t.github.io/src/import.js" defer></script>
</head>
<body>
  <import src="intro.md"></import>
  <import src="section1.html"></import>
  <import src="details.md"></import>
</body>
</html>
```

## 開発者向けメモ

- 依存ライブラリはすべて `jsDelivr` 経由で読み込まれます。
- MathJax は v3 の `tex-mml-chtml.js` を使用。
- 読み込み履歴は JavaScript の `Set` により管理し、循環参照を防止します。

## 既知の制限

- `<import>` はカスタム要素ではないため、一部のブラウザで警告が表示される可能性があります(表示には影響なし)。
- `markdown.css` が適切に読み込まれないと Markdown の見た目が崩れます。
- サーバーサイド構成は不要(完全クライアントサイドで動作)。
- 小規模なモジュール型ドキュメントやコンポーネントの構築に最適。

## 今後の追加予定機能

<details><summary>キャッシュ機能(同一セッション内)</summary>

### 課題

同一ファイルを複数箇所で読み込むたびに `fetch()` が発生。

### 解決策

`Map<string, DocumentFragment>` によるキャッシュを導入し、以後は複製して挿入。

### メリット

- パフォーマンス向上
- ネットワーク負荷の削減

</details>

<details><summary>読み込み完了イベントの発火</summary>

### 機能

すべての `<import>` 処理が完了後、以下のようにカスタムイベントを発火。

```javascript
window.addEventListener("import:ready", () => {
  console.log("すべてのimportが完了しました！");
});
```

### 利点

読み込み後の処理(アニメーションや初期化など)を外部から制御可能。

</details>

<details><summary>外部スクリプトの自動実行</summary>

### 課題

読み込んだ HTML に含まれる `<script>` タグが実行されない。

### 解決策

挿入後に `contentFragment.querySelectorAll("script")` を走査して手動実行。

### 注意

XSS 対策のため、信頼できるソースのみを使用してください。

</details>

<details><summary>読み込み失敗時のリトライ機能</summary>

### 機能

読み込みに失敗した場合、数秒後に自動で再試行(最大リトライ回数を設定可能)。

### 利点

一時的なネットワーク障害への耐性強化。

</details>

<details><summary>ダークモード自動対応</summary>

### 機能

`prefers-color-scheme: dark` を検知して、`markdown-dark.css` を自動切り替え。

### 利点

現代的な UI に対応し、Markdown の可読性も向上。

</details>

<details><summary>画像の遅延読み込み(lazy loading)</summary>

### 機能

Markdown 内の画像タグに `loading="lazy"` を自動追加。

### メリット

パフォーマンス最適化、特に画像の多いページで効果的。

</details>

<details><summary>ローディング表示</summary>

### 機能

読み込み中の `<import>` タグにローディングメッセージやスピナーを表示。

```html
<import src="article.md" loading="読み込み中です..."></import>
```

### 利点

UX 向上と非同期処理の視覚的フィードバックを提供。

</details>

<details><summary>Markdown レンダリング設定のカスタマイズ</summary>

### 機能

`window.markdownitOptions` を定義することでオプションをカスタマイズ可能。

```javascript
window.markdownitOptions = {
  html: false,
  linkify: false
};
```

### 利点

セキュリティポリシーや要件に応じた柔軟な制御が可能。

</details>