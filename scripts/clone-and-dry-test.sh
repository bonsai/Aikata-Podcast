#!/usr/bin/env bash
set -Eeuo pipefail

REPO_URL="\${REPO_URL:-https://github.com/bonsai/Podcast-Agent-SAAS.git}"
TARGET_DIR="\${1:-Podcast-Agent-SAAS}"
PORT="\${PORT:-8787}"
SERVER_PID=""

log() { printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }
cleanup() {
  if [[ -n "$SERVER_PID" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

command -v git >/dev/null || die "git が見つかりません"
command -v node >/dev/null || die "Node.js が見つかりません (Node 22+ 推奨)"
command -v npm >/dev/null || die "npm が見つかりません"
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
(( NODE_MAJOR >= 22 )) || die "Node.js 22 以上が必要です。現在: $(node --version)"

if [[ -d "$TARGET_DIR/.git" ]]; then
  log "既存 clone を使用: $TARGET_DIR"
  git -C "$TARGET_DIR" status --short
elif [[ -e "$TARGET_DIR" ]]; then
  die "対象パスは存在しますが Git リポジトリではありません: $TARGET_DIR"
else
  log "Clone: $REPO_URL"
  git clone "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"
for file in package.json studio.html .env.example; do
  [[ -f "$file" ]] || die "必須ファイルがありません: $file"
done

if [[ ! -f .env ]]; then
  cp .env.example .env
  log ".env を作成しました。API キーは空欄です"
else
  log "既存 .env を保持します"
fi

log "依存関係をインストール"
if [[ -f package-lock.json ]]; then npm ci; else npm install; fi

log "TypeScript dry-test"
npx tsc --noEmit

log "静的ファイル/API 配線チェック"
node --input-type=module <<'NODE'
import fs from 'node:fs';
const required = [
  'studio.html', 'src/server.ts', 'src/mastra/index.ts',
  'src/mastra/agents/podcast-agent.ts',
  'src/mastra/workflows/podcast-workflow.ts', '.env.example'
];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error('Missing files:', missing.join(', '));
  process.exit(1);
}
const server = fs.readFileSync('src/server.ts', 'utf8');
for (const route of ['/api/health', '/api/assistant', '/api/transcribe']) {
  if (!server.includes(route)) {
    console.error('Server route missing:', route);
    process.exit(1);
  }
}
console.log('PASS: required files and server routes exist');
NODE

log "ローカル health endpoint smoke-test (外部 API は呼びません)"
PORT="$PORT" node --env-file-if-exists=.env --import tsx src/server.ts > /tmp/podcast-agent-saas-server.log 2>&1 &
SERVER_PID=$!
HEALTH_OK=0
for _ in $(seq 1 30); do
  if curl --silent --fail "http://127.0.0.1:$PORT/api/health" -o /tmp/podcast-agent-saas-health.json; then
    HEALTH_OK=1
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    cat /tmp/podcast-agent-saas-server.log >&2
    die "サーバーが起動しませんでした"
  fi
  sleep 1
done
(( HEALTH_OK == 1 )) || { cat /tmp/podcast-agent-saas-server.log >&2; die "health endpoint が応答しません (port=$PORT)"; }
cat /tmp/podcast-agent-saas-health.json
node --input-type=module -e "JSON.parse(require('fs').readFileSync('/tmp/podcast-agent-saas-health.json','utf8')); console.log('PASS: health JSON is valid')"

log "DRY-TEST 完了。外部 AI/Deepgram API の実呼び出し、公開、配信は行っていません。"
log "起動する場合: cd \"$TARGET_DIR\" && npm run dev"
