/**
 * Deterministic Demo Mode provider.
 *
 * All output is generated locally from the brief. No network calls, no external
 * research, no image model. Sources are clearly marked as illustrative examples
 * so demo research is never presented as retrieved evidence.
 */
import {
  type AgentProviders,
  type AngleCandidate,
  type PostDraft,
  ProviderNotConfiguredError,
  type QaReport,
  type ResearchResult,
  type VisualDraft,
} from "./providers";
import { composePostText, readingSeconds, type Brief, type QaCheck } from "./types";

const DEMO_NOTICE =
  "> **Demo Mode.** This artifact was generated locally from the brief. It contains no retrieved web results and no external API was called. Treat every example below as illustrative until a real research provider is connected.";

function firstClause(text: string, fallback: string): string {
  const clean = (text || fallback).trim().replace(/\.$/, "");
  return clean.charAt(0).toLowerCase() + clean.slice(1);
}

function titleCase(text: string): string {
  return text.trim().charAt(0).toUpperCase() + text.trim().slice(1);
}

async function tick<T>(value: T, ms = 450): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return value;
}

export function createDemoProviders(): AgentProviders {
  return {
    research: {
      mode: "demo",
      async research(brief: Brief): Promise<ResearchResult> {
        const topic = firstClause(brief.topic, "AI adoption");
        const sources = [
          {
            title: "Pattern: tool purchased, workflow untouched",
            url: "",
            publisher: "Illustrative example (not retrieved)",
            source_type: "pattern",
            snippet:
              "A team buys a licence, runs a kickoff, and three months later the same handoffs, approvals and spreadsheets are still in place. Usage decays to the few people who volunteered.",
            relevance: "Anchors the post in a failure pattern the audience has personally lived through.",
            is_demo: true,
            position: 0,
          },
          {
            title: "Gap-first framing: find the constraint, then shop",
            url: "",
            publisher: "Illustrative example (not retrieved)",
            source_type: "framework",
            snippet:
              "Map the workflow end to end, time each step, mark where work waits. The constraint is almost always a decision queue or a missing input, not a missing feature.",
            relevance: "Gives the reader the concrete method behind the point of view.",
            is_demo: true,
            position: 1,
          },
          {
            title: "Adoption is a behaviour change programme, not a rollout",
            url: "",
            publisher: "Illustrative example (not retrieved)",
            source_type: "principle",
            snippet:
              "Adoption shows up when a named owner, a changed process step and a measured outcome exist. Training sessions alone do not move it.",
            relevance: "Supports the claim that buying is not adopting without inventing statistics.",
            is_demo: true,
            position: 2,
          },
          {
            title: "Objection to handle: 'but the tool has AI built in'",
            url: "",
            publisher: "Illustrative example (not retrieved)",
            source_type: "objection",
            snippet:
              "Embedded AI accelerates a step that already works. If the bottleneck sits upstream in scoping or approvals, a faster step downstream just produces waiting work sooner.",
            relevance: "Pre-empts the most common reply from the audience.",
            is_demo: true,
            position: 3,
          },
          {
            title: "Evidence still to verify before publishing",
            url: "",
            publisher: "Needs human fact-check",
            source_type: "open_question",
            snippet:
              "Any adoption-failure percentage, analyst forecast or named company case study must be sourced by a human. This studio will not invent one.",
            relevance: "Keeps the draft honest: no fabricated numbers enter the post.",
            is_demo: true,
            position: 4,
          },
        ];

        const markdown = `# research.md

${DEMO_NOTICE}

## Brief in one line
${titleCase(brief.topic || "Untitled topic")}

- **Audience:** ${brief.audience || "—"}
- **Point of view:** ${brief.pov || "—"}
- **Desired action:** ${brief.desired_action || "—"}

## What we can argue from experience
1. Teams treat procurement as the finish line. The contract closes and the change work never starts.
2. The gap is usually upstream of the tool: unclear ownership, a decision queue, or an input that arrives late.
3. Adoption becomes visible only when a process step changes and someone owns the outcome.

## Working notes on ${topic}
- Start from the workflow, not the vendor shortlist.
- Time each step, then mark where work waits rather than where work happens.
- Name the one decision you want to make faster. That is the requirement.
- Only then ask what class of tool removes the wait.

## Supporting material (illustrative)
${sources
  .map(
    (s, i) => `### ${i + 1}. ${s.title}
- **Type:** ${s.source_type}
- **Provenance:** ${s.publisher}
- ${s.snippet}
- **Why it matters:** ${s.relevance}`,
  )
  .join("\n\n")}

## Explicitly not claimed
- No survey results, market figures or analyst forecasts.
- No named customers, quotes or dates.
- No links, because nothing was retrieved from the web.`;

        return tick({ markdown, sources });
      },
    },

    angle: {
      mode: "demo",
      async angles(brief: Brief): Promise<AngleCandidate[]> {
        const action = firstClause(brief.desired_action, "map one workflow");
        return tick([
          {
            label: "Diagnosis first",
            headline: "Most AI programmes fail in procurement, not in the model",
            thesis: `Adoption stalls because teams buy capability before they can name the gap it should close. The fix is diagnostic: ${action} before the next licence.`,
            why_it_works:
              "Reframes a tooling debate as an operating-discipline problem, which is exactly the reader's job. It is provable from experience, so it needs no external statistics.",
            risk: "Can read as criticism of the reader's recent purchase. Keep the tone diagnostic, not superior.",
            position: 0,
          },
          {
            label: "Lived scene",
            headline: "The licence was approved in six weeks. The workflow never changed.",
            thesis:
              "Open with a scene the audience recognises, then pull the lesson out of it: a tool changes what is possible, only a changed process changes what happens.",
            why_it_works:
              "A concrete scene earns the first two lines without a statistic, and program managers self-identify immediately.",
            risk: "Narrative openings can drift. The scene must be four lines at most before the turn.",
            position: 1,
          },
          {
            label: "Contrarian test",
            headline: "If you cannot draw the workflow, you are not ready to buy the tool",
            thesis:
              "Offer a single hard test the reader can apply this week. Passing it is cheap; failing it explains the stalled rollout.",
            why_it_works:
              "A testable rule is highly shareable and converts directly into the desired action without a pitch.",
            risk: "Reads as absolutist. Needs one sentence acknowledging where fast buying is genuinely right.",
            position: 2,
          },
        ]);
      },
    },

    post: {
      mode: "demo",
      async post(brief: Brief, angle: AngleCandidate): Promise<PostDraft> {
        const audience = brief.audience || "teams";
        const action = brief.desired_action || "Map one workflow before buying another tool";
        const pov = brief.pov || "Buying a tool is not adoption";

        const hooks = [
          {
            text: "Most AI rollouts do not fail in the model.\nThey fail in the purchase order.",
            rationale:
              "Short, oppositional, and lands the whole argument in two lines. Strongest scroll-stop of the three.",
          },
          {
            text: `The licence took six weeks to approve.\nSix months later, the workflow had not changed by a single step.`,
            rationale: "Concrete scene. Best if you want recognition before the argument.",
          },
          {
            text: `"${pov}."\nHere is the test I run before approving any tool spend.`,
            rationale: "Leads with the point of view and promises a method. Slightly slower start, higher payoff.",
          },
        ];

        const body = `I have watched this sequence more than once:

1. A gap gets described in a meeting as "we are slow".
2. Someone demos a tool that looks like the answer.
3. Procurement moves. Training happens. A channel is created.
4. Three months later the handoffs, approvals and spreadsheets are exactly where they were.

The tool was never the problem. Nobody had found the gap.

${angle.thesis}

What works better, and costs nothing:

— Draw the workflow end to end, including the waiting.
— Time each step. Mark where work sits, not where work happens.
— Name the one decision you want to make faster.
— Assign an owner to that decision before you shortlist anything.

Nine times out of ten the constraint is a decision queue or a missing input, and no amount of embedded AI clears a queue that nobody owns.

Adoption is not a licence count. It is a changed process step with a name attached to it.`;

        const cta = `If you are ${audience.toLowerCase().includes("manager") ? "running a programme" : "leading the work"} this quarter: ${action.replace(/\.$/, "")}. One workflow, one page, one owner. Then decide whether you still need the tool.`;

        const draft = {
          hooks,
          selected_hook_index: 0,
          body,
          cta,
          hashtags: ["AIAdoption", "ProgramManagement", "DigitalTransformation", "ChangeManagement"],
        };
        return tick(draft);
      },
    },

    visual: {
      mode: "demo",
      async visual(brief: Brief, angle: AngleCandidate): Promise<VisualDraft> {
        return tick({
          concept:
            "A single hand-drawn workflow on a whiteboard: five boxes left to right, with the long wait between box two and box three circled in amber and labelled \"the gap\". A shrink-wrapped software box sits unopened on the tray below — the purchase that skipped the diagnosis.",
          prompt: `Editorial photograph, 1200x627 crop. A clean office whiteboard photographed slightly off-axis in soft daylight. Five simple hand-drawn process boxes connected left to right in dark marker. The gap between the second and third box is circled in amber marker and labelled "the gap" in neat handwriting. On the whiteboard tray below, one unopened shrink-wrapped software box. Muted ink-and-teal palette, one amber accent, generous negative space on the right for text overlay. No people, no faces, no logos, no readable brand names, no chrome robots, no glowing blue AI clichés. Documentary lighting, shallow depth of field, photographic realism. Subject context: ${angle.headline}.`,
          negative_prompt:
            "stock-photo handshake, humanoid robot, glowing brain, circuit-board overlay, neon blue gradient, watermark, distorted text, logos, faces, cluttered background",
          aspect_ratio: "1200x627",
          alt_text: `A whiteboard workflow of five boxes with the wait between two steps circled in amber and labelled "the gap", next to an unopened software box — illustrating that ${firstClause(brief.pov, "buying a tool is not adoption")}.`,
        });
      },
      async generateImage(): Promise<string | null> {
        // No image model is connected. Demo Mode returns the prompt only.
        return null;
      },
    },

    qa: {
      mode: "demo",
      async review(input): Promise<QaReport> {
        const { brief, postText, hashtags, bannedWords, hasVerifiedResearch } = input;
        const chars = postText.length;
        const hookLines = postText.split("\n").slice(0, 2).join(" ");
        const found = bannedWords.filter((w) => w && postText.toLowerCase().includes(w.toLowerCase()));
        const hasNumbers = /\b\d{1,3}(?:[.,]\d+)?\s?%|\b(?:study|survey|report|research (?:shows|says))\b/i.test(
          postText,
        );

        const checks: QaCheck[] = [
          {
            id: "evidence",
            label: "No fabricated evidence",
            status: hasNumbers ? "fail" : "pass",
            explanation: hasNumbers
              ? "The draft references a statistic or study. Nothing external was retrieved, so this claim cannot be supported from the studio."
              : "The draft argues from operating experience and first principles. It cites no statistics, studies, named companies or quotes, so there is nothing unsourced to defend.",
            fix: hasNumbers ? "Remove the figure or replace it with a sourced claim a human has verified." : undefined,
          },
          {
            id: "research_provenance",
            label: "Research provenance is honest",
            status: hasVerifiedResearch ? "pass" : "warning",
            explanation: hasVerifiedResearch
              ? "A real research provider supplied the supporting material."
              : "Research for this run is Demo Mode example material generated from the brief, not retrieved sources. That is fine for drafting, but it must not be described as evidence.",
            fix: hasVerifiedResearch ? undefined : "Connect a research provider in Settings before citing sources externally.",
          },
          {
            id: "hook",
            label: "Hook earns the first two lines",
            status: hookLines.length > 0 && hookLines.length <= 160 ? "pass" : "warning",
            explanation:
              hookLines.length <= 160
                ? `The opening is ${hookLines.length} characters across two lines, so it survives the LinkedIn truncation point and states a position rather than teasing one.`
                : "The opening runs long and will be cut by the 'see more' fold before the idea lands.",
            fix: hookLines.length > 160 ? "Cut the first two lines to under 160 characters combined." : undefined,
          },
          {
            id: "single_idea",
            label: "One idea per post",
            status: "pass",
            explanation:
              "The draft carries a single argument — find the gap before buying the tool — and every section serves it. No second thesis competes for attention.",
          },
          {
            id: "cta",
            label: "Call to action is specific",
            status: /\b(map|draw|list|pick|choose|time|name|review)\b/i.test(postText) ? "pass" : "warning",
            explanation: /\b(map|draw|list|pick|choose|time|name|review)\b/i.test(postText)
              ? `The close names a concrete first step that matches the brief's desired action: "${brief.desired_action || "—"}".`
              : "The close asks for engagement rather than an action the reader can take today.",
            fix: undefined,
          },
          {
            id: "length",
            label: "Length fits the feed",
            status: chars <= 1300 ? "pass" : chars <= 2800 ? "warning" : "fail",
            explanation:
              chars <= 1300
                ? `${chars} characters. Comfortably inside LinkedIn's 3,000 character limit and short enough to read in one pass.`
                : chars <= 2800
                  ? `${chars} characters. Still allowed, but long for a feed read — expect drop-off after the list.`
                  : `${chars} characters exceeds LinkedIn's 3,000 character limit and will be rejected.`,
            fix: chars > 1300 ? "Cut the weakest list item and one transition sentence." : undefined,
          },
          {
            id: "hashtags",
            label: "Hashtags restrained",
            status: hashtags.length <= 5 ? "pass" : "warning",
            explanation:
              hashtags.length <= 5
                ? `${hashtags.length} hashtags, all topic-relevant. Under the five-tag guideline.`
                : `${hashtags.length} hashtags reads as reach-chasing and dilutes the topic signal.`,
            fix: hashtags.length > 5 ? "Keep the three most specific tags." : undefined,
          },
          {
            id: "banned",
            label: "Voice guardrails respected",
            status: found.length ? "fail" : "pass",
            explanation: found.length
              ? `Banned phrasing found: ${found.join(", ")}. These break the creator's voice rules set in Settings.`
              : "No banned phrases, hype language or engagement bait detected. Sentence length stays short and declarative.",
            fix: found.length ? "Replace the flagged phrases with plain description." : undefined,
          },
          {
            id: "audience_fit",
            label: "Audience fit",
            status: brief.audience ? "pass" : "warning",
            explanation: brief.audience
              ? `Written for ${brief.audience}: the examples are procurement, handoffs and decision queues, which this audience owns day to day.`
              : "No audience is set on the brief, so fit cannot be assessed.",
          },
          {
            id: "publish_ready",
            label: "Ready to publish",
            status: "warning",
            explanation:
              "Publishing and scheduling are disabled in this studio. No LinkedIn integration is configured, so the post can only be approved and exported by a human.",
            fix: "Connect a LinkedIn integration in Settings to enable scheduling.",
          },
        ];

        const verdict = checks.some((c) => c.status === "fail")
          ? "fail"
          : checks.some((c) => c.status === "warning")
            ? "warning"
            : "pass";

        const summary =
          verdict === "fail"
            ? "Blocking issues found. Fix the failed checks before requesting approval."
            : "No blocking issues. The open warnings are about provenance and publishing, both of which need a human decision rather than a rewrite.";

        return tick({ checks, verdict, summary });
      },
    },

    publish: {
      mode: "demo",
      configured: false,
      async schedule(): Promise<never> {
        throw new ProviderNotConfiguredError("LinkedIn publishing");
      },
    },
  };
}

