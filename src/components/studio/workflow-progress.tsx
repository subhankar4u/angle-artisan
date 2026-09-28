import { AlertCircle, Check, Loader2, Lock, Play, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { STAGE_IDS, STAGE_META, type StageId, type WorkflowStage } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

export function WorkflowProgress({
  stages,
  activeStage,
  runningStage,
  onSelect,
  onRun,
}: {
  stages: WorkflowStage[];
  activeStage: StageId;
  runningStage: StageId | null;
  onSelect: (stage: StageId) => void;
  onRun: (stage: StageId) => void;
}) {
  const byId = new Map(stages.map((s) => [s.stage, s]));
  const done = stages.filter((s) => s.status === "complete").length;

  return (
    <div className="border-t border-border bg-surface px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workflow · {done} of {STAGE_IDS.length} stages complete
        </p>
        <p className="text-[11px] text-muted-foreground">Click a stage to open it, or run it on its own.</p>
      </div>

      <ol className="flex flex-wrap gap-2">
        {STAGE_IDS.map((id, i) => {
          const stage = byId.get(id);
          const status = runningStage === id ? "running" : (stage?.status ?? "pending");
          const active = activeStage === id;
          return (
            <li key={id} className="min-w-0 flex-1">
              <div
                className={cn(
                  "group flex h-full flex-col rounded-xl border px-3 py-2 transition-colors",
                  active ? "border-primary/60 bg-accent" : "border-border bg-surface-2/50 hover:border-primary/30",
                  status === "error" && "border-destructive/60",
                )}
              >
                <button type="button" onClick={() => onSelect(id)} className="min-w-0 text-left">
                  <span className="flex items-center gap-1.5">
                    <StatusDot status={status} index={i} />
                    <span className="truncate text-xs font-medium">{STAGE_META[id].label}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                    {status === "error"
                      ? (stage?.error_message ?? "Failed")
                      : status === "blocked"
                        ? "Needs a human"
                        : status === "complete"
                          ? STAGE_META[id].short
                          : status === "running"
                            ? "Working…"
                            : "Pending"}
                  </span>
                </button>
                {id !== "idea" && id !== "approval" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1.5 h-6 justify-start gap-1 px-1 text-[10px]"
                    disabled={!!runningStage}
                    onClick={() => onRun(id)}
                  >
                    {status === "complete" || status === "error" ? (
                      <RotateCw className="size-3" />
                    ) : (
                      <Play className="size-3" />
                    )}
                    {status === "complete" ? "Re-run" : status === "error" ? "Retry" : "Run"}
                  </Button>
                ) : (
                  <span className="mt-1.5 flex h-6 items-center px-1 text-[10px] text-muted-foreground">
                    {id === "idea" ? "From brief" : "Manual sign-off"}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatusDot({ status, index }: { status: string; index: number }) {
  if (status === "running") return <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />;
  if (status === "complete") return <Check className="size-3.5 shrink-0 text-success" />;
  if (status === "error") return <AlertCircle className="size-3.5 shrink-0 text-destructive" />;
  if (status === "blocked") return <Lock className="size-3.5 shrink-0 text-warning-foreground" />;
  return (
    <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full border border-border text-[8px] text-muted-foreground">
      {index + 1}
    </span>
  );
}
