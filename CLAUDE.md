# CLAUDE.md

## プロジェクト概要

ヘブンバーンズレッドのやりこみ状況を管理する個人用トラッカーアプリ。
Web（デスクトップ・モバイルブラウザ）と React Native（ネイティブアプリ）の両方で動作させる。

**現在のフェーズ**: キャラクター一覧/スタイル図鑑を Python(FastAPI) + CSV + ローカルJSON で実装済み。
他カテゴリ（メインストーリー等）は引き続きプレースホルダのまま → 同様の実データ化とクラウド永続化が次のステップ

---

## 最重要: データの信頼性について

**現在コードに入っているゲームデータはすべて架空のサンプルです。**

会話の中でAIが生成したもので、実際のゲーム内容とは一致しません。以下は特に信用しないでください。

- スタイル名、イベント名、称号バッジ名、楽曲名 → すべて架空
- 章ごとの「Day 1-14」等の日数 → 架空
- 「SSスタイル130種以上」「称号バッジ200種以上」「47キャラ」等の総数 → 未検証
- キャラクター名 → 未検証

現在は `キャラA` `サンプルイベント1` 等のプレースホルダに置き換え済みです。
実装時は公式サイト・攻略Wiki、またはプレイヤー本人の情報で埋めてください。

---

## 要件

### 管理対象コンテンツ（8カテゴリ）

1. メインストーリークリア状況
2. ストーリーイベントクリア状況
3. 交流クリア状況
4. メモリーストーリークリア状況
5. スタイル保有状況
6. スタイル強化状況（限界突破・レベル・スキルレベル）
7. 称号バッジ取得状況
8. ライブクリア状況

### 決定済みの方針

| 項目 | 決定内容 |
|---|---|
| プラットフォーム | モバイル + デスクトップ両対応 |
| データ保存 | クラウド（未実装、Firebase 検討中） |
| 共有機能 | 一旦なし（将来的な拡張余地は残す） |
| デザイン方向性 | ゲーミングな見た目 |
| カラー | 背景: 白 → うすピンクのグラデーション / 基調色: #AD2155 |
| アニメーション | もりもり（多用する方針） |
| レイアウト | カテゴリごとのタブ分け |

---

## デザイン仕様

### カラーパレット

```
基調色       #AD2155
アクセント   #ff69b4 (ホットピンク)
背景         linear-gradient(135deg, #ffffff 0%, #ffe0ec 50%, #ffc0d9 100%)
カード背景   rgba(255,255,255,0.9) → rgba(255,240,248,0.9)
```

レアリティ枠色（スタイルカード）:

- SS: `#ffd700` (ゴールド)
- S: `#c0c0c0` (シルバー)
- A: `#cd7f32` (ブロンズ)

### フォント

- 見出し: Orbitron (700/900)
- 本文: Noto Sans JP (400/700)
- Google Fonts から `@import` で読み込み

### アニメーション一覧

| 名前 | 用途 |
|---|---|
| `float` | 背景パーティクル（50個、ランダムな遅延・持続時間） |
| `glow` | ヘッダータイトルのドロップシャドウ明滅 |
| `rotate` | プログレスカード背景の conic-gradient 回転 |
| `shimmer` | プログレスバーのグロー明滅 |
| `fadeInUp` | タブコンテンツ切り替え時 |
| `checkPulse` | チェックボックス ON 時のスケール |
| `completionPulse` | チェック時の波紋エフェクト |
| `completionGlow` | セクション 100% 達成時のカード発光 |

### タブ構成

```
ダッシュボード / メインストーリー / イベント / 交流・メモリー
/ スタイル管理 / 称号バッジ / ライブ・バトル
```

---

## 現在のファイル構成

リポジトリ内で `backend/`（Python/FastAPI）と `frontend/`（Web版・RN版）を分離している。
外部に別プロジェクトを作らず、このリポジトリだけで両方完結させる方針。

