# Podcast Agent — Kanban

> 進捗はこのボードを正本として更新する。詳細な作業手順は `../TASKS.md`、区切りと成果物は `../plan/README.md` を参照。

## ボードの運用ルール

- **Stage** = 大きな開発ゲート／成果物単位
- **Tier** = 機能の成熟度・依存レベル
- **Phase** = 実装の順序
- **Card** = `TASKS.md` のT番号。カードを動かすときはTASKS側も同期する。
- 一度に進行中にするのは原則1タスク。前段階の受け入れ条件を満たしてから次Stageへ進む。

## Kanban

### BACKLOG

| Card | Stage | Tier | Phase | 内容 | 完了条件 |
|---|---|---|---|---|---|
| T12 | S4 Release | Tier 3: 安全性 | P4 | コンプライアンス確認 | 権利・出典・同意の確認結果を記録 |
| T13 | S4 Release | Tier 3: 安全性 | P4 | セキュリティレビュー | 認可・秘密情報・R2保護・削除を確認 |
| T14 | S4 Release | Tier 3: 品質 | P4 | E2E・受け入れテスト | 主要フローと失敗系を検証 |
| T15 | S4 Release | Tier 3: 配備 | P4 | Cloudflareデプロイ | 公開URLで動作確認 |

### READY

| Card | Stage | Tier | Phase | 内容 | 完了条件 |
|---|---|---|---|---|---|
| T01 | S1 Core | Tier 1: 基盤 | P0 | アプリ骨格 | ローカル起動・型チェック・テストが動く |
| T02 | S1 Core | Tier 1: UI | P0 | 基本画面 | 一覧・作成・詳細が操作できる |
| T03 | S1 Core | Tier 1: 永続化 | P1 | D1 CRUD | エピソードの作成・取得・更新・削除が通る |
| T04 | S1 Core | Tier 1: 台本 | P1 | 3分台本エディター | 台本を編集・保存・再読込できる |
| T05 | S1 Core | Tier 1: AI | P1 | 台本生成 | 構造化出力を検証し、失敗時に手動編集できる |

### IN PROGRESS

| Card | Stage | Tier | Phase | 内容 | 完了条件 |
|---|---|---|---|---|---|
| — | — | — | — | 現在進行中のカードなし | 作業開始時に1件だけ移動 |

### REVIEW / VERIFY

| Card | Stage | Tier | Phase | 内容 | 完了条件 |
|---|---|---|---|---|---|
| — | — | — | — | レビュー待ちなし | 実装・テスト・ブラウザ確認を実施 |

### DONE — 仕様化

| Card | Stage | Tier | Phase | 内容 | 完了条件 |
|---|---|---|---|---|---|
| SPEC-01 | S0 Definition | Tier 0: 仕様 | P0 | MVP仕様・スコープ | READMEに目的、範囲、受け入れ条件を記載 |
| SPEC-02 | S0 Definition | Tier 0: 仕様 | P0 | 開発タスク分解 | TASKS.mdにT01〜T15を記載 |
| SPEC-03 | S0 Definition | Tier 0: 仕様 | P0 | データモデル・責務 | CONTEXT.mdにスキーマと役割を記載 |
| SPEC-04 | S0 Definition | Tier 0: ルール | P0 | AI開発ルール | CLAUDE.mdに実装・検証ルールを記載 |

### NEXT UP

1. T01 — 最小アプリの骨格
2. T02 — 画面の基本導線
3. T03 — D1 CRUD
4. T04 — 台本エディター
5. T05 — 台本生成

## Stage Gate

- S0 → S1: README / CONTEXT / TASKS / CLAUDE が揃っている
- S1 → S2: エピソード作成から台本保存・再読込まで動作する
- S2 → S3: 人間録音とAIホスト音声を保存し、再生できる
- S3 → S4: 編集済み音声をファイルとしてダウンロードできる
- S4 → Done: セキュリティ・受け入れテストを通過し、Cloudflare上で確認できる

## 更新手順

1. カードの状態をこのファイルで変更する。
2. `TASKS.md` のチェック状態と矛盾がないか確認する。
3. Stage gateを満たしたら次Stageへ進める。
