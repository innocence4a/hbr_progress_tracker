# Heaven Burns Red Progress Tracker

ヘブンバーンズレッドのやりこみ状況を管理する個人用トラッカー。
Web版（Python/FastAPIバックエンド + 静的フロント）とReact Native版（Expo）の
2構成があり、それぞれ独立して起動します。**すべてこのリポジトリの中だけで完結します**
（外部に別プロジェクトを作る必要はありません）。

> **注意**: メインストーリー/イベント/称号バッジ等はまだ架空のプレースホルダです。
> キャラクター一覧・スタイル図鑑のみ `backend/data/characters.csv` の実データを使います。
> 詳細は `CLAUDE.md` の「データの信頼性について」を参照してください。

---

## ファイル構成

バックエンド（Python/FastAPI）とフロントエンド（Web版・RN版）をリポジトリ内で分けています。

```
backend/                 Python/FastAPI バックエンド
  app/
    main.py                 APIエンドポイント・静的ファイル/画像配信
    csv_loader.py            data/characters.csv の読み込み（マスタデータ）
    progress_store.py        所持/凸数の永続化（data/progress.json）
  data/
    characters.csv          キャラクター/スタイルのマスタデータ（CSVをDB代わりに使用）
    progress.json            所持/凸数の進捗（gitignore対象、実行時に自動生成）
  images/                  キャラクター/スタイル画像を置く場所（.envで変更可、gitignore対象）
  requirements.txt        Pythonの依存パッケージ
  .env.example             環境変数のテンプレート（IMAGES_DIR）

frontend/
  web/                    Web版フロントエンド（backendのFastAPIが配信する）
    index.html               マークアップ
    styles.css                スタイル（アニメーション含む）
    script.js                  既存カテゴリ（メインストーリー等）のロジック
    characters.js               キャラクター一覧・スタイル図鑑のロジック（API連携）
  mobile/                 React Native版（Expo）。単体のExpoプロジェクトとして完結

CLAUDE.md               プロジェクト仕様・既知の課題
README.md               このファイル
```

---

## Web版の起動

