import { generateText } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import type { AikataConfig } from "../config.ts";
import { getSecret } from "../config.ts";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface WorkersAIOptions {
  config: AikataConfig;
  generateTextImpl?: (args: {
    model: unknown;
    messages: ChatMessage[];
    maxOutputTokens: number;
    temperature: number;
  }) => Promise<{ text: string }>;
}

/** Cloudflare Workers AI via the Workers AI provider and Vercel AI SDK. */
export async function workersAIChat(
  messages: ChatMessage[],
  options: WorkersAIOptions,
): Promise<string> {
  const { config } = options;
  const accountId = getSecret(config, "llm.account_id_env");
  const apiKey = getSecret(config, "llm.api_token_env");
  if (!accountId || !apiKey) {
    throw new Error(
      `Workers AI is not configured: set ${config.llm.account_id_env} and ${config.llm.api_token_env}.`,
    );
  }

  const workersai = createWorkersAI({ accountId, apiKey });
  const runGenerateText = options.generateTextImpl ?? (generateText as unknown as WorkersAIOptions["generateTextImpl"]);
  if (!runGenerateText) throw new Error("Workers AI SDK generateText is unavailable.");

  const result = await runGenerateText({
    model: workersai(config.llm.model),
    messages,
    maxOutputTokens: config.llm.max_output_tokens,
    temperature: config.llm.temperature,
  });
  if (!result.text.trim()) throw new Error("Workers AI returned an empty response.");
  return result.text.trim();
}