```
backend/app/main.py             FastAPIバックエンド（/api/characters, /api/styles, PATCH progress, 画像/静的配信）
backend/app/csv_loader.py        backend/data/characters.csv 読み込み（キャラ/スタイルのマスタデータ）
backend/app/progress_store.py    所持/凸数の永続化（backend/data/progress.json）
backend/data/characters.csv     キャラクター/スタイルのマスタデータ（CSVをDB代わりに使用、直接編集可）
backend/data/progress.json      所持/凸数（gitignore対象、実行時に自動生成）
backend/images/                 キャラ/スタイル画像（.envのIMAGES_DIRで変更可、gitignore対象）
backend/requirements.txt        Pythonの依存パッケージ（uv pip install -r で導入。pyproject.tomlは使わない）
backend/.env.example            環境変数のテンプレート（IMAGES_DIR）
frontend/web/index.html         Web版マークアップ（タブnav + tab-content枠）。backendのFastAPIが配信する
frontend/web/styles.css         全スタイル（アニメーション含む）
frontend/web/script.js          既存カテゴリ（メインストーリー等）: gameData + 動的DOM生成 + 進捗計算
frontend/web/characters.js      キャラクター一覧・スタイル図鑑: API連携・所持/凸数の更新
frontend/mobile/                React Native版（Expo, expo-linear-gradient 使用）。
                                 npx create-expo-app でスキャフォールドした単体のExpoプロジェクト
                                 （frontend/mobile/App.js がエントリ、node_modules等はgitignore対象）。
                                 キャラ一覧機能は未反映
```

キャラクター一覧・スタイル図鑑は `gameData` を使わず、CSVを唯一のマスタデータ源としてAPI経由で取得する
（詳細は下記「キャラクター一覧・スタイル図鑑機能」を参照）。他カテゴリは従来通り `gameData` ベース。

バックエンドは `cd backend && uvicorn app.main:app --reload` で起動する
（`backend/app/main.py` のパス計算は `backend/` を基準にしており、フロントは `../frontend/web` を配信する）。

### データ構造（`gameData`）

frontend/web/script.js と frontend/mobile/App.js で同一構造を重複定義している（要共通化）。

```javascript
const gameData = {
  mainStory:    [{ id, name, completed }],
  events:       [{ id, name, type, completed }],        // type: seasonal | story | collaboration
  styles:       [{ id, character, name, rarity, lb, maxLb, completed }],  // rarity: SS | S | A
  interactions: [{ id, character, name, completed }],
  memories:     [{ id, character, name, completed }],
  badges:       [{ id, name, category, completed }],    // category: story | battle | collection
  battles:      [{ id, name, type, completed }],        // type: live | arena | dungeon
};
```

### Web版の処理フロー

```
DOMContentLoaded
  → createParticles()          パーティクル50個生成
  → generateContentFromData()  gameDataからHTML文字列を組み立てて innerHTML 注入
  → initTabs()                 タブのクリックハンドラ登録
  → initCheckboxes()           チェックリストのクリックハンドラ登録
  → updateProgress()           ダッシュボードのプログレスバー初期計算
```

進捗計算は DOM の `.checklist-item.completed` を数える方式。gameData 側は更新されない。

### React Native版

- `useState` で `data` を保持し、`toggleItem(id)` で該当 id をトグル（イミュータブル更新）
- `ProgressBar` / `ChecklistItem` をコンポーネント分離済み
- `Animated` API でプログレスバー幅とタップ時スケールをアニメーション

### キャラクター一覧・スタイル図鑑機能

- データフロー: `backend/data/characters.csv`（マスタ） + `backend/data/progress.json`（所持/凸数）→
  `backend/app/main.py` がマージして `/api/characters`（キャラ単位に集約）・`/api/styles`（CSV行単位）で返す →
  `frontend/web/characters.js` が fetch して描画。
- ID生成: スタイルIDは `md5(キャラ名（CV含む）+スタイル名+リリース日)` の先頭12文字（`backend/app/csv_loader.py: make_style_id`）。
  キャラIDはCV表記（`（CV ○○）`）を正規表現で除去したキャラ名そのもの（`strip_cv`）。
- 所持/凸数はスタイル単位で管理（`owned: bool`, `limitBreak: 0〜5`）。`PATCH /api/styles/{id}/progress` で更新、
  `owned=false` にすると凸数は自動的に0へ、`limitBreak>0` にすると自動的に `owned=true` になる。
