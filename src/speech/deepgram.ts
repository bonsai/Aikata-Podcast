import { DeepgramClient } from "@deepgram/sdk";
import type { AikataConfig } from "../config.ts";
import { getSecret } from "../config.ts";

export interface DeepgramOptions {
  config: AikataConfig;
  transcribeImpl?: (audio: Blob, options: {
    model: string;
    language: string;
    smart_format: boolean;
    punctuate: boolean;
  }) => Promise<{
    results?: {
      channels?: Array<{ alternatives?: Array<{ transcript?: string }> }>;
    };
  }>;
}

/** Transcribe a user-selected recording with the official Deepgram SDK. */
export async function transcribeAudio(
  audio: Buffer,
  contentType: string,
  options: DeepgramOptions,
): Promise<string> {
  const { config } = options;
  const apiKey = getSecret(config, "speech.api_key_env");
  if (!apiKey) throw new Error(`${config.speech.api_key_env} is not configured`);

  const client = new DeepgramClient({ apiKey });
  const transcribe = options.transcribeImpl
    ?? ((blob, settings) => client.listen.v1.media.transcribeFile(blob, settings) as Promise<{
      results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
    }>);
  const blob = new Blob([new Uint8Array(audio)], { type: contentType });
  const result = await transcribe(blob, {
    model: config.speech.model,
    language: config.speech.language,
    smart_format: config.speech.smart_format,
    punctuate: config.speech.punctuate,
  });
  return result.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
}
