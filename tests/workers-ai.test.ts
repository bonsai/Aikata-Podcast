import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_WORKERS_AI_MODEL, workersAIChat } from "../src/llm/workers-ai.ts";

afterEach(() => vi.unstubAllEnvs());

describe("workersAIChat", () => {
  it("sends chat messages to Cloudflare Workers AI and returns the answer", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      choices: [{ message: { content: "  いいですね。  " } }],
    }), { status: 200, headers: { "content-type": "application/json" } }));

    await expect(workersAIChat([{ role: "user", content: "こんにちは" }], {
      accountId: "account-id",
      apiToken: "secret-token",
      fetcher,
    })).resolves.toBe("いいですね。");

    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0];
    expect(String(url)).toBe("https://api.cloudflare.com/client/v4/accounts/account-id/ai/v1/chat/completions");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer secret-token");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      model: DEFAULT_WORKERS_AI_MODEL,
      messages: [{ role: "user", content: "こんにちは" }],
    });
  });

  it("fails clearly when credentials are missing", async () => {
    await expect(workersAIChat([{ role: "user", content: "test" }], {
      accountId: "",
      apiToken: "",
      fetcher: vi.fn<typeof fetch>(),
    })).rejects.toThrow("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN");
  });

  it("surfaces Cloudflare API errors without exposing the token", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      success: false,
      errors: [{ message: "Invalid account ID" }],
    }), { status: 400, headers: { "content-type": "application/json" } }));

    await expect(workersAIChat([{ role: "user", content: "test" }], {
      accountId: "account-id",
      apiToken: "do-not-leak",
      fetcher,
    })).rejects.toThrow("Cloudflare Workers AI request failed: Invalid account ID");
  });
});
