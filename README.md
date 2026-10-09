# Aikata Podcast

AIと漫才するように話しながら、シタガキメモ → 企画会議 → 収録へ進み、自分だけで聞き返せる番組を作るWebサービス。公開・配信は必須ではありません。

## ローカル起動

```sh
npm install
cp .env.example .env
# .env に Cloudflare / Deepgram の秘密情報を設定
npm run dev
```

ブラウザで http://127.0.0.1:8787 を開きます。

## 設定は YAML に集約

設定ファイル: [config/aikata.yaml](./config/aikata.yaml)

LLMモデルと生成設定、Deepgramモデルと言語、サーバーポート、プライバシー既定値をYAMLで管理します。秘密情報はYAMLに直書きせず、環境変数から読みます。YAML内の `*_env` は参照する環境変数名です。

## SDK

- **Cloudflare Workers AI**: `workers-ai-provider` + Vercel AI SDK `ai`
- **Deepgram**: 公式 `@deepgram/sdk`
- **Mastra**: 会話・企画・構成のワークフロー管理
- **yaml + Zod**: 設定読み込みと検証

## プライバシー

メモと録音はブラウザ内に保存されます。相方の返答では送信したメモと会話がWorkers AIへ送信されます。文字起こしを実行した場合のみ、選択した録音をDeepgramへ送信します。外部配信機能はありません。
