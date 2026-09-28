import { History, Loader2, RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { DemoNotice, StageEmpty } from "@/components/studio/demo-notice";
import { MarkdownPanel } from "@/components/studio/markdown-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RunBundle } from "@/lib/studio/api";
import { composePostText, formatReadingTime, readingSeconds, type PostVersion } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

export function PostTab({
  bundle,
  busy,
  saving,
  onRegenerate,
  onSave,
  onRestore,
  onSaveArtifact,
}: {
  bundle: RunBundle;
  busy: boolean;
  saving: boolean;
  onRegenerate: () => void;
  onSave: (patch: Partial<PostVersion>) => void;
  onRestore: (id: string) => void;
  onSaveArtifact: (artifactId: string, content: string) => void;
}) {
  const post = bundle.posts.find((p) => p.is_current) ?? bundle.posts[0];
  const artifact = bundle.artifacts.find((a) => a.kind === "post" && a.is_current);

  const [hookIndex, setHookIndex] = useState(post?.selected_hook_index ?? 0);
  const [body, setBody] = useState(post?.body ?? "");
  const [cta, setCta] = useState(post?.cta ?? "");
  const [tags, setTags] = useState((post?.hashtags ?? []).join(" "));

  useEffect(() => {
    if (!post) return;
    setHookIndex(post.selected_hook_index);
    setBody(post.body);
    setCta(post.cta);
    setTags(post.hashtags.join(" "));
  }, [post?.id, post?.updated_at]);

  if (!post) {
    return (
      <StageEmpty
        label="No draft yet"
        hint="Run the Post stage to write three hook options, a body, a call to action and hashtags from the selected angle."
      />
    );
  }

  const hashtags = tags
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#/, "").trim())
    .filter(Boolean);

  const preview = composePostText({
    hooks: post.hooks,
    selected_hook_index: hookIndex,
    body,
    cta,
    hashtags,
  });

  const dirty =
    hookIndex !== post.selected_hook_index ||
    body !== post.body ||
    cta !== post.cta ||
    hashtags.join(" ") !== post.hashtags.join(" ");

  return (
    <div className="space-y-4">
      <DemoNotice />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Draft <span className="text-muted-foreground">v{post.version}</span>
        </h3>
        <Button variant="outline" size="sm" disabled={busy} onClick={onRegenerate}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Regenerate draft
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Hook options</Label>
        {post.hooks.map((hook, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setHookIndex(i)}
            className={cn(
              "flex w-full gap-3 rounded-xl border p-3 text-left transition-colors",
              i === hookIndex ? "border-primary bg-accent/60" : "border-border bg-surface hover:border-primary/40",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border",
                i === hookIndex ? "border-primary bg-primary" : "border-input",
              )}
            >
              {i === hookIndex ? <span className="size-1.5 rounded-full bg-primary-foreground" /> : null}
            </span>
            <span className="min-w-0">
              <span className="block whitespace-pre-line text-sm font-medium leading-snug">{hook.text}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground">{hook.rationale}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-body" className="text-xs">
          Body
        </Label>
        <Textarea
          id="post-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-72 resize-y text-sm leading-relaxed"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="post-cta" className="text-xs">
            Call to action
          </Label>
          <Textarea
            id="post-cta"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="min-h-24 resize-y text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="post-tags" className="text-xs">
            Hashtags ({hashtags.length})
          </Label>
          <Input id="post-tags" value={tags} onChange={(e) => setTags(e.target.value)} className="text-sm" />
          <p className="text-[11px] text-muted-foreground">
            Space separated, no # needed. Five or fewer keeps the topic signal clean.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <Badge variant={preview.length > 3000 ? "destructive" : "secondary"} className="text-[10px]">
            {preview.length.toLocaleString()} / 3,000 characters
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {formatReadingTime(readingSeconds(preview))}
          </Badge>
          {dirty ? <span className="font-medium text-warning-foreground">Unsaved changes</span> : null}
        </div>
        <Button
          size="sm"
          disabled={!dirty || saving}
          onClick={() =>
            onSave({
              selected_hook_index: hookIndex,
              body,
              cta,
              hashtags,
              char_count: preview.length,
              reading_seconds: readingSeconds(preview),
            })
          }
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save draft
        </Button>
      </div>

      {bundle.posts.length > 1 ? (
        <div className="rounded-xl border border-border bg-surface p-3.5">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold">
            <History className="size-3.5" /> Version history
          </h4>
          <ul className="mt-2 space-y-1.5">
            {bundle.posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-muted-foreground">
                  v{p.version} · {p.char_count.toLocaleString()} chars ·{" "}
                  {new Date(p.updated_at).toLocaleString()}
                </span>
                {p.is_current ? (
                  <Badge variant="secondary" className="text-[10px]">
                    current
                  </Badge>
                ) : (
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => onRestore(p.id)}>
                    Restore
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <MarkdownPanel
        artifact={artifact}
        saving={saving}
        onSave={(content) => artifact && onSaveArtifact(artifact.id, content)}
      />
    </div>
  );
}
