import { Info, ShieldAlert, Sparkles } from "lucide-react";
import { createContext, useContext } from "react";

export const RunModeContext = createContext<"demo" | "live">("demo");

export function DemoNotice({ compact = false }: { compact?: boolean }) {
  const mode = useContext(RunModeContext);
  if (mode === "live") {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Live Mode.</span> Written and illustrated by AI from your
          brief. No web research is connected, so nothing here is a verified source — review before approving.
        </div>
      </div>
    );
  }
  if (compact) {
    return (
      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0 text-signal" />
        Demo Mode output. Generated from the brief only — no web research was retrieved and no external API was
        called.
      </p>
    );
  }
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-signal/40 bg-signal/10 px-3 py-2.5">
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-signal-foreground" />
      <div className="text-xs leading-relaxed text-signal-foreground">
        <span className="font-semibold">Demo Mode.</span> Every artifact on this run is deterministic example
        content generated locally from the brief. Nothing was retrieved from the web, no AI or image provider was
        called, and none of it should be presented as real research.
      </div>
    </div>
  );
}

export function StageEmpty({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex h-full min-h-56 flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="text-sm font-medium">{label}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
