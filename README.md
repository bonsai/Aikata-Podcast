# Podcast Agent

AIと話しながら、メモから企画会議・収録へ進み、自分だけで聞き返せる番組を作るWebサービス。

- [音声番組スタジオ（ブラウザ試作）](./studio.html)
- [プロジェクトダッシュボード](./index.html)

## 試作について
`studio.html` はブラウザAPIを使うフロントエンド試作です。メモ・企画下書き・録音はこのブラウザのIndexedDBに保存します。音声認識はWeb Speech APIの対応状況に依存します。Mastra/Deepgramへのサーバー接続、認証、複数端末同期、クラウドバックアップは未実装です。録音にはマイク権限とHTTPSまたはlocalhostが必要です。