キャラクター一覧・スタイル図鑑を含めて動かすには、Pythonバックエンド（FastAPI）の起動が必要です。
仮想環境・依存インストールには [uv](https://docs.astral.sh/uv/) を使います
（`pyproject.toml` / `uv.lock` は使わず、依存管理は `requirements.txt` で行う方針）。
事前に `uv` がインストール済みであることが前提です（未導入の場合は公式ドキュメントの手順に従ってください）。

**コマンドはすべて `backend/` ディレクトリの中で実行します。**

```bash
cd backend

# 1. 仮想環境を作成する（backend/.venv/ を作成。指定したPythonが無ければuvが自動取得する）
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

ブラウザで `http://localhost:8000` を開きます。`frontend/web/` の静的ファイル（index.html等）は
`backend/app/main.py` がまとめて配信するので、`frontend/web/index.html` を直接 `open` しても動きません
（APIサーバーが必要なため）。

抜けるときは `deactivate`。次回以降は `cd backend` → `source .venv/bin/activate` →
`uvicorn app.main:app --reload` だけで再開できます
（`backend/.venv/` は `.gitignore` 対象なので、cloneし直した場合は手順1からやり直してください）。

### 依存パッケージを追加したいとき

```bash
# backend/ で、有効化した状態で実行
uv pip install <パッケージ名>
uv pip show <パッケージ名> | grep Version
# requirements.txt の末尾に手で追記する（例: <パッケージ名>==<確認したバージョン>）
```

環境を `requirements.txt` に完全一致させたい場合（削除も反映したい場合）は
`uv pip install -r requirements.txt` の代わりに `uv pip sync requirements.txt` を使います。

### 画像を表示したい場合

`backend/.env` の `IMAGES_DIR`（デフォルト `./images` = `backend/images/`）配下に、
以下の命名規則で画像ファイルを置きます。

```
images/characters/<キャラ名（CV表記を除く）>.png   例: images/characters/水瀬いちご.png
images/styles/<キャラ名>_<スタイル名>.png            例: images/styles/茅森月歌_Glorious Blades.png
```

画像が無い場合は自動的にプレースホルダー（頭文字アイコン）が表示されます。

### キャラクター/スタイルデータを更新したい場合

`backend/data/characters.csv` を直接編集してください（Excel/スプレッドシートで開いてもOK）。
列の意味は1行目のヘッダーの通りです。サーバーを再起動しなくても、次のAPIリクエスト時に
最新のCSVが読み込まれます。所持/凸数の記録（`backend/data/progress.json`）はCSVとは別ファイルなので、
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
  オフラインで使う場合は `frontend/web/styles.css` 冒頭の `@import` を削除してください。
  フォントがシステムフォントにフォールバックしますが、機能には影響しません。

---

## React Native版の起動

`frontend/mobile/` は最初から `npx create-expo-app` でスキャフォールドされた、単体で動く
Expoプロジェクトです。**このリポジトリの外に別プロジェクトを作る必要はありません。**

### 前提

- Node.js（LTS推奨。バージョンが新しすぎる/古すぎるとExpo CLIの警告が出ることがあります）
- iOS/Androidの実機、またはシミュレータ
- **グローバルインストールした `expo-cli` は使いません**（2023年以降廃止・非推奨。
  `npm ls -g --depth=0` で `expo-cli` が出てくる場合は `npm uninstall -g expo-cli` で削除しておくと事故りません）
- 以降のコマンドはすべて `npx expo ...` の形（プロジェクトごとのローカルCLIを都度取得して実行）で統一します

### 手順

```bash
cd frontend/mobile

# 1. 依存パッケージをインストール（node_modules/ は .gitignore 対象）
npm install

# 2. 起動
npx expo start
```

起動後、ターミナルに表示されるQRコードを Expo Go アプリで読み取るか、
`i`（iOSシミュレータ）/ `a`（Androidエミュレータ）/ `w`（Web）を押します。

### うまくいかない場合

- **`This version of expo-cli is not supported anymore` / `You can create a new project with expo init` と出る**
  → 古いグローバル `expo-cli` が実行されています。`npx expo start` のように必ず `npx expo` の形で実行してください
  （`expo start` のようにグローバルコマンドで実行しない）。上記「前提」の手順で `expo-cli` をアンインストールするのが確実です。
- **`No managed or bare projects found. Please make sure you are inside a project folder.` と出る**
  → `frontend/mobile` の中（`package.json` がある場所）でコマンドを実行しているか確認してください。
  リポジトリのルートや `backend/` で `expo`/`npx expo` を実行しても動きません。
- **Node.jsのバージョン非対応の警告が出る**
  → 一旦は無視して動作するか確認してOKです。動かない場合は Node.js の LTS版（`nvm install --lts` 等）に切り替えてから
  やり直してください。

### 動作確認のポイント

1. ヘッダーのグラデーションが表示されるか（`expo-linear-gradient` が入っていないと落ちます）
2. タブを横スクロールして切り替えられるか
3. 項目をタップしてチェックが付き、ダッシュボードの数値が変わるか

### 既知の制約

- Web版と同様、**アプリを再起動するとチェック状態がリセットされます**
- `gameData` が Web版と重複定義されています（`CLAUDE.md` の課題3参照）
- キャラクター一覧・スタイル図鑑（Web版で追加した機能）はまだRN版に反映されていません

---

## 次のステップ

- キャラクター一覧・スタイル図鑑は Python(FastAPI) + `backend/data/characters.csv` +
  `backend/data/progress.json` でローカル永続化されました。他のカテゴリ（メインストーリー等）は未着手のままです。
- React Native版へのキャラクター一覧・スタイル図鑑の反映は未着手です。
- クラウド保存（マルチデバイス同期）は未実装です。バックエンドは選定中で、
  Firebase / Supabase を候補として検討しています。今回のローカルJSON(`backend/data/progress.json`)は
  将来的に `users/{uid}/progress/styles` のようなコレクションへ差し替える想定です。
  想定スキーマは `CLAUDE.md` の「次のステップ: バックエンド接続」に記載しています。
