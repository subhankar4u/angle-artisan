import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";

import { DemoNotice, StageEmpty } from "@/components/studio/demo-notice";
import { MarkdownPanel } from "@/components/studio/markdown-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RunBundle } from "@/lib/studio/api";
import type { QaCheck } from "@/lib/studio/types";

const ICON = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  fail: XCircle,
};

const TONE = {
  pass: "text-success",
  warning: "text-warning",
  fail: "text-destructive",
};

const LABEL = { pass: "Pass", warning: "Warning", fail: "Fail" };

export function QaTab({
  bundle,
  busy,
  saving,
  onRegenerate,
  onSaveArtifact,
}: {
  bundle: RunBundle;
  busy: boolean;
  saving: boolean;
  onRegenerate: () => void;
  onSaveArtifact: (artifactId: string, content: string) => void;
}) {
  const qa = bundle.qa.find((q) => q.is_current) ?? bundle.qa[0];
  const artifact = bundle.artifacts.find((a) => a.kind === "qa" && a.is_current);

  if (!qa) {
    return (
      <StageEmpty
        label="No QA review yet"
        hint="Run the QA stage to check the draft against evidence integrity, hook strength, length, voice guardrails and publish readiness. Every check explains itself."
      />
    );
  }

  const checks = (qa.checks ?? []) as QaCheck[];
  const counts = {
    pass: checks.filter((c) => c.status === "pass").length,
    warning: checks.filter((c) => c.status === "warning").length,
    fail: checks.filter((c) => c.status === "fail").length,
  };

  return (
    <div className="space-y-4">
      <DemoNotice />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">Review v{qa.version}</h3>
          <Badge variant="secondary" className="text-[10px] text-success">
            {counts.pass} pass
          </Badge>
          <Badge variant="secondary" className="text-[10px] text-warning-foreground">
            {counts.warning} warning
          </Badge>
          <Badge variant="secondary" className="text-[10px] text-destructive">
            {counts.fail} fail
          </Badge>
        </div>
        <Button variant="outline" size="sm" disabled={busy} onClick={onRegenerate}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Re-run QA
        </Button>
      </div>

      <p className="rounded-lg border border-border bg-surface-2/60 px-3.5 py-2.5 text-xs leading-relaxed">
        <span className="font-semibold">Verdict: {qa.verdict.toUpperCase()}.</span> {qa.summary}
      </p>

      <ul className="space-y-2.5">
        {checks.map((check) => {
          const Icon = ICON[check.status];
          return (
            <li key={check.id} className="rounded-xl border border-border bg-surface p-3.5">
              <div className="flex items-start gap-2.5">
                <Icon className={`mt-0.5 size-4 shrink-0 ${TONE[check.status]}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {check.label}{" "}
                    <span className={`text-[11px] font-semibold ${TONE[check.status]}`}>
                      {LABEL[check.status]}
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{check.explanation}</p>
                  {check.fix ? (
                    <p className="mt-1.5 text-[11px] leading-relaxed">
                      <span className="font-medium">Fix: </span>
                      <span className="text-muted-foreground">{check.fix}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <MarkdownPanel
        artifact={artifact}
        saving={saving}
        onSave={(content) => artifact && onSaveArtifact(artifact.id, content)}
      />
    </div>
  );
}
