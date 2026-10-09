import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { mastra } from "./mastra/index.ts";
import { getSecret, loadConfig } from "./config.ts";
import { transcribeAudio } from "./speech/deepgram.ts";

const config = await loadConfig();

const port = config.app.port;
const root = process.cwd();
const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function send(res: import("node:http").ServerResponse, status: number, body: unknown, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

async function readBody(req: import("node:http").IncomingMessage, maxBytes = 20 * 1024 * 1024): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) throw new Error("Request body too large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    return send(res, 200, {
      ok: true,
      workersAIConfigured: Boolean(getSecret(config, "llm.account_id_env") && getSecret(config, "llm.api_token_env")),
      workersAIModel: config.llm.model,
      deepgramConfigured: Boolean(getSecret(config, "speech.api_key_env")),
      deepgramModel: config.speech.model,
      storage: "browser-local",
    });
  }

  if (req.method === "POST" && url.pathname === "/api/assistant") {
    if (!getSecret(config, "llm.account_id_env") || !getSecret(config, "llm.api_token_env")) {
      return send(res, 503, { error: `Workers AI is not configured. Set ${config.llm.account_id_env} and ${config.llm.api_token_env}.` });
    }
    try {
      const body = JSON.parse((await readBody(req, 256 * 1024)).toString("utf8")) as {
        action?: string; memo?: string; message?: string; history?: string;
      };
      const action = ["memo", "planning", "outline", "record", "library"].includes(body.action || "")
        ? body.action as "memo" | "planning" | "outline" | "record" | "library"
        : "planning";
      const workflow = mastra.getWorkflow("podcastWorkflow");
      const run = await workflow.createRun();
      const result = await run.start({
        inputData: {
          action,
          memo: String(body.memo || ""),
          message: String(body.message || ""),
          history: String(body.history || ""),
        },
      });
      if (result.status !== "success") {
        return send(res, 502, { error: "Mastra workflow did not complete", status: result.status });
      }
      return send(res, 200, result.result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return send(res, 500, { error: message });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/transcribe") {
    if (!getSecret(config, "speech.api_key_env")) {
      return send(res, 503, { error: `${config.speech.api_key_env} is not configured` });
    }
    try {
      const audio = await readBody(req);
      if (!audio.length) return send(res, 400, { error: "Audio body is empty" });
      const contentType = String(req.headers["content-type"] || "audio/webm").split(";")[0];
      const transcript = await transcribeAudio(audio, contentType, { config });
      return send(res, 200, { transcript });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return send(res, 500, { error: message });
    }
  }

  if (req.method === "GET") {
    const pathname = ["/", "/ui", "/ui/"].includes(url.pathname) ? "/src/ui/index.html" : decodeURIComponent(url.pathname);
    const filePath = resolve(root, "." + pathname);
    if (!filePath.startsWith(root)) return send(res, 403, { error: "Forbidden" });
    try {
      const file = await readFile(filePath);
      return send(res, 200, file.toString("utf8"), mime[extname(filePath)] || "application/octet-stream");
    } catch {
      return send(res, 404, "Not found", "text/plain; charset=utf-8");
    }
  }

  return send(res, 404, { error: "Not found" });
});

server.listen(port, config.app.host, () => {
  console.log(`${config.app.name} listening on http://${config.app.host}:${port}`);
  console.log("Private browser storage is enabled; external publishing is not configured.");
});
