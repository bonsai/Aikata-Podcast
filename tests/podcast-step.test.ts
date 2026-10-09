import { describe, expect, it } from "vitest";
import { transitionPodcastStep } from "../src/domain/podcast-step.ts";

describe("transitionPodcastStep", () => {
  it("starts at the memo step", () => {
    expect(transitionPodcastStep("idle", "start")).toBe("memo");
  });

  it("moves through memo, planning, recording, and review", () => {
    expect(transitionPodcastStep("memo", "next")).toBe("planning");
    expect(transitionPodcastStep("planning", "next")).toBe("recording");
    expect(transitionPodcastStep("recording", "next")).toBe("review");
  });

  it("supports going back one step before archiving", () => {
    expect(transitionPodcastStep("planning", "back")).toBe("memo");
    expect(transitionPodcastStep("recording", "back")).toBe("planning");
    expect(transitionPodcastStep("review", "back")).toBe("recording");
  });

  it("archives only after review", () => {
    expect(transitionPodcastStep("review", "archive")).toBe("archived");
    expect(() => transitionPodcastStep("recording", "archive")).toThrow(
      "Invalid podcast step transition",
    );
  });

  it("does not allow skipping the memo step or moving after archive", () => {
    expect(() => transitionPodcastStep("idle", "next")).toThrow(
      "Invalid podcast step transition",
    );
    expect(() => transitionPodcastStep("archived", "next")).toThrow(
      "Invalid podcast step transition",
    );
  });
});