- 画像は `backend/.env` の `IMAGES_DIR`（デフォルト `backend/images/`）配下を `/images/` としてそのまま静的配信。命名規則:
  `images/characters/<キャラ名（CV除く）>.png`、`images/styles/<キャラ名>_<スタイル名>.png`。
  未配置時はフロント側 `onerror` でプレースホルダー（頭文字アイコン）に自動フォールバックする。
- CSVを直接編集すれば新しいキャラ/スタイルを追加できる（サーバー再起動不要、リクエストの度に読み直す）。
  `progress.json` は別ファイルなので、CSV更新で所持/凸数が消えることはない。

---

## 既知の課題

### 優先度: 高

1. **データが永続化されない**（キャラクター一覧・スタイル図鑑は解決済み） — `backend/data/progress.json` に保存されるようになった。
   ただしメインストーリー等の他カテゴリは依然リロードで初期値に戻る。クラウド保存（マルチデバイス同期）は未実装。
2. **Web版の状態管理が DOM 依存**（他カテゴリのみ残存） — メインストーリー等はチェック状態が `gameData` に反映されない。
   キャラクター一覧・スタイル図鑑はAPI（サーバー側の`progress.json`）を単一の状態ソースとして解決済み。
3. **`gameData` が2箇所に重複** — script.js と App.js。共通モジュール（例: `data/gameData.js`）へ切り出す。
   （キャラクター一覧・スタイル図鑑はCSV+APIに一本化したためこの問題の対象外）
4. **ダッシュボードのカードマッピングが `nth-child` セレクタ依存** — カード順を変えると壊れる。`data-category` 属性等に変更すべき。

### 優先度: 中

5. **ゲームデータがプレースホルダ**（キャラクター一覧・スタイル図鑑は実データ化済み） — 他カテゴリは引き続き実データの投入が必要。
6. **スタイル強化の管理粒度が粗い** — キャラクター一覧・スタイル図鑑では所持+凸数(0〜5)を導入したが、
   レベル、リバージョン、スキルレベル（通常/EX）はまだ未対応。
7. **交流・メモリーが1レコード1キャラ** — エピソード単位・記憶修復段階での管理になっていない。
8. **称号バッジのランク管理** — `rank` / `maxRank` フィールドとして持たせるべき。

### 優先度: 低

9. Web版に認証・ユーザー分離の概念がない
10. インポート/エクスポート機能なし
11. デイリー/ウィークリータスク管理は未着手

---

## 次のステップ: バックエンド接続

バックエンドフレームワークは選定中。Firebase を第一候補として提示済み（未決定）。

| 候補 | 特徴 |
|---|---|
| Firebase | Firestore + Auth 内蔵、オフライン対応、無料枠、セットアップが最速 |
| Supabase | PostgreSQL ベース、リアルタイム、OSS、SQL が書ける |
| Node.js + Express | 自前構築、カスタマイズ性は高いが工数増 |

### 想定スキーマ（Firestore の場合）

```
users/{uid}
  └── progress/{category}
        └── items: { [itemId]: { completed: boolean, updatedAt, ...詳細フィールド } }

master/  （全ユーザー共通のマスタデータ）
  ├── styles/{styleId}
  ├── events/{eventId}
  └── badges/{badgeId}
```

ユーザー進捗（`users/`）とゲームマスタ（`master/`）を分離すると、ゲーム更新時にマスタだけ差し替えられる。

---

## ユーザー背景

- Python がメイン（2018年〜）、Next.js/TypeScript の経験あり
- 抽象的な依頼をすることが多い → 前提条件をおさらいしてから進めると良い
- 開発機は M1 Mac (64GB)

---

## 作業上の注意

- やり取りは日本語
- Web版はアロー関数・テンプレートリテラルを避けた記述になっている（過去のエラー対応の名残）。ファイル分割済みなので、モダン構文に戻して問題ない
- `frontend/web/index.html` のダッシュボード初期値は `0%` / `-` にしてある。`updateProgress()` が起動時に実データで上書きする
