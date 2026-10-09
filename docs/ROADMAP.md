# ROADMAP — Stage / Tier / Phase

## 用語
- **Stage:** 開発の大きなゲートと完了条件
- **Tier:** 機能の成熟度（Tier 0仕様、Tier 1基本フロー、Tier 2制作、Tier 3公開品質）
- **Phase:** 実装作業のまとまり
- **Task:** TASKS.mdのT01〜T15にある具体作業
- **Bolt:** 計画→質問→承認→実装→検証を行う短い作業単位

## Stageロードマップ

| Stage | Tier | Phase | 目的 | 完了ゲート |
|---|---|---|---|---|
| S0 Definition | Tier 0 Specification | P0 | 課題、MVP、受け入れ条件を定義 | MRD/PRD/MVP/POCをレビュー |
| S1 Core | Tier 1 Basic workflow | P0–P1 | エピソードと台本の保存・再開 | 作成→保存→再読込が通る |
| S2 Audio | Tier 2 Production | P2 | 人間の録音とAIホスト音声 | 両素材を再生できる |
| S3 Edit & Export | Tier 2 Production | P3 | 最小編集、プレビュー、書き出し | テスト音声を書き出せる |
| S4 Release | Tier 3 Release quality | P4 | セキュリティ、テスト、公開 | 受け入れ条件とスモークテスト通過 |
| S5 Validate | Tier 3 Product validation | P5 | 継続利用・顧客課題・価格を検証 | 証拠に基づき次の投資を判断 |

## Phase定義
- P0 Foundation: 環境、基本設計、品質基準
- P1 Planning & Script: エピソード管理、台本編集・保存
- P2 Recording & TTS: 録音、TTSアダプター、素材管理
- P3 Editing & Export: 非破壊編集、プレビュー、ミックス、ダウンロード
- P4 Hardening & Release: 認可、削除、テスト、エラー処理、デプロイ
- P5 Validation: 初期ユーザー、KPI、インタビュー、価格テスト

## 優先順位
1. POCでTTS、録音、ミックス・出力のリスクを確認。
2. エピソード→台本→人間録音→再生→ダウンロードの縦切りを成立させる。
3. TTSを統合し、品質・遅延・コストを測る。
4. 編集と永続化を完成させる。
5. セキュリティ、テスト、デプロイ。
6. 継続利用の証拠が出るまで、配信連携・高度編集・課金を先行実装しない。

## 成果物と判断
S0はMRD/PRD/MVP/POC、S1はエピソードUIと台本保存、S2は録音/TTS/素材管理、S3は編集と書き出し、S4はセキュリティ・CI・デプロイ、S5はKPIレポートとユーザー調査。Stage完了は文書の存在ではなく、動作・テスト・ユーザー価値の証拠で判断する。
