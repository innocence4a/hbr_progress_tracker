# Heaven Burns Red Progress Tracker

ヘブンバーンズレッドのやりこみ状況を管理する個人用トラッカー。
Web版（Python/FastAPIバックエンド + 静的フロント）とReact Native版（Expo）の
2構成があり、それぞれ独立して起動します。

> **注意**: メインストーリー/イベント/称号バッジ等はまだ架空のプレースホルダです。
> キャラクター一覧・スタイル図鑑のみ `data/characters.csv` の実データを使います。
> 詳細は `CLAUDE.md` の「データの信頼性について」を参照してください。

---

## ファイル構成

```
app/                    FastAPIバックエンド
  main.py                 APIエンドポイント・静的ファイル/画像配信
  csv_loader.py            data/characters.csv の読み込み（マスタデータ）
  progress_store.py        所持/凸数の永続化（data/progress.json）
data/
  characters.csv          キャラクター/スタイルのマスタデータ（CSVをDB代わりに使用）
  progress.json            所持/凸数の進捗（gitignore対象、実行時に自動生成）
static/                 Web版フロントエンド
  index.html               マークアップ
  styles.css                スタイル（アニメーション含む）
  script.js                  既存カテゴリ（メインストーリー等）のロジック
  characters.js               キャラクター一覧・スタイル図鑑のロジック（API連携）
images/                 キャラクター/スタイル画像を置く場所（.envで変更可、gitignore対象）
App.js                  React Native版のコンポーネント（単体では動きません／後述）
requirements.txt        Pythonの依存パッケージ
.env.example            環境変数のテンプレート（IMAGES_DIR）
CLAUDE.md               プロジェクト仕様・既知の課題
README.md               このファイル
```

---

## Web版の起動

キャラクター一覧・スタイル図鑑を含めて動かすには、Pythonバックエンド（FastAPI）の起動が必要です。
このプロジェクトはローカルのPython環境のみで完結させる方針とし、仮想環境・依存インストールには
[uv](https://docs.astral.sh/uv/) を使います（`pyproject.toml` / `uv.lock` は使わず、
依存管理は従来どおり `requirements.txt` で行います）。事前に `uv` がインストール済みであることが前提です
（未導入の場合は公式ドキュメントの手順に従ってください）。

```bash
# 1. 仮想環境を作成する（.venv/ を作成。指定したPythonが無ければuvが自動取得する）
uv venv --python 3.13

# 2. 有効化
source .venv/bin/activate   # Windowsは .venv\Scripts\activate

# 3. 依存パッケージをインストール
uv pip install -r requirements.txt

# 4. .env を用意する（画像フォルダのパスを指定）
cp .env.example .env
# 必要に応じて .env の IMAGES_DIR を編集

# 5. サーバー起動
uvicorn app.main:app --reload
```

ブラウザで `http://localhost:8000` を開きます（`index.html` 等の静的ファイルも
このサーバーが配信します。ファイルを直接 `open` しても動きません＝APIが必要なため）。

抜けるときは `deactivate`。次回以降は `source .venv/bin/activate` → `uvicorn app.main:app --reload`
だけで再開できます（`.venv/` は `.gitignore` 対象なので、cloneし直した場合は手順1からやり直してください）。

### 依存パッケージを追加したいとき

```bash
# 1. 有効化した状態でインストール
uv pip install <パッケージ名>

# 2. 入ったバージョンを確認
uv pip show <パッケージ名> | grep Version

# 3. requirements.txt の末尾に手で追記する（例）
#    <パッケージ名>==<確認したバージョン>
```

環境を `requirements.txt` に完全一致させたい場合（削除も反映したい場合）は
`uv pip install -r requirements.txt` の代わりに `uv pip sync requirements.txt` を使います。

### 画像を表示したい場合

`IMAGES_DIR`（デフォルト `./images`）配下に、以下の命名規則で画像ファイルを置きます。

```
images/characters/<キャラ名（CV表記を除く）>.png   例: images/characters/水瀬いちご.png
images/styles/<キャラ名>_<スタイル名>.png            例: images/styles/茅森月歌_Glorious Blades.png
```

画像が無い場合は自動的にプレースホルダー（頭文字アイコン）が表示されます。

### キャラクター/スタイルデータを更新したい場合

`data/characters.csv` を直接編集してください（Excel/スプレッドシートで開いてもOK）。
列の意味は1行目のヘッダーの通りです。サーバーを再起動しなくても、次のAPIリクエスト時に
最新のCSVが読み込まれます。所持/凸数の記録（`data/progress.json`）はCSVとは別ファイルなので、
CSVを更新しても消えません。

### 動作確認のポイント

1. 「キャラクター一覧」「スタイル図鑑」タブでカードが表示されるか
2. 所持チェック・凸数（●）をクリックして状態が変わり、リロードしても保持されているか
3. 検索・絞り込みが効くか
4. 既存のタブ（ダッシュボード〜ライブ・バトル）が引き続き動作するか
5. DevTools のコンソールにエラーが出ていないか（画像未配置による404は想定内）

### 既知の制約

- メインストーリー等の既存カテゴリは**リロードするとチェック状態がリセットされます**（未着手）
- ネットワーク接続が必要です（Google Fonts を CDN から読み込むため）。
  オフラインで使う場合は `static/styles.css` 冒頭の `@import` を削除してください。
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

- キャラクター一覧・スタイル図鑑は Python(FastAPI) + `data/characters.csv` + `data/progress.json`
  でローカル永続化されました。他のカテゴリ（メインストーリー等）は未着手のままです。
- React Native版へのキャラクター一覧・スタイル図鑑の反映は未着手です。
- クラウド保存（マルチデバイス同期）は未実装です。バックエンドは選定中で、
  Firebase / Supabase を候補として検討しています。今回のローカルJSON(`data/progress.json`)は
  将来的に `users/{uid}/progress/styles` のようなコレクションへ差し替える想定です。
  想定スキーマは `CLAUDE.md` の「次のステップ: バックエンド接続」に記載しています。