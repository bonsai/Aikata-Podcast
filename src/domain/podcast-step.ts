export const PODCAST_STEPS = [
  "idle",
  "memo",
  "planning",
  "recording",
  "review",
  "archived",
] as const;

export type PodcastStep = (typeof PODCAST_STEPS)[number];
export type StepCommand = "start" | "next" | "back" | "archive";

const transitions: Record<PodcastStep, Partial<Record<StepCommand, PodcastStep>>> = {
  idle: { start: "memo" },
  memo: { next: "planning" },
  planning: { next: "recording", back: "memo" },
  recording: { next: "review", back: "planning" },
  review: { back: "recording", archive: "archived" },
  archived: {},
};

/**
 * Pure state transition for the voice-first podcast flow.
 * Invalid commands throw rather than silently skipping a production step.
 */
export function transitionPodcastStep(
  current: PodcastStep,
  command: StepCommand,
): PodcastStep {
  const next = transitions[current][command];
  if (!next) {
    throw new Error(`Invalid podcast step transition: ${current} + ${command}`);
  }
  return next;
}
