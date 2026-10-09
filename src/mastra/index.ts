import { Mastra } from "@mastra/core";
import { podcastWorkflow } from "./workflows/podcast-workflow.ts";

export const mastra = new Mastra({
  workflows: { podcastWorkflow },
});