export function renderAngleMarkdown(candidates: AngleCandidate[], selectedIndex: number): string {
  return `# angle.md

${DEMO_NOTICE}

${candidates
  .map(
    (a, i) => `## ${i + 1}. ${a.label}${i === selectedIndex ? "  ← selected" : ""}
**Headline:** ${a.headline}

${a.thesis}

- **Why it works:** ${a.why_it_works}
- **Risk:** ${a.risk}`,
  )
  .join("\n\n")}
`;
}

export function renderPostMarkdown(draft: PostDraft): string {
  const text = composePostText(draft);
  return `# post.md

${DEMO_NOTICE}

## Hook options
${draft.hooks
  .map(
    (h, i) => `${i + 1}. ${i === draft.selected_hook_index ? "**(selected)** " : ""}${h.text.replace(/\n/g, " / ")}
   - ${h.rationale}`,
  )
  .join("\n")}

## Draft
${text}

## Metrics
- Characters: ${text.length} / 3000
- Estimated read: ${readingSeconds(text)}s
- Hashtags: ${draft.hashtags.length}
`;
}

export function renderVisualMarkdown(visual: VisualDraft): string {
  return `# image-prompt.md

${DEMO_NOTICE} No image model is connected, so no image file was produced.

## Concept
${visual.concept}

## Generation prompt
\`\`\`text
${visual.prompt}
\`\`\`

## Negative prompt
\`\`\`text
${visual.negative_prompt}
\`\`\`

- **Aspect / size:** ${visual.aspect_ratio}
- **Alt text:** ${visual.alt_text}
`;
}

export function renderQaMarkdown(report: QaReport): string {
  const icon = { pass: "PASS", warning: "WARN", fail: "FAIL" } as const;
  return `# qa.md

${DEMO_NOTICE}

**Verdict:** ${report.verdict.toUpperCase()} — ${report.summary}

${report.checks
  .map(
    (c) => `## [${icon[c.status]}] ${c.label}
${c.explanation}${c.fix ? `\n\n**Fix:** ${c.fix}` : ""}`,
  )
  .join("\n\n")}
`;
}
