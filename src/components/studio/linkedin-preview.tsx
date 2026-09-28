import { Eye, Globe2, ImageOff, MessageSquare, Repeat2, Send, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { composePostText, formatReadingTime, readingSeconds } from "@/lib/studio/types";
import type { CreatorSettings, PostVersion, VisualPrompt } from "@/lib/studio/types";

export function LinkedInPreview({
  post,
  visual,
  settings,
}: {
  post: PostVersion | undefined;
  visual: VisualPrompt | undefined;
  settings: CreatorSettings;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = post ? composePostText(post) : "";
  const isLong = text.length > 480;
  const shown = expanded || !isLong ? text : `${text.slice(0, 480).trimEnd()}…`;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-signal/40 bg-signal/10 px-3 py-2.5">
        <Eye className="mt-0.5 size-4 shrink-0 text-signal-foreground" />
        <p className="text-[11px] leading-relaxed text-signal-foreground">
          <span className="font-semibold">Simulated preview.</span> This is a local rendering to check how the draft
          reads in a feed. It is not connected to LinkedIn, nothing has been posted, and no metrics are real.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <div className="flex items-start gap-3 p-4 pb-2">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-ink-foreground">
            {settings.avatar_initials || "SD"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{settings.creator_name}</p>
            <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{settings.headline}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              Draft · <Globe2 className="size-3" /> Anyone
            </p>
          </div>
        </div>

        <div className="px-4 pb-3">
          {post ? (
            <>
              <p className="whitespace-pre-line text-[13.5px] leading-[1.55]">{shown}</p>
              {isLong ? (
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="mt-1 text-[13px] font-medium text-muted-foreground hover:text-foreground"
                >
                  {expanded ? "see less" : "…see more"}
                </button>
              ) : null}
            </>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Run the Post stage to see the draft rendered here.
            </p>
          )}
        </div>

        {visual ? (
          <div className="border-y border-border bg-surface-2/70 px-4 py-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <ImageOff className="size-5 text-muted-foreground" />
              <p className="text-[11px] font-medium">Image placeholder ({visual.aspect_ratio})</p>
              <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
                No image has been generated. The Visual stage produced a concept and prompt only.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
          {[
            { icon: ThumbsUp, label: "Like" },
            { icon: MessageSquare, label: "Comment" },
            { icon: Repeat2, label: "Repost" },
            { icon: Send, label: "Send" },
          ].map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              disabled
              className="flex-1 gap-1.5 text-[11px] text-muted-foreground"
            >
              <action.icon className="size-3.5" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {post ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {text.length.toLocaleString()} characters
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {formatReadingTime(readingSeconds(text))}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {post.hashtags.length} hashtags
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            draft v{post.version}
          </Badge>
        </div>
      ) : null}
    </div>
  );
}
