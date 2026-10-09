import { Mastra } from "@mastra/core";
import { podcastAgent } from "./agents/podcast-agent.ts";
import { podcastWorkflow } from "./workflows/podcast-workflow.ts";

export const mastra = new Mastra({
  agents: { podcastAgent },
  workflows: { podcastWorkflow },
});
