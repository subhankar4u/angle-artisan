import { FlaskConical, Loader2, RefreshCw } from "lucide-react";

import { MarkdownPanel } from "@/components/studio/markdown-panel";
import { DemoNotice, StageEmpty } from "@/components/studio/demo-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RunBundle } from "@/lib/studio/api";

export function ResearchTab({
  bundle,
  busy,
  onRegenerate,
  onSaveArtifact,
  saving,
}: {
  bundle: RunBundle;
  busy: boolean;
  onRegenerate: () => void;
  onSaveArtifact: (artifactId: string, content: string) => void;
  saving: boolean;
}) {
  const artifact = bundle.artifacts.find((a) => a.kind === "research" && a.is_current);
  const sources = bundle.sources;

  if (!artifact && !sources.length) {
    return (
      <StageEmpty
        label="Research has not run yet"
        hint="Run the Research stage to gather supporting material for this brief. In Demo Mode the material is generated locally and labelled as example content."
      />
    );
  }

  return (
    <div className="space-y-4">
      <DemoNotice />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Supporting material ({sources.length})</h3>
        <Button variant="outline" size="sm" disabled={busy} onClick={onRegenerate}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Regenerate research
        </Button>
      </div>

      <ul className="space-y-2.5">
        {sources.map((s) => (
          <li key={s.id} className="rounded-xl border border-border bg-surface p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{s.title}</span>
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                {s.source_type.replace("_", " ")}
              </Badge>
              {s.is_demo ? (
                <Badge variant="outline" className="border-signal/50 bg-signal/10 text-[10px] text-signal-foreground">
                  Example — not retrieved
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.snippet}</p>
            <p className="mt-2 text-[11px] leading-relaxed">
              <span className="font-medium">Why it matters: </span>
              <span className="text-muted-foreground">{s.relevance}</span>
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <FlaskConical className="size-3" />
              {s.publisher}
              {s.url ? ` · ${s.url}` : " · no link, because nothing was fetched"}
            </p>
          </li>
        ))}
      </ul>

      <MarkdownPanel
        artifact={artifact}
        saving={saving}
        onSave={(content) => artifact && onSaveArtifact(artifact.id, content)}
      />
    </div>
  );
}
