# Aikata Podcast — Kanban

最終更新: 2026-10-09

## Done
- [x] Cloudflare Workers AIをLLMプロバイダーにする
- [x] 設定を `config/aikata.yaml` に集約し、Zodで検証
- [x] Workers AI SDK（`workers-ai-provider` + `ai`）へ移行
- [x] Deepgram公式SDK（`@deepgram/sdk`）へ移行
- [x] APIキーはYAMLに直書きせず、環境変数名をYAMLで指定
- [x] SDKアダプターのモックテストを追加

## In Progress
- [ ] npm install / TypeScript / Vitest の実行結果を確認
- [ ] SDKとMastra Workflowの結合テスト
- [ ] Deepgramのリアルタイム音声対話/TTS
- [ ] 音声だけで工程を進めるUIの仕上げ

## Config
- YAML: `config/aikata.yaml`
- Secrets: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `DEEPGRAM_API_KEY`
- Optional config path: `AIKATA_CONFIG`

> コードを追加しただけではテスト合格扱いにしない。CIまたはローカルの実行結果を確認する。
