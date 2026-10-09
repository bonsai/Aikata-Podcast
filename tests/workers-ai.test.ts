import { afterEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.ts";
import { workersAIChat } from "../src/llm/workers-ai.ts";

afterEach(() => vi.unstubAllEnvs());

describe("workersAIChat", () => {
  it("uses the SDK with model and generation settings from YAML", async () => {
    const config = await loadConfig();
    vi.stubEnv(config.llm.account_id_env, "test-account");
    vi.stubEnv(config.llm.api_token_env, "test-token");
    const generateTextImpl = vi.fn().mockResolvedValue({ text: "  いいですね。  " });

    await expect(workersAIChat([{ role: "user", content: "こんにちは" }], {
      config,
      generateTextImpl,
    })).resolves.toBe("いいですね。");

    expect(generateTextImpl).toHaveBeenCalledOnce();
    expect(generateTextImpl).toHaveBeenCalledWith(expect.objectContaining({
      messages: [{ role: "user", content: "こんにちは" }],
      maxOutputTokens: config.llm.max_output_tokens,
      temperature: config.llm.temperature,
    }));
  });

  it("fails clearly when SDK credentials are missing", async () => {
    const config = await loadConfig();
    vi.stubEnv(config.llm.account_id_env, "");
    vi.stubEnv(config.llm.api_token_env, "");
    await expect(workersAIChat([{ role: "user", content: "test" }], {
      config,
      generateTextImpl: vi.fn(),
    })).rejects.toThrow(config.llm.account_id_env + " and " + config.llm.api_token_env);
  });
});
