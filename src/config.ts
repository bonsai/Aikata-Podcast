import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";
import { z } from "zod";

const configSchema = z.object({
  app: z.object({
    name: z.string().default("Aikata Podcast"),
    host: z.string().default("127.0.0.1"),
    port: z.number().int().positive().default(8787),
  }),
  llm: z.object({
    provider: z.literal("cloudflare-workers-ai"),
    model: z.string().default("@cf/google/gemma-4-26b-a4b-it"),
    account_id_env: z.string().default("CLOUDFLARE_ACCOUNT_ID"),
    api_token_env: z.string().default("CLOUDFLARE_API_TOKEN"),
    max_output_tokens: z.number().int().positive().default(900),
    temperature: z.number().min(0).max(2).default(0.7),
  }),
  speech: z.object({
    provider: z.literal("deepgram"),
    api_key_env: z.string().default("DEEPGRAM_API_KEY"),
    model: z.string().default("nova-3"),
    language: z.string().default("ja"),
    smart_format: z.boolean().default(true),
    punctuate: z.boolean().default(true),
  }),
  privacy: z.object({
    storage: z.string().default("browser-local"),
    publish_by_default: z.boolean().default(false),
    send_audio_to_deepgram_only_on_transcribe: z.boolean().default(true),
  }),
});

export type AikataConfig = z.infer<typeof configSchema>;

export async function loadConfig(): Promise<AikataConfig> {
  const configPath = process.env.AIKATA_CONFIG || resolve(process.cwd(), "config/aikata.yaml");
  const source = await readFile(configPath, "utf8");
  return configSchema.parse(parse(source));
}

export function getSecret(config: AikataConfig, key: "llm.account_id_env" | "llm.api_token_env" | "speech.api_key_env"): string | undefined {
  const envName = key === "llm.account_id_env"
    ? config.llm.account_id_env
    : key === "llm.api_token_env"
      ? config.llm.api_token_env
      : config.speech.api_key_env;
  return process.env[envName] || undefined;
}
