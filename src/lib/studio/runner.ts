import {
  fetchAngles,
  fetchArtifacts,
  fetchPostVersions,
  fetchVisuals,
  insertPostVersion,
  insertQaResult,
  insertVisual,
  replaceAngles,
  replaceSources,
  saveArtifact,
  setStageStatus,
  updateRun,
} from "./api";
import {
  createDemoProviders,
  renderAngleMarkdown,
  renderPostMarkdown,
  renderQaMarkdown,
  renderVisualMarkdown,
} from "./demo-provider";
import type { AngleCandidate } from "./providers";
import {
  ARTIFACT_TABS,
  composePostText,
  readingSeconds,
  type Brief,
  type CreatorSettings,
  type Hook,
  type StageId,
} from "./types";

export const EXECUTABLE_STAGES: StageId[] = ["research", "angle", "post", "visual", "qa", "preview"];

function filenameFor(stage: StageId): { kind: (typeof ARTIFACT_TABS)[number]["kind"]; filename: string } | null {
  const tab = ARTIFACT_TABS.find((t) => t.stage === stage);
  return tab ? { kind: tab.kind, filename: tab.filename } : null;
}

async function currentAngle(runId: string): Promise<AngleCandidate> {
  const angles = await fetchAngles(runId);
  const selected = angles.find((a) => a.is_selected) ?? angles[0];
  if (!selected) throw new Error("Run the Angle stage first — no angle has been selected.");
  return {
    label: selected.label,
    headline: selected.headline,
    thesis: selected.thesis,
    why_it_works: selected.why_it_works,
    risk: selected.risk,
    position: selected.position,
  };
}

export async function executeStage(input: {
  runId: string;
  stage: StageId;
  brief: Brief;
  settings: CreatorSettings;
}): Promise<void> {
  const { runId, stage, brief, settings } = input;
  const providers = createDemoProviders();
  const source = settings.demo_mode ? "demo" : "demo";

  await setStageStatus(runId, stage, "running", { bumpAttempt: true });
  await updateRun(runId, { status: "running", current_stage: stage });

  try {
    if (stage === "idea") {
      // Brief snapshot only — nothing generated.
    } else if (stage === "research") {
      const result = await providers.research.research(brief, settings.system_prompt);
      await replaceSources(runId, result.sources);
      await saveArtifact(runId, "research", "research.md", result.markdown, source);
    } else if (stage === "angle") {
      const artifacts = await fetchArtifacts(runId);
      const research = artifacts.find((a) => a.kind === "research" && a.is_current)?.content_md ?? "";
      const candidates = await providers.angle.angles(brief, research, settings.system_prompt);
      await replaceAngles(runId, candidates);
      await saveArtifact(runId, "angle", "angle.md", renderAngleMarkdown(candidates, 0), source);
    } else if (stage === "post") {
      const angle = await currentAngle(runId);
      const draft = await providers.post.post(brief, angle, settings.system_prompt);
      const text = composePostText(draft);
      await insertPostVersion(runId, {
        hooks: draft.hooks as Hook[],
        selected_hook_index: draft.selected_hook_index,
        body: draft.body,
        cta: draft.cta,
        hashtags: draft.hashtags,
        char_count: text.length,
        reading_seconds: readingSeconds(text),
      });
      await saveArtifact(runId, "post", "post.md", renderPostMarkdown(draft), source);
    } else if (stage === "visual") {
      const angle = await currentAngle(runId);
      const visual = await providers.visual.visual(brief, angle);
      await insertVisual(runId, visual);
      await saveArtifact(runId, "image_prompt", "image-prompt.md", renderVisualMarkdown(visual), source);
    } else if (stage === "qa") {
      const posts = await fetchPostVersions(runId);
      const post = posts.find((p) => p.is_current) ?? posts[0];
      if (!post) throw new Error("Run the Post stage first — there is nothing to review.");
      const angles = await fetchAngles(runId);
      const selected = angles.find((a) => a.is_selected) ?? null;
      const report = await providers.qa.review({
        brief,
        angle: selected
          ? {
              label: selected.label,
              headline: selected.headline,
              thesis: selected.thesis,
              why_it_works: selected.why_it_works,
              risk: selected.risk,
              position: selected.position,
            }
          : null,
        postText: composePostText(post),
        hashtags: post.hashtags,
        bannedWords: settings.banned_words,
        hasVerifiedResearch: settings.research_provider_configured && !settings.demo_mode,
      });
      await insertQaResult(runId, report);
      await saveArtifact(runId, "qa", "qa.md", renderQaMarkdown(report), source);
    } else if (stage === "preview") {
      const posts = await fetchPostVersions(runId);
      if (!posts.length) throw new Error("There is no draft to preview yet.");
      const visuals = await fetchVisuals(runId);
      if (!visuals.length) {
        // Preview still works without a visual, but note it.
      }
    } else if (stage === "approval") {
      await setStageStatus(runId, "approval", "blocked");
      await updateRun(runId, { status: "awaiting_approval", current_stage: "approval" });
      return;
    }

    void filenameFor(stage);
    await setStageStatus(runId, stage, "complete");
    await updateRun(runId, { status: "idle", current_stage: stage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stage failed for an unknown reason.";
    await setStageStatus(runId, stage, "error", { error: message });
    await updateRun(runId, { status: "error", current_stage: stage });
    throw error;
  }
}

export async function executeFullRun(input: {
  runId: string;
  brief: Brief;
  settings: CreatorSettings;
  onStage?: (stage: StageId) => void;
}): Promise<void> {
  const { runId, brief, settings, onStage } = input;
  await updateRun(runId, { status: "running", started_at: new Date().toISOString() });
  await setStageStatus(runId, "idea", "complete");

  for (const stage of EXECUTABLE_STAGES) {
    onStage?.(stage);
    await executeStage({ runId, stage, brief, settings });
  }

  onStage?.("approval");
  await setStageStatus(runId, "approval", "blocked");
  await updateRun(runId, {
    status: "awaiting_approval",
    current_stage: "approval",
    completed_at: new Date().toISOString(),
  });
}
