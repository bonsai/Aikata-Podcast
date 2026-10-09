# CLAUDE.md — Podcast Agent project rules

## Project overview

Build a Cloudflare-first web app for producing approximately 3-minute interview/conversation episodes with an AI host and a human speaker. The user can plan and edit a script, generate AI host audio, record their own voice in the browser, make basic edits, and download a finished audio file.

Read `README.md`, `CONTEXT.md`, and `TASKS.md` before implementation. These files define the product scope, decisions, data model, acceptance criteria, and task order.

## Rules for the coding agent

- Respond and document in Japanese unless a code/API name is clearer in English.
- Work on one small task at a time; select the next unchecked task in `TASKS.md`.
- Before coding, briefly state the task, intended files, and verification plan.
- Do not mark a task complete until the code is implemented and its verification has been run.
- Prefer the smallest working vertical slice over scaffolding for future features.
- Keep provider-specific LLM/TTS code behind typed interfaces so providers can be replaced.
- Keep provider secrets server-side in Cloudflare secrets; never ship secrets to the browser.
- Validate all inputs and enforce authorization on episode, asset, and download operations.
- Keep R2 audio objects private and implement a deliberate deletion path.
- Treat edits as non-destructive; do not overwrite original recordings when trimming or mixing.
- Make failures understandable to the user and provide retry paths where safe.
- Never invent citations or imply that AI-generated claims have been verified.
- Human approval is required before the final audio is considered ready for distribution.
- Update README/CONTEXT when a real product decision changes.

## Verification

- Run the available typecheck, lint, and tests after each meaningful change.
- Add focused tests for validation, state transitions, authorization, storage cleanup, and export failure handling.
- Manually verify the flow in Chrome or Edge on Windows, including microphone denial and unsupported audio formats.
- Review security and privacy implications before declaring a task complete.
- Do not claim Cloudflare deployment succeeded unless the deployment command reports success and the deployed URL has been checked.

## Keep out of scope

Do not add direct podcast-platform publishing, RSS, analytics integrations, real-time full-duplex voice chat, advanced DAW features, billing, or custom model training without an explicit product decision.
