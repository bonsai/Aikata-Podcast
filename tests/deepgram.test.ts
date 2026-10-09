import { afterEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config.ts";
import { transcribeAudio } from "../src/speech/deepgram.ts";

afterEach(() => vi.unstubAllEnvs());

describe("transcribeAudio", () => {
  it("returns transcript from mocked Deepgram SDK", async () => {
    const config = await loadConfig();
    vi.stubEnv(config.speech.api_key_env, "test-deepgram-key");
    const transcribe = vi.fn().mockResolvedValue({
      results: { channels: [{ alternatives: [{ transcript: "テスト音声です。" }] }] },
    });

    await expect(transcribeAudio(Buffer.from("audio"), "audio/webm", {
      config,
      transcribeImpl: transcribe,
    })).resolves.toBe("テスト音声です。");
    expect(transcribe).toHaveBeenCalledOnce();
    expect(transcribe).toHaveBeenCalledWith(expect.any(Blob), {
      model: config.speech.model,
      language: config.speech.language,
      smart_format: config.speech.smart_format,
      punctuate: config.speech.punctuate,
    });
  });

  it("requires credentials", async () => {
    const config = await loadConfig();
    vi.stubEnv(config.speech.api_key_env, "");
    await expect(transcribeAudio(Buffer.from("audio"), "audio/webm", {
      config,
      transcribeImpl: vi.fn(),
    })).rejects.toThrow(config.speech.api_key_env);
  });
});
