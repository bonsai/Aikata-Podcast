# Podcast Agent — 開発計画

## 階層の定義

| 軸 | 意味 | 使い方 |
|---|---|---|
| **Stage** | 大きな成果物と開発ゲート | 何が動けば次へ進めるか |
| **Tier** | 機能の成熟度・依存レベル | 仕様 → 基本機能 → 音声機能 → リリース品質 |
| **Phase** | 実装の順番 | TASKS.mdのタスクを実行する順序 |
| **Task** | 実際に着手する単位 | T01〜T15をKanbanで移動 |

Stage / Tier / Phase は別の軸。各タスクには3つの分類を付け、Kanbanで状態を管理する。

## Stage map

| Stage | 目的 | Tier | Phase | 主なタスク | Exit criteria |
|---|---|---|---|---|---|
| S0 Definition | 企画・仕様を確定 | Tier 0: 仕様 | P0 | SPEC-01〜04 | 文書とMVP範囲が確定 |
| S1 Core | 企画から台本保存まで | Tier 1: 基本機能 | P0–P1 | T01–T05 | エピソードと台本を保存・再読込 |
| S2 Audio | 人間録音とAIホスト音声 | Tier 2: 音声 | P2 | T06–T08 | 2種類の音声を保存・プレビュー |
| S3 Edit & Export | 編集して音声ファイルを出力 | Tier 2: 制作 | P3 | T09–T11 | 編集結果をプレビューしダウンロード |
| S4 Release | 安全性・テスト・公開 | Tier 3: リリース | P4 | T12–T15 | 受け入れ条件を満たしCloudflareで動作 |

## Tier definitions

- **Tier 0 — Specification:** アイデア、スコープ、データモデル、受け入れ条件。
- **Tier 1 — Core workflow:** アプリの骨格、画面、DB、台本。音声サービスがなくても進められる。
- **Tier 2 — Production workflow:** マイク録音、TTS、音声アセット、編集、書き出し。
- **Tier 3 — Release quality:** 権利・プライバシー、認可、障害処理、E2E、デプロイ。

## Phase definitions

- **P0 Foundation:** 実行環境、基本画面、開発コマンド。
- **P1 Planning:** D1、エピソード管理、3分台本、台本生成。
- **P2 Recording:** ブラウザ録音、TTS、音声アセット管理。
- **P3 Editing & Export:** トラック編集、ミックス、ダウンロード。
- **P4 Hardening & Release:** コンプライアンス、セキュリティ、E2E、Cloudflareデプロイ。

## Stage directories

- [S0 — Definition](./stages/stage-0-definition/README.md)
- [S1 — Core](./stages/stage-1-core/README.md)
- [S2 — Audio](./stages/stage-2-audio/README.md)
- [S3 — Edit & Export](./stages/stage-3-edit-export/README.md)
- [S4 — Release](./stages/stage-4-release/README.md)

## Source of truth

- Product and scope: [../README.md](../README.md)
- Task checklist: [../TASKS.md](../TASKS.md)
- Data model and decisions: [../CONTEXT.md](../CONTEXT.md)
- AI implementation rules: [../CLAUDE.md](../CLAUDE.md)
- Live board: [../kanban/README.md](../kanban/README.md)

Task execution order remains in TASKS.md. Board state is maintained in kanban/README.md. Do not duplicate detailed implementation instructions in stage folders.
