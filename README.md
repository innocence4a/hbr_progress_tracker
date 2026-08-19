# Heaven Burns Red Progress Tracker

ヘブンバーンズレッドのやりこみ状況を管理する個人用トラッカー。
Web版とReact Native版（Expo）の2構成があり、それぞれ独立して起動します。

> **注意**: 現在コードに入っているゲームデータはすべて架空のプレースホルダです。
> 詳細は `CLAUDE.md` の「データの信頼性について」を参照してください。

---

## ファイル構成

```
index.html    Web版のマークアップ
styles.css    Web版のスタイル（アニメーション含む）
script.js     Web版のロジック（データ定義・DOM生成・進捗計算）
App.js        React Native版のコンポーネント（単体では動きません／後述）
CLAUDE.md     プロジェクト仕様・既知の課題
README.md     このファイル
```

---

## Web版の起動

### 方法1: ファイルを直接開く（最も簡単）

```bash
open index.html
```

`index.html` / `styles.css` / `script.js` の3つが同じディレクトリにあれば、
ブラウザで直接開くだけで動きます。ビルド不要、依存パッケージなし。

### 方法2: ローカルサーバー経由（推奨）

`file://` では将来的にモジュール化やfetchを入れたときに詰まるため、
開発中はサーバー経由のほうが無難です。

```bash
# Python
python3 -m http.server 8000

# または Node.js
npx serve .
```

ブラウザで `http://localhost:8000` を開きます。

### 動作確認のポイント

1. タブ（ダッシュボード〜ライブ・バトル）を切り替えて画面が変わるか
2. チェックリストの項目をクリックしてチェックが付くか
3. ダッシュボードに戻ってプログレスバーが更新されているか
4. DevTools のコンソールにエラーが出ていないか

### 既知の制約

- **リロードするとチェック状態がリセットされます**（永続化が未実装）
- ネットワーク接続が必要です（Google Fonts を CDN から読み込むため）。
  オフラインで使う場合は `styles.css` 冒頭の `@import` を削除してください。
  フォントがシステムフォントにフォールバックしますが、機能には影響しません。

---

## React Native版の起動

`App.js` は単体では動きません。Expoプロジェクトを作成し、その中に配置します。

### 前提

- Node.js（LTS推奨）
- iOS/Androidの実機、またはシミュレータ

### 手順

```bash
# 1. Expoプロジェクトを新規作成
npx create-expo-app@latest hbr-tracker
cd hbr-tracker

# 2. 依存パッケージを追加
npx expo install expo-linear-gradient

# 3. 生成された App.js を、このリポジトリの App.js で置き換える
#    （テンプレートによっては app/ 配下の構成になっている場合があります。
#     その場合は下記「ルーティング構成の場合」を参照）

# 4. 起動
npx expo start
```

起動後、ターミナルに表示されるQRコードを Expo Go アプリで読み取るか、
`i`（iOSシミュレータ）/ `a`（Androidエミュレータ）/ `w`（Web）を押します。

### ルーティング構成の場合

`create-expo-app` の最近のテンプレートは expo-router 構成（`app/` ディレクトリ）
で生成されることがあります。その場合は以下のいずれかで対応します。

- `app/index.tsx` の中身を `App.js` の内容に置き換える
  （`export default function App()` を `export default function Index()` にリネーム）
- またはテンプレート選択時に blank テンプレートを選ぶ

### 動作確認のポイント

1. ヘッダーのグラデーションが表示されるか（`expo-linear-gradient` が入っていないと落ちます）
2. タブを横スクロールして切り替えられるか
3. 項目をタップしてチェックが付き、ダッシュボードの数値が変わるか

### 既知の制約

- Web版と同様、**アプリを再起動するとチェック状態がリセットされます**
- `gameData` が Web版と重複定義されています（`CLAUDE.md` の課題3参照）

---

## 次のステップ

データの永続化（クラウド保存）が未実装です。バックエンドは選定中で、
Firebase / Supabase / Node.js + Express を候補として検討しています。
想定スキーマは `CLAUDE.md` の「次のステップ: バックエンド接続」に記載しています。