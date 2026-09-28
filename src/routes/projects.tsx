import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Loader2, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/lib/studio/api";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — 180 LIFT AI Content Studio" },
      {
        name: "description",
        content: "Every content brief in the studio, with its runs, drafts and approval state.",
      },
      { property: "og:title", content: "Projects — 180 LIFT AI Content Studio" },
      { property: "og:description", content: "Briefs, runs and approval state for every piece of content." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const qc = useQueryClient();
  const projectsQ = useQuery({ queryKey: api.qk.projects, queryFn: api.fetchProjects });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    topic: "",
    audience: "Working professionals / program managers",
    pov: "",
    desired_action: "",
  });

  const create = useMutation({
    mutationFn: () =>
      api.createProject({
        name: form.name || form.topic.slice(0, 60),
        topic: form.topic,
        audience: form.audience,
        pov: form.pov,
        desired_action: form.desired_action,
        tone: "Direct, practical, senior operator",
        format: "text",
        keywords: [],
        notes: "",
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: api.qk.projects });
      setOpen(false);
      setForm({ name: "", topic: "", audience: form.audience, pov: "", desired_action: "" });
      toast.success("Project created");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create the project"),
  });

  return (
    <AppShell
      title="Projects"
      subtitle="Each project holds one brief history and its workflow runs"
      actions={
        <Button size="sm" onClick={() => setOpen((o) => !o)}>
          <Plus className="size-4" /> New project
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl space-y-5 p-5">
        {open ? (
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold">New project</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Audience" value={form.audience} onChange={(v) => setForm({ ...form, audience: v })} />
            </div>
            <AreaField label="Topic" value={form.topic} onChange={(v) => setForm({ ...form, topic: v })} />
            <AreaField label="Point of view" value={form.pov} onChange={(v) => setForm({ ...form, pov: v })} />
            <AreaField
              label="Desired action"
              value={form.desired_action}
              onChange={(v) => setForm({ ...form, desired_action: v })}
            />
            <div className="flex gap-2">
              <Button size="sm" disabled={!form.topic.trim() || create.isPending} onClick={() => create.mutate()}>
                {create.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null} Create project
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {projectsQ.isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading projects…
          </p>
        ) : projectsQ.error ? (
          <div className="flex flex-col items-start gap-2 rounded-xl border border-destructive/40 bg-surface p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="size-4 text-destructive" /> Projects could not be loaded
            </p>
            <p className="text-xs text-muted-foreground">
              {projectsQ.error instanceof Error ? projectsQ.error.message : "Unknown error"}
            </p>
            <Button variant="outline" size="sm" onClick={() => void projectsQ.refetch()}>
              <RefreshCw className="size-3.5" /> Try again
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {(projectsQ.data ?? []).map((project) => (
              <li key={project.id}>
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
                >
                  <p className="text-sm font-semibold">{project.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.topic}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {project.audience} · updated {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            ))}
            {!projectsQ.data?.length ? (
              <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No projects yet.
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm" />
    </div>
  );
}

function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-20 text-sm" />
    </div>
  );
}
