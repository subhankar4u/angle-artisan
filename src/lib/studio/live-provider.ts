// Live providers: real AI writing + image generation via server functions.
// Research is AI-drafted reasoning only — no web retrieval, no sources.
import { createDemoProviders } from "./demo-provider";
import { liveGenerate as liveGenerateFn, liveImage } from "./live.functions";

async function liveGenerate(input: Parameters<typeof liveGenerateFn>[0]): Promise<Record<string, unknown>> {
  return JSON.parse(await liveGenerateFn(input)) as Record<string, unknown>;
}
import type { AgentProviders, AngleCandidate, PostDraft, VisualDraft } from "./providers";
import type { Brief } from "./types";

function briefText(b: Brief): string {
  return [
    `Topic: ${b.topic}`,
    `Audience: ${b.audience}`,
    `Point of view: ${b.pov}`,
    `Desired action: ${b.desired_action}`,
    `Tone: ${b.tone}`,
    b.keywords?.length ? `Keywords: ${b.keywords.join(", ")}` : "",
    b.notes ? `Notes: ${b.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : d);

export function createLiveProviders(): AgentProviders {
  const demo = createDemoProviders();
  return {
    research: {
      mode: "live",
      async research(brief, systemPrompt) {
        const r = await liveGenerate({ data: { task: "research", systemPrompt, context: briefText(brief) } });
        return {
          markdown: `> AI-drafted analysis. No web research was retrieved; nothing here is a verified source.\n\n${str(r["markdown"])}`,
          sources: [],
        };
      },
    },
    angle: {
      mode: "live",
      async angles(brief, research, systemPrompt) {
        const r = await liveGenerate({
          data: { task: "angles", systemPrompt, context: `${briefText(brief)}\n\nResearch notes:\n${research.slice(0, 12000)}` },
        });
        const list = Array.isArray(r["angles"]) ? (r["angles"] as Record<string, unknown>[]) : [];
        if (list.length === 0) throw new Error("The AI returned no angles. Please retry.");
        return list.slice(0, 3).map(
          (a, i): AngleCandidate => ({
            label: str(a["label"], `Angle ${i + 1}`),
            headline: str(a["headline"]),
            thesis: str(a["thesis"]),
            why_it_works: str(a["why_it_works"]),
            risk: str(a["risk"]),
            position: i,
          }),
        );
      },
    },
    post: {
      mode: "live",
      async post(brief, angle, systemPrompt) {
        const r = await liveGenerate({
          data: {
            task: "post",
            systemPrompt,
            context: `${briefText(brief)}\n\nSelected angle:\n${angle.headline}\n${angle.thesis}`,
          },
        });
        const hooks = (Array.isArray(r["hooks"]) ? (r["hooks"] as Record<string, unknown>[]) : [])
          .slice(0, 3)
          .map((h) => ({ text: str(h["text"]), rationale: str(h["style"] ?? h["rationale"]) }));
        if (!hooks.length || !str(r["body"])) throw new Error("The AI returned an incomplete draft. Please retry.");
        const draft: PostDraft = {
          hooks,
          selected_hook_index: 0,
          body: str(r["body"]),
          cta: str(r["cta"]),
          hashtags: (Array.isArray(r["hashtags"]) ? (r["hashtags"] as unknown[]) : [])
            .map((h) => str(h).replace(/^#?/, "#").replace(/\s+/g, ""))
            .filter((h) => h.length > 1),
        };
        return draft;
      },
    },
    visual: {
      mode: "live",
      async visual(brief, angle) {
        const r = await liveGenerate({
          data: {
            task: "visual",
            systemPrompt: "You are an art director for LinkedIn posts.",
            context: `${briefText(brief)}\n\nAngle: ${angle.headline}\n${angle.thesis}`,
          },
        });
        const v: VisualDraft = {
          concept: str(r["concept"]),
          prompt: str(r["prompt"]),
          negative_prompt: str(r["negative_prompt"]),
          aspect_ratio: "1536x1024",
          alt_text: str(r["alt_text"]),
        };
        if (!v.prompt) throw new Error("The AI returned no image prompt. Please retry.");
        return v;
      },
      async generateImage(prompt) {
        const r = await liveImage({ data: { prompt } });
        return r.url;
      },
    },
    // QA stays rule-based: transparent checks against the actual draft.
    qa: { ...demo.qa, mode: "live" },
    publish: demo.publish,
  };
}

export async function generateImageFor(prompt: string, negative: string): Promise<string> {
  const full = negative ? `${prompt}\n\nAvoid: ${negative}. No text, no logos.` : `${prompt}\n\nNo text, no logos.`;
  const r = await liveImage({ data: { prompt: full } });
  return r.url;
}
