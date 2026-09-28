import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

import { DemoNotice, StageEmpty } from "@/components/studio/demo-notice";
import { MarkdownPanel } from "@/components/studio/markdown-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RunBundle } from "@/lib/studio/api";
import { cn } from "@/lib/utils";

export function AngleTab({
  bundle,
  busy,
  onRegenerate,
  onSelect,
  onSaveArtifact,
  saving,
}: {
  bundle: RunBundle;
  busy: boolean;
  onRegenerate: () => void;
  onSelect: (angleId: string) => void;
  onSaveArtifact: (artifactId: string, content: string) => void;
  saving: boolean;
}) {
  const artifact = bundle.artifacts.find((a) => a.kind === "angle" && a.is_current);

  if (!bundle.angles.length) {
    return (
      <StageEmpty
        label="No angles generated yet"
        hint="Run the Angle stage to produce three candidate angles. You choose one; the Post stage writes from your choice."
      />
    );
  }

  return (
    <div className="space-y-4">
      <DemoNotice />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Candidate angles (choose one)</h3>
        <Button variant="outline" size="sm" disabled={busy} onClick={onRegenerate}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Regenerate angles
        </Button>
      </div>

      <div className="grid gap-3">
        {bundle.angles.map((angle) => (
          <button
            key={angle.id}
            type="button"
            onClick={() => onSelect(angle.id)}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              angle.is_selected
                ? "border-primary bg-accent/60 ring-1 ring-primary/30"
                : "border-border bg-surface hover:border-primary/40",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                  {angle.label}
                </Badge>
                <p className="mt-2 text-sm font-semibold leading-snug">{angle.headline}</p>
              </div>
              {angle.is_selected ? (
                <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-primary">
                  <CheckCircle2 className="size-3.5" /> Selected
                </span>
              ) : (
                <span className="shrink-0 text-[11px] text-muted-foreground">Select</span>
              )}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{angle.thesis}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <p className="text-[11px] leading-relaxed">
                <span className="font-medium text-success">Why it works: </span>
                <span className="text-muted-foreground">{angle.why_it_works}</span>
              </p>
              <p className="flex gap-1.5 text-[11px] leading-relaxed">
                <AlertTriangle className="mt-px size-3 shrink-0 text-warning" />
                <span className="text-muted-foreground">{angle.risk}</span>
              </p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Changing the angle does not rewrite the draft automatically — regenerate the Post stage when you want the
        draft to follow a new angle.
      </p>

      <MarkdownPanel
        artifact={artifact}
        saving={saving}
        onSave={(content) => artifact && onSaveArtifact(artifact.id, content)}
      />
    </div>
  );
}
