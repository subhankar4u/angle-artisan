export const STAGE_IDS = [
  "idea",
  "research",
  "angle",
  "post",
  "visual",
  "qa",
  "preview",
  "approval",
] as const;

export type StageId = (typeof STAGE_IDS)[number];

export type StageStatus = "pending" | "running" | "complete" | "error" | "blocked";

export type ArtifactKind = "research" | "angle" | "post" | "image_prompt" | "qa";

export const ARTIFACT_TABS: { kind: ArtifactKind; filename: string; stage: StageId }[] = [
  { kind: "research", filename: "research.md", stage: "research" },
  { kind: "angle", filename: "angle.md", stage: "angle" },
  { kind: "post", filename: "post.md", stage: "post" },
  { kind: "image_prompt", filename: "image-prompt.md", stage: "visual" },
  { kind: "qa", filename: "qa.md", stage: "qa" },
];

export const STAGE_META: Record<
  StageId,
  { label: string; short: string; description: string; artifact?: ArtifactKind }
> = {
  idea: {
    label: "Idea",
    short: "Brief locked",
    description: "Capture topic, audience, point of view and the action you want readers to take.",
  },
  research: {
    label: "Research",
    short: "Evidence gathered",
    description: "Collect supporting material and separate what is verified from what needs a check.",
    artifact: "research",
  },
  angle: {
    label: "Angle",
    short: "3 candidates",
    description: "Generate three competing angles, then choose the one that fits the point of view.",
    artifact: "angle",
  },
  post: {
    label: "Post",
    short: "Draft written",
    description: "Three hook options, an editable body, one call to action and hashtags.",
    artifact: "post",
  },
  visual: {
    label: "Visual",
    short: "Concept + prompt",
    description: "An image concept and a generation prompt ready for an image model.",
    artifact: "image_prompt",
  },
  qa: {
    label: "QA",
    short: "Checks explained",
    description: "Pass, warning and fail checks with reasons — no vanity score.",
    artifact: "qa",
  },
  preview: {
    label: "Preview",
    short: "Feed simulation",
    description: "See the draft rendered as a LinkedIn post. Nothing is published from here.",
  },
  approval: {
    label: "Approval",
    short: "Human sign-off",
    description: "A person approves or requests changes before anything can leave the studio.",
  },
};

export type Hook = { text: string; rationale: string };

export type QaCheck = {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  explanation: string;
  fix?: string;
};

export type Brief = {
  id: string;
  project_id: string;
  version: number;
  topic: string;
  audience: string;
  pov: string;
  desired_action: string;
  tone: string;
  format: string;
  keywords: string[];
  notes: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  topic: string;
  audience: string;
  pov: string;
  desired_action: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type WorkflowRun = {
  id: string;
  project_id: string;
  brief_id: string | null;
  mode: string;
  status: string;
  current_stage: StageId;
  label: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkflowStage = {
  id: string;
  run_id: string;
  stage: StageId;
  position: number;
  status: StageStatus;
  attempts: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
};

export type Artifact = {
  id: string;
  run_id: string;
  kind: ArtifactKind;
  filename: string;
  content_md: string;
  version: number;
  is_current: boolean;
  source: string;
  updated_at: string;
};

export type ResearchSource = {
  id: string;
  run_id: string;
  title: string;
  url: string;
  publisher: string;
  source_type: string;
  snippet: string;
  relevance: string;
  is_demo: boolean;
  position: number;
};

export type Angle = {
  id: string;
  run_id: string;
  label: string;
  headline: string;
  thesis: string;
  why_it_works: string;
  risk: string;
  is_selected: boolean;
  position: number;
  version: number;
};

export type PostVersion = {
  id: string;
  run_id: string;
  version: number;
  hooks: Hook[];
  selected_hook_index: number;
  body: string;
  cta: string;
  hashtags: string[];
  char_count: number;
  reading_seconds: number;
  is_current: boolean;
  updated_at: string;
};

export type VisualPrompt = {
  id: string;
  run_id: string;
  version: number;
  concept: string;
  prompt: string;
  negative_prompt: string;
  aspect_ratio: string;
  alt_text: string;
  image_url: string | null;
  is_current: boolean;
};

export type QaResult = {
  id: string;
  run_id: string;
  version: number;
  checks: QaCheck[];
  verdict: "pass" | "warning" | "fail";
  summary: string;
  is_current: boolean;
  created_at: string;
};

export type Approval = {
  id: string;
  run_id: string;
  decision: "pending" | "approved" | "changes_requested";
  approver_name: string;
  notes: string;
  decided_at: string | null;
  created_at: string;
};

export type CreatorSettings = {
  id: string;
  creator_name: string;
  headline: string;
  avatar_initials: string;
  tone_guidelines: string;
  banned_words: string[];
  system_prompt: string;
  demo_mode: boolean;
  linkedin_connected: boolean;
  ai_provider_configured: boolean;
  research_provider_configured: boolean;
  image_provider_configured: boolean;
};

export function composePostText(post: {
  hooks: Hook[];
  selected_hook_index: number;
  body: string;
  cta: string;
  hashtags: string[];
}): string {
  const hook = post.hooks[post.selected_hook_index]?.text ?? "";
  const tags = post.hashtags.length ? post.hashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" ") : "";
  return [hook, post.body, post.cta, tags].filter(Boolean).join("\n\n");
}

export function readingSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(10, Math.round((words / 220) * 60));
}

export function formatReadingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s read`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s read` : `${m}m read`;
}
