import { Check, Copy, ImageOff, Loader2, RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { DemoNotice, StageEmpty } from "@/components/studio/demo-notice";
import { MarkdownPanel } from "@/components/studio/markdown-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { updateVisual, type RunBundle } from "@/lib/studio/api";
import { generateImageFor } from "@/lib/studio/live-provider";
import type { VisualPrompt } from "@/lib/studio/types";

export function VisualTab({
  bundle,
  busy,
  saving,
  onRegenerate,
  onSave,
  onSaveArtifact,
}: {
  bundle: RunBundle;
  busy: boolean;
  saving: boolean;
  onRegenerate: () => void;
  onSave: (id: string, patch: Partial<VisualPrompt>) => void;
  onSaveArtifact: (artifactId: string, content: string) => void;
}) {
  const visual = bundle.visuals.find((v) => v.is_current) ?? bundle.visuals[0];
  const artifact = bundle.artifacts.find((a) => a.kind === "image_prompt" && a.is_current);

  const [concept, setConcept] = useState(visual?.concept ?? "");
  const [prompt, setPrompt] = useState(visual?.prompt ?? "");
  const [negative, setNegative] = useState(visual?.negative_prompt ?? "");
  const [alt, setAlt] = useState(visual?.alt_text ?? "");
  const [copied, setCopied] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!visual) return;
    setConcept(visual.concept);
    setPrompt(visual.prompt);
    setNegative(visual.negative_prompt);
    setAlt(visual.alt_text);
  }, [visual?.id]);

  if (!visual) {
    return (
      <StageEmpty
        label="No visual concept yet"
        hint="Run the Visual stage to produce an image concept, a generation prompt and alt text. No image is generated until an image provider is connected."
      />
    );
  }

  const dirty =
    concept !== visual.concept ||
    prompt !== visual.prompt ||
    negative !== visual.negative_prompt ||
    alt !== visual.alt_text;

  return (
    <div className="space-y-4">
      <DemoNotice />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Image concept <span className="text-muted-foreground">v{visual.version}</span>
        </h3>
        <Button variant="outline" size="sm" disabled={busy} onClick={onRegenerate}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Regenerate visual
        </Button>
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-surface-2/60 p-3">
        {visual.image_url ? (
          <img src={visual.image_url} alt={visual.alt_text} className="w-full rounded-md border border-border" />
        ) : (
          <div className="flex items-start gap-2.5">
            <ImageOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-relaxed text-muted-foreground">No image generated yet for this prompt.</p>
          </div>
        )}
        {imgError ? <p className="text-xs text-destructive">{imgError}</p> : null}
        <Button
          size="sm"
          variant={visual.image_url ? "outline" : "default"}
          disabled={imgBusy || busy}
          onClick={async () => {
            setImgBusy(true);
            setImgError(null);
            try {
              const url = await generateImageFor(prompt, negative);
              await updateVisual(visual.id, { image_url: url });
              await qc.invalidateQueries();
            } catch (e) {
              setImgError(e instanceof Error ? e.message : "Image generation failed. Please retry.");
            } finally {
              setImgBusy(false);
            }
          }}
        >
          {imgBusy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          {imgBusy ? "Generating image… (up to a minute)" : visual.image_url ? "Regenerate image" : "Generate image"}
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Concept</Label>
        <Textarea
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          className="min-h-28 resize-y text-sm leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Generation prompt</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={() => {
              void navigator.clipboard.writeText(prompt);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy prompt"}
          </Button>
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-44 resize-y font-mono text-[12px] leading-relaxed"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Negative prompt</Label>
          <Textarea
            value={negative}
            onChange={(e) => setNegative(e.target.value)}
            className="min-h-24 resize-y font-mono text-[12px]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Alt text</Label>
          <Textarea
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="min-h-24 resize-y text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant="secondary" className="text-[10px]">
          {visual.aspect_ratio}
        </Badge>
        <div className="flex items-center gap-2">
          {dirty ? <span className="text-[11px] font-medium text-warning-foreground">Unsaved changes</span> : null}
          <Button
            size="sm"
            disabled={!dirty || saving}
            onClick={() =>
              onSave(visual.id, { concept, prompt, negative_prompt: negative, alt_text: alt })
            }
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save visual
          </Button>
        </div>
      </div>

      <MarkdownPanel
        artifact={artifact}
        saving={saving}
        onSave={(content) => artifact && onSaveArtifact(artifact.id, content)}
      />
    </div>
  );
}
