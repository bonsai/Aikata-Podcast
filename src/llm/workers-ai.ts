export const DEFAULT_WORKERS_AI_MODEL = "@cf/google/gemma-4-26b-a4b-it";

export interface WorkersAIOptions {
  accountId?: string;
  apiToken?: string;
  model?: string;
  fetcher?: typeof fetch;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
  success?: boolean;
  errors?: Array<{ message?: string }>;
  error?: string;
}

/**
 * Call Cloudflare Workers AI through its OpenAI-compatible Chat Completions API.
 * Credentials are read server-side only; never pass them to browser code.
 */
export async function workersAIChat(
  messages: ChatMessage[],
  options: WorkersAIOptions = {},
): Promise<string> {
  const accountId = options.accountId ?? process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = options.apiToken ?? process.env.CLOUDFLARE_API_TOKEN;
  const model = options.model ?? process.env.WORKERS_AI_MODEL ?? DEFAULT_WORKERS_AI_MODEL;

  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare Workers AI is not configured: set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.",
    );
  }

  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, max_tokens: 900, temperature: 0.7 }),
    },
  );

  const data = (await response.json().catch(() => ({}))) as ChatCompletionResponse;
  if (!response.ok) {
    const detail = data.errors?.map((item) => item.message).filter(Boolean).join("; ")
      || data.error
      || `HTTP ${response.status}`;
    throw new Error(`Cloudflare Workers AI request failed: ${detail}`);
  }

  const content = data.choices?.[0]?.message?.content;
  const text = typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content.map((part) => part.text ?? "").join("")
      : "";
  if (!text.trim()) throw new Error("Cloudflare Workers AI returned an empty response.");
  return text.trim();
}
