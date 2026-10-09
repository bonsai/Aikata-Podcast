# Podcast Agent

AIと漫才するように話しながら、シタガキメモ → 企画会議 → 収録へ進み、自分だけで聞き返せる番組を作るWebサービス。公開・配信は必須ではありません。

- [音声番組スタジオ](./studio.html) — ブラウザで試せるUI
- [プロジェクトダッシュボード](./index.html)
- [Mastra Agent](./src/mastra/agents/podcast-agent.ts)
- [Mastra Workflow](./src/mastra/workflows/podcast-workflow.ts)

## ローカル起動

Node.js 22.18+ を推奨します。

```sh
npm install
cp .env.example .env
# .env に OPENAI_API_KEY と DEEPGRAM_API_KEY を設定
npm run dev
```

ブラウザで http://localhost:8787 を開きます。MastraのAgent APIは `/api/assistant`、Deepgram音声認識は `/api/transcribe`、状態確認は `/api/health` です。

## 構成

- **Mastra Agent** — 日本語の相方として質問・ツッコミ・構成案作成を担当
- **Mastra Workflow** — 企画会議・構成作成の処理をまとめ、工程を明示
- **Deepgram** — 収録した音声を日本語で文字起こし。APIキーはサーバー側に置く
- **Node HTTP server** — UIとAPIを同じオリジンで提供する最小構成
- **IndexedDB** — メモ、企画、音声をユーザーのブラウザ内に保存

## プライバシーと未実装範囲

- 番組は初期設定で非公開。外部への公開・配信機能はありません。
- メモと録音はブラウザ内に保存され、サーバーには自動アップロードされません。Deepgramの文字起こしボタンを押した場合のみ、選択した録音がDeepgram APIへ送信されます。
- Mastraの会話・構成生成を使う場合、送信したメモと会話が設定したLLMプロバイダーに送信されます。
- APIキーを使わずに試す場合は、簡易ローカル応答とブラウザの音声認識にフォールバックします。
- 認証、複数端末同期、クラウドバックアップ、リアルタイムDeepgramストリーミング、外部配信はまだ未実装です。
- マイク録音にはブラウザの許可と HTTPS または localhost が必要です。
