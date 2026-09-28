import { Loader2, Play, Plus, Save, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BriefInput } from "@/lib/studio/api";
import type { Brief, Project, WorkflowRun } from "@/lib/studio/types";

export function BriefPanel({
  project,
  brief,
  briefs,
  runs,
  activeRunId,
  onSelectRun,
  onSaveBrief,
  onNewRun,
  onFullRun,
  running,
  saving,
}: {
  project: Project;
  brief: Brief | null;
  briefs: Brief[];
  runs: WorkflowRun[];
  activeRunId: string | null;
  onSelectRun: (id: string) => void;
  onSaveBrief: (input: BriefInput) => void;
  onNewRun: () => void;
  onFullRun: () => void;
  running: boolean;
  saving: boolean;
}) {
  const [form, setForm] = useState<BriefInput>({
    topic: brief?.topic ?? project.topic,
    audience: brief?.audience ?? project.audience,
    pov: brief?.pov ?? project.pov,
    desired_action: brief?.desired_action ?? project.desired_action,
    tone: brief?.tone ?? "Direct, practical, senior operator",
    format: brief?.format ?? "text",
    keywords: brief?.keywords ?? [],
    notes: brief?.notes ?? "",
  });

  useEffect(() => {
    if (!brief) return;
    setForm({
      topic: brief.topic,
      audience: brief.audience,
      pov: brief.pov,
      desired_action: brief.desired_action,
      tone: brief.tone,
      format: brief.format,
      keywords: brief.keywords,
      notes: brief.notes,
    });
  }, [brief?.id]);

  const dirty =
    !!brief &&
    (form.topic !== brief.topic ||
      form.audience !== brief.audience ||
      form.pov !== brief.pov ||
      form.desired_action !== brief.desired_action ||
      form.tone !== brief.tone ||
      form.notes !== brief.notes ||
      form.keywords.join(",") !== brief.keywords.join(","));

  const field = (key: keyof BriefInput, label: string, hint: string, rows = 3) => (
    <div className="space-y-1.5">
      <Label htmlFor={key} className="text-xs">
        {label}
      </Label>
      <Textarea
        id={key}
        value={String(form[key] ?? "")}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="resize-y text-sm leading-relaxed"
        style={{ minHeight: `${rows * 1.75}rem` }}
      />
      <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content brief</h2>
          {brief ? (
            <Badge variant="secondary" className="text-[10px]">
              v{brief.version} of {briefs.length}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {field("topic", "Topic", "The idea in one sentence. This drives every downstream stage.", 3)}
        {field("audience", "Audience", "Who is reading, in their own job language.", 2)}
        {field("pov", "Point of view", "The position you are willing to defend.", 2)}
        {field("desired_action", "Desired action", "The one thing a reader should do after reading.", 2)}

        <div className="space-y-1.5">
          <Label htmlFor="tone" className="text-xs">
            Tone
          </Label>
          <Input
            id="tone"
            value={form.tone}
            onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="keywords" className="text-xs">
            Keywords
          </Label>
          <Input
            id="keywords"
            value={form.keywords.join(", ")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                keywords: e.target.value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean),
              }))
            }
            className="h-9 text-sm"
          />
        </div>

        {field("notes", "Notes for the agent", "Anything the agent must respect: constraints, examples, banned claims.", 3)}

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={!dirty || saving} onClick={() => onSaveBrief(form)}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save as v{(brief?.version ?? 0) + 1}
          </Button>
          {dirty ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                brief &&
                setForm({
                  topic: brief.topic,
                  audience: brief.audience,
                  pov: brief.pov,
                  desired_action: brief.desired_action,
                  tone: brief.tone,
                  format: brief.format,
                  keywords: brief.keywords,
                  notes: brief.notes,
                })
              }
            >
              <Undo2 className="size-3.5" /> Revert
            </Button>
          ) : null}
        </div>
        {dirty ? (
          <p className="text-[11px] text-warning-foreground">
            Unsaved brief edits. Saving creates a new brief version; existing runs keep the version they used.
          </p>
        ) : null}

        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Runs</h3>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={onNewRun}>
              <Plus className="size-3.5" /> New run
            </Button>
          </div>
          <ul className="space-y-1">
            {runs.map((run) => (
              <li key={run.id}>
                <button
                  type="button"
                  onClick={() => onSelectRun(run.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    run.id === activeRunId ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className="truncate">
                    {run.label}
                    <span className="ml-1.5 text-[10px] text-muted-foreground">
                      {new Date(run.created_at).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{run.status.replace("_", " ")}</span>
                </button>
              </li>
            ))}
            {!runs.length ? <li className="px-2.5 text-[11px] text-muted-foreground">No runs yet.</li> : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <Button className="w-full" disabled={running || !activeRunId} onClick={onFullRun}>
          {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          {running ? "Running all stages…" : "Full run"}
        </Button>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Executes Research → Angle → Post → Visual → QA → Preview in order, then stops for human approval.
        </p>
      </div>
    </div>
  );
}
