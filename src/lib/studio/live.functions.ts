import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { generateImage, generateJson } from "./ai.server";

const RULES = `You write LinkedIn posts for a senior professional.
Hard rules:
- Never invent statistics, studies, surveys, named companies, quotes or URLs. Argue from operating experience and first principles.
- Plain, direct language. Short paragraphs. No emojis unless asked.`;

export const liveGenerate = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        task: z.enum(["research", "angles", "post", "visual"]),
        systemPrompt: z.string().max(20000),
        context: z.string().max(40000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const system = `${data.systemPrompt}\n\n${RULES}`;
    const specs: Record<typeof data.task, string> = {
      research: `Produce a research brief based only on reasoning (no web access, you have retrieved nothing).
JSON: {"markdown": string (markdown research.md: context, key tensions, common failure patterns, questions to validate — clearly state it is AI-drafted and unverified), "sources": [] }
Always return an empty sources array — do not list or invent sources.`,
      angles: `Create exactly 3 distinct angle candidates.
JSON: {"angles":[{"label":string,"headline":string,"thesis":string,"why_it_works":string,"risk":string}]}`,
      post: `Write a LinkedIn post for the selected angle. 3 distinct hook options (1-2 lines each). Body 900-1600 characters, no hook inside the body. One clear CTA line. 3-5 hashtags without spaces.
JSON: {"hooks":[{"text":string,"rationale":string}],"selected_hook_index":0,"body":string,"cta":string,"hashtags":[string]}`,
      visual: `Design one image for the post: a clean editorial illustration, no text or logos in the image.
JSON: {"concept":string,"prompt":string (detailed generation prompt),"negative_prompt":string,"alt_text":string}`,
    };
    return generateJson<Record<string, unknown>>(system, `${specs[data.task]}\n\nContext:\n${data.context}`);
  });

export const liveImage = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ prompt: z.string().min(1).max(8000) }).parse(d))
  .handler(async ({ data }) => ({ url: await generateImage(data.prompt) }));
