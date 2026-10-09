param(
  [string]$TargetDir = "Podcast-Agent-SAAS",
  [int]$Port = 8787,
  [switch]$SkipServerSmokeTest
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/bonsai/Podcast-Agent-SAAS.git"
$ServerProcess = $null
$OutLog = Join-Path $env:TEMP "podcast-agent-saas-server.log"
$ErrLog = Join-Path $env:TEMP "podcast-agent-saas-server.err.log"

function Write-Step([string]$Message) {
  Write-Host ([Environment]::NewLine + "==> " + $Message) -ForegroundColor Cyan
}
function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name が見つかりません。インストールして PATH を確認してください。"
  }
}

try {
  Assert-Command git
  Assert-Command node
  Assert-Command npm

  $NodeVersion = [version](node -p "process.versions.node")
  if ($NodeVersion -lt [version]"22.0") {
    throw "Node.js 22 以上が必要です。現在: $NodeVersion"
  }

  $TargetDir = [IO.Path]::GetFullPath($TargetDir)
  if (Test-Path (Join-Path $TargetDir ".git")) {
    Write-Step "既存 clone を使用: $TargetDir"
    git -C $TargetDir status --short
  } elseif (Test-Path $TargetDir) {
    throw "対象パスは存在しますが Git リポジトリではありません: $TargetDir"
  } else {
    Write-Step "Clone: $RepoUrl"
    git clone $RepoUrl $TargetDir
    if ($LASTEXITCODE -ne 0) { throw "git clone に失敗しました" }
  }

  Set-Location $TargetDir
  foreach ($File in @("package.json", "studio.html", ".env.example")) {
    if (-not (Test-Path $File)) { throw "必須ファイルがありません: $File" }
  }

  if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host ".env を作成しました。API キーは空欄です。必要なら手動で設定してください。"
  } else {
    Write-Host "既存 .env を保持します。"
  }

  Write-Step "依存関係をインストール"
  if (Test-Path "package-lock.json") { npm ci } else { npm install }
  if ($LASTEXITCODE -ne 0) { throw "npm install/ci に失敗しました" }

  Write-Step "TypeScript dry-test"
  npx tsc --noEmit
  if ($LASTEXITCODE -ne 0) { throw "TypeScript チェックに失敗しました" }

  Write-Step "静的ファイル/API 配線チェック"
  @'
const fs = require("node:fs");
const required = [
  "studio.html",
  "src/server.ts",
  "src/mastra/index.ts",
  "src/mastra/agents/podcast-agent.ts",
  "src/mastra/workflows/podcast-workflow.ts",
  ".env.example"
];
const missing = required.filter((f) => !fs.existsSync(f));
if (missing.length) {
  console.error("Missing files:", missing.join(", "));
  process.exit(1);
}
const server = fs.readFileSync("src/server.ts", "utf8");
for (const route of ["/api/health", "/api/assistant", "/api/transcribe"]) {
  if (!server.includes(route)) {
    console.error("Server route missing:", route);
    process.exit(1);
  }
}
console.log("PASS: required files and server routes exist");
'@ | node
  if ($LASTEXITCODE -ne 0) { throw "静的チェックに失敗しました" }

  if (-not $SkipServerSmokeTest) {
    Write-Step "ローカル health endpoint smoke-test (外部 API は呼びません)"
    $env:PORT = "$Port"
    $ServerProcess = Start-Process -FilePath "node" -ArgumentList @("--env-file-if-exists=.env", "--import", "tsx", "src/server.ts") -WorkingDirectory (Get-Location).Path -PassThru -WindowStyle Hidden -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog

    $Health = $null
    for ($i = 0; $i -lt 30; $i++) {
      Start-Sleep -Seconds 1
      try {
        $Health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 2
        break
      } catch {
        if ($ServerProcess.HasExited) { break }
      }
    }
    if ($null -eq $Health) {
      if (Test-Path $OutLog) { Get-Content $OutLog }
      if (Test-Path $ErrLog) { Get-Content $ErrLog }
      throw "health endpoint が応答しません (port=$Port)"
    }
    $Health | ConvertTo-Json -Depth 5
    Write-Host "PASS: health endpoint responded"
  }

  Write-Host ([Environment]::NewLine + "DRY-TEST 完了。外部 AI/Deepgram API の実呼び出し、公開、配信は行っていません。") -ForegroundColor Green
  Write-Host "起動する場合: npm run dev"
} catch {
  Write-Error $_
  exit 1
} finally {
  if ($ServerProcess -and -not $ServerProcess.HasExited) {
    Stop-Process -Id $ServerProcess.Id -Force -ErrorAction SilentlyContinue
  }
  Remove-Item Env:PORT -ErrorAction SilentlyContinue
}
