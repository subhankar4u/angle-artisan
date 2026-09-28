import { Check, ChevronDown, Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Artifact } from "@/lib/studio/types";

export function MarkdownPanel({
  artifact,
  onSave,
  saving,
}: {
  artifact: Artifact | undefined;
  onSave: (content: string) => void;
  saving?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(artifact?.content_md ?? "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setValue(artifact?.content_md ?? "");
  }, [artifact?.id, artifact?.content_md]);

  if (!artifact) return null;
  const dirty = value !== artifact.content_md;

  return (
    <div className="rounded-xl border border-border bg-surface-2/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-medium">
          <span className="font-mono text-[11px] text-muted-foreground">{artifact.filename}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            v{artifact.version}
          </span>
          {dirty ? <span className="text-[10px] font-semibold text-warning-foreground">unsaved</span> : null}
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="space-y-2 border-t border-border p-3">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            className="min-h-64 resize-y font-mono text-[12px] leading-relaxed"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" disabled={!dirty || saving} onClick={() => onSave(value)}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Save {artifact.filename}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
