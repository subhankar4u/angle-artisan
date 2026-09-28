import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Plug, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/lib/studio/api";
import type { CreatorSettings } from "@/lib/studio/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — 180 LIFT AI Content Studio" },
      {
        name: "description",
        content: "Creator profile, voice guidelines, system prompt and integration status.",
      },
      { property: "og:title", content: "Settings — 180 LIFT AI Content Studio" },
      { property: "og:description", content: "Creator profile, system prompt and integrations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const settingsQ = useQuery({ queryKey: api.qk.settings, queryFn: api.fetchSettings });

  const [form, setForm] = useState<CreatorSettings | null>(null);

  useEffect(() => {
    if (settingsQ.data && !form) setForm(settingsQ.data);
  }, [settingsQ.data, form]);

  const saveM = useMutation({
    mutationFn: (patch: Partial<CreatorSettings>) => api.updateSettings(patch),
    onSuccess: (data) => {
      setForm(data);
      void queryClient.invalidateQueries({ queryKey: api.qk.settings });
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  if (settingsQ.isPending || !form) {
    return (
      <AppShell title="Settings">
        <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading settings…
        </p>
      </AppShell>
    );
  }

  if (settingsQ.error) {
    return (
      <AppShell title="Settings">
        <div className="space-y-2 p-6">
          <p className="text-sm font-medium">Settings could not be loaded.</p>
          <Button variant="outline" size="sm" onClick={() => void settingsQ.refetch()}>
            Try again
          </Button>
        </div>
      </AppShell>
    );
  }

  const set = <K extends keyof CreatorSettings>(key: K, value: CreatorSettings[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <AppShell
      title="Settings"
      subtitle="Creator profile, voice and integrations"
      demoMode={form.demo_mode}
      actions={
        <Button
          size="sm"
          disabled={saveM.isPending}
          onClick={() =>
            saveM.mutate({
              creator_name: form.creator_name,
              headline: form.headline,
              avatar_initials: form.avatar_initials,
              tone_guidelines: form.tone_guidelines,
              banned_words: form.banned_words,
              system_prompt: form.system_prompt,
              demo_mode: form.demo_mode,
            })
          }
        >
          {saveM.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save settings
        </Button>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6 p-5">
        <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Creator profile
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="creator_name">Name</Label>
              <Input
                id="creator_name"
                value={form.creator_name}
                onChange={(e) => set("creator_name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatar_initials">Avatar initials</Label>
              <Input
                id="avatar_initials"
                value={form.avatar_initials}
                maxLength={3}
                onChange={(e) => set("avatar_initials", e.target.value.toUpperCase())}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="headline">LinkedIn headline</Label>
            <Textarea
              id="headline"
              rows={2}
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Shown under your name in the LinkedIn preview.
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Voice & guardrails
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="tone_guidelines">Tone guidelines</Label>
            <Textarea
              id="tone_guidelines"
              rows={3}
              value={form.tone_guidelines}
              onChange={(e) => set("tone_guidelines", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="banned_words">Banned words (comma separated)</Label>
            <Input
              id="banned_words"
              value={form.banned_words.join(", ")}
              onChange={(e) =>
                set(
                  "banned_words",
                  e.target.value
                    .split(",")
                    .map((w) => w.trim())
                    .filter(Boolean),
                )
              }
            />
            <p className="text-[11px] text-muted-foreground">
              The QA stage flags any post that uses these words.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="system_prompt">System prompt</Label>
            <Textarea
              id="system_prompt"
              rows={6}
              className="font-mono text-xs"
              value={form.system_prompt}
              onChange={(e) => set("system_prompt", e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Passed to the writing provider when a real AI integration is connected.
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mode
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Demo Mode</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Generates realistic example content locally. Research sources are illustrative and
                marked as not retrieved — nothing is fetched from the web.
              </p>
            </div>
            <Switch
              checked={form.demo_mode}
              onCheckedChange={(v) => set("demo_mode", v)}
              aria-label="Toggle Demo Mode"
            />
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-surface p-5">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Plug className="size-3.5" /> Integrations
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The studio is wired behind provider interfaces, so each integration below can be
            connected without changing the workflow. Until then, Demo Mode fills every stage with
            clearly-labelled example content.
          </p>
          <ul className="space-y-2">
            <IntegrationRow label="AI writing provider" configured={form.ai_provider_configured} />
            <IntegrationRow
              label="Web research provider"
              configured={form.research_provider_configured}
            />
            <IntegrationRow
              label="Image generation provider"
              configured={form.image_provider_configured}
            />
            <IntegrationRow label="LinkedIn publishing" configured={form.linkedin_connected} />
          </ul>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Scheduling and publishing stay disabled until a LinkedIn integration is configured and
            a human has approved the post.
          </p>
        </section>
      </div>
    </AppShell>
  );
}

function IntegrationRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5">
      <span className="text-xs font-medium">{label}</span>
      {configured ? (
        <Badge variant="secondary" className="gap-1 text-[10px]">
          <Check className="size-3" /> Connected
        </Badge>
      ) : (
        <Badge variant="outline" className="text-[10px]">
          Not configured
        </Badge>
      )}
    </li>
  );
}
