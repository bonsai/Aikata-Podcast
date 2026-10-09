# Aikata Podcast

AIと漫才するように話しながら、シタガキメモ → 企画会議 → 収録へ進み、自分だけで聞き返せる番組を作るWebサービス。公開・配信は必須ではありません。

- [音声番組スタジオ](./studio.html) — ブラウザで試せるUI
- [プロジェクトダッシュボード](./index.html)
- [Workers AI アダプター](./src/llm/workers-ai.ts)
- [Mastra Workflow](./src/mastra/workflows/podcast-workflow.ts)

## ローカル起動

Node.js 22.18+ を推奨します。

```sh
npm install
cp .env.example .env
# .env に CLOUDFLARE_ACCOUNT_ID、CLOUDFLARE_API_TOKEN、DEEPGRAM_API_KEY を設定
npm run dev
```

ブラウザで http://localhost:8787 を開きます。Mastra Workflow経由のLLM処理は Cloudflare Workers AI を使用します。Deepgram音声認識は `/api/transcribe`、状態確認は `/api/health` です。

## 構成

- **Cloudflare Workers AI** — 日本語の相方として質問・ツッコミ・構成案作成を担当。既定モデルは `@cf/google/gemma-4-26b-a4b-it`
- **Mastra Workflow** — 企画会議・構成作成の処理フローを管理。LLM推論はWorkers AIに委譲
- **Deepgram** — 選択した録音を日本語で文字起こし。APIキーはサーバー側に置く
- **Node HTTP server** — UIとAPIを同じオリジンで提供する最小構成
- **IndexedDB** — メモ、企画、音声をユーザーのブラウザ内に保存

## 設定

- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID
- `CLOUDFLARE_API_TOKEN`: Workers AIへのアクセス権限を持つAPIトークン
- `WORKERS_AI_MODEL`: 任意。省略時は `@cf/google/gemma-4-26b-a4b-it`
- `DEEPGRAM_API_KEY`: 録音音声を文字起こしする場合に必要

APIトークンはサーバーの環境変数にだけ保存し、ブラウザへ渡さないでください。

## プライバシーと未実装範囲

- 番組は初期設定で非公開。外部への公開・配信機能はありません。
- メモと録音はブラウザ内に保存され、サーバーには自動アップロードされません。文字起こしボタンを押した場合のみ、選択した録音がDeepgram APIへ送信されます。
- 相方の返答や構成生成を使う場合、送信したメモと会話はCloudflare Workers AIへ送信されます。
- APIキーなしの dry-test では、Workers AI・Deepgramへの実通信を行わずモックを使用します。
- 認証、複数端末同期、クラウドバックアップ、リアルタイム音声ストリーミング、外部配信はまだ未実装です。
- マイク録音にはブラウザの許可と HTTPS または localhost が必要です。
