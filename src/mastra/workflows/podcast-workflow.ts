import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const conversationStep = createStep({
  id: "podcast-conversation",
  inputSchema: z.object({
    action: z.enum(["memo", "planning", "outline", "record", "library"]),
    memo: z.string(),
    message: z.string(),
    history: z.string(),
  }),
  outputSchema: z.object({ reply: z.string(), action: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("podcastAgent");
    if (!agent) throw new Error("Mastra podcastAgent is not registered");
    const instruction = inputData.action === "outline"
      ? "以下のメモと会話から、編集可能な番組構成案を作成してください。"
      : inputData.action === "planning"
        ? "相方として次の自然な返答をしてください。必要なら質問か軽いツッコミをひとつ入れてください。"
        : "メモを整理し、ユーザーが次に進みやすいよう短く返答してください。";
    const response = await agent.generate([
      instruction,
      "現在の工程: " + inputData.action,
      "シタガキメモ:\n" + inputData.memo,
      "これまでの掛け合い:\n" + inputData.history,
      "今回の発話:\n" + inputData.message,
    ].join("\n\n"));
    return { reply: response.text, action: inputData.action };
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
