/**
 * Service interfaces for the content agent.
 *
 * Every stage is expressed as a provider so a real implementation (LLM, web
 * research API, image model, LinkedIn publishing) can be dropped in later
 * without touching the workspace UI or the persistence layer.
 *
 * Today only the deterministic demo provider is registered. Nothing here calls
 * an external service, and demo output is always labelled as example content.
 */
import type { Angle, Brief, Hook, QaCheck, ResearchSource } from "./types";

export type ProviderMode = "demo" | "live";

export type ResearchResult = {
  markdown: string;
  sources: Omit<ResearchSource, "id" | "run_id">[];
};

export type AngleCandidate = Omit<Angle, "id" | "run_id" | "is_selected" | "version">;

export type PostDraft = {
  hooks: Hook[];
  selected_hook_index: number;
  body: string;
  cta: string;
  hashtags: string[];
};

export type VisualDraft = {
  concept: string;
  prompt: string;
  negative_prompt: string;
  aspect_ratio: string;
  alt_text: string;
};

export type QaReport = {
  checks: QaCheck[];
  verdict: "pass" | "warning" | "fail";
  summary: string;
};

export interface ResearchProvider {
  readonly mode: ProviderMode;
  research(brief: Brief, systemPrompt: string): Promise<ResearchResult>;
}

export interface AngleProvider {
  readonly mode: ProviderMode;
  angles(brief: Brief, research: string, systemPrompt: string): Promise<AngleCandidate[]>;
}

export interface PostProvider {
  readonly mode: ProviderMode;
  post(brief: Brief, angle: AngleCandidate, systemPrompt: string): Promise<PostDraft>;
}

export interface VisualProvider {
  readonly mode: ProviderMode;
  visual(brief: Brief, angle: AngleCandidate): Promise<VisualDraft>;
  /** Real image generation is not configured; returns null in demo mode. */
  generateImage(prompt: string): Promise<string | null>;
}

export interface QaProvider {
  readonly mode: ProviderMode;
  review(input: {
    brief: Brief;
    angle: AngleCandidate | null;
    postText: string;
    hashtags: string[];
    bannedWords: string[];
    hasVerifiedResearch: boolean;
  }): Promise<QaReport>;
}

export interface PublishProvider {
  readonly mode: ProviderMode;
  readonly configured: boolean;
  schedule(input: { postText: string; at: string }): Promise<never>;
}

export type AgentProviders = {
  research: ResearchProvider;
  angle: AngleProvider;
  post: PostProvider;
  visual: VisualProvider;
  qa: QaProvider;
  publish: PublishProvider;
};

export class ProviderNotConfiguredError extends Error {
  constructor(what: string) {
    super(`${what} is not connected yet. Connect a real integration in Settings to enable it.`);
    this.name = "ProviderNotConfiguredError";
  }
}
