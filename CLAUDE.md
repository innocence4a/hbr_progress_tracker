# CLAUDE.md

## プロジェクト概要

ヘブンバーンズレッドのやりこみ状況を管理する個人用トラッカーアプリ。
Web（デスクトップ・モバイルブラウザ）と React Native（ネイティブアプリ）の両方で動作させる。

**現在のフェーズ**: プロトタイプ完成 → バックエンド接続とデータ整備が次のステップ

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

```
index.html    Web版マークアップ（タブnav + 空のtab-content枠）
styles.css    全スタイル（アニメーション含む）
script.js     gameData + 動的DOM生成 + 進捗計算
App.js        React Native版（Expo, expo-linear-gradient 使用）
```

### データ構造（`gameData`）

script.js と App.js で同一構造を重複定義している（要共通化）。

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

---

## 既知の課題

### 優先度: 高

1. **データが永続化されない** — リロードで初期値に戻る。クラウド保存が未実装。
2. **Web版の状態管理が DOM 依存** — チェック状態が `gameData` に反映されない。単一の状態ソースへ寄せる必要がある。
3. **`gameData` が2箇所に重複** — script.js と App.js。共通モジュール（例: `data/gameData.js`）へ切り出す。
4. **ダッシュボードのカードマッピングが `nth-child` セレクタ依存** — カード順を変えると壊れる。`data-category` 属性等に変更すべき。

### 優先度: 中

5. **ゲームデータがプレースホルダ** — 実データの投入が必要（冒頭の注意を参照）。
6. **スタイル強化の管理粒度が粗い** — `lb`/`maxLb` のみ。レベル、リバージョン、スキルレベル（通常/EX）が未対応。
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
- `index.html` のダッシュボード初期値は `0%` / `-` にしてある。`updateProgress()` が起動時に実データで上書きする
