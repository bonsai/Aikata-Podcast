import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { loadConfig } from "../../config.ts";
import { workersAIChat } from "../../llm/workers-ai.ts";

const config = await loadConfig();

const systemPrompt = `あなたは日本語の音声番組づくりを手伝う、気の利く漫才の相方兼編集者です。
ユーザーが話したメモや感想を尊重し、短い質問、軽いツッコミ、具体例を促す問いで考えを深めます。
一度に質問を詰め込まず、自然な会話を続けてください。ユーザーの意見を勝手に変えたり、事実を捏造したりしないでください。
ユーザーが構成を求めた場合は、タイトル、導入、話題の順序、掛け合いのポイント、締めを含む編集可能な構成案を作ります。
工程はシタガキメモ、企画会議、収録、ライブラリです。公開は必須ではありません。外部公開や配信を実行しないでください。
回答は日本語で簡潔に。ユーザーの声や考えを主役にしてください。`;

const conversationStep = createStep({
  id: "podcast-conversation",
  inputSchema: z.object({
    action: z.enum(["memo", "planning", "outline", "record", "library"]),
    memo: z.string(),
    message: z.string(),
    history: z.string(),
  }),
  outputSchema: z.object({ reply: z.string(), action: z.string() }),
  execute: async ({ inputData }) => {
    const instruction = inputData.action === "outline"
      ? "次のメモと会話を材料に、編集可能な番組構成案を作成してください。見出し、導入、具体的な話題、相方との掛け合いの問い、締めを含めてください。本人が話していない事実を補わないでください。"
      : inputData.action === "planning"
        ? "相方として自然な短い返答をしてください。必要なら次に答えやすい質問をひとつだけしてください。"
        : inputData.action === "record"
          ? "収録を支援する短い返答をしてください。"
          : inputData.action === "library"
            ? "保存したメモや番組を振り返る相方として短く返答してください。"
            : "メモを整理し、ユーザーが次に進みやすいよう短く返答してください.";

    const reply = await workersAIChat([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          instruction,
          "現在の工程: " + inputData.action,
          "シタガキメモ:\n" + inputData.memo,
          "これまでの掛け合い:\n" + inputData.history,
          "今回の発話:\n" + inputData.message,
        ].join("\n\n"),
      },
    ], { config });
    return { reply, action: inputData.action };
  },
});

export const podcastWorkflow = createWorkflow({
  id: "podcast-production-flow",
  inputSchema: z.object({
    action: z.enum(["memo", "planning", "outline", "record", "library"]),
    memo: z.string().default(""),
    message: z.string().default(""),
    history: z.string().default(""),
  }),
  outputSchema: z.object({ reply: z.string(), action: z.string() }),
}).then(conversationStep).commit();
