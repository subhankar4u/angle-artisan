import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/studio/api";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project — 180 LIFT AI Content Studio" },
      { name: "description", content: "Brief history, workflow runs and approval state for this content project." },
      { property: "og:title", content: "Project — 180 LIFT AI Content Studio" },
      { property: "og:description", content: "Brief versions, runs and approval state for one content project." },
    ],
  }),
  component: ProjectDetail,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive" role="alert">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-sm text-muted-foreground">Project not found.</div>,
});

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const projectQ = useQuery({ queryKey: api.qk.project(projectId), queryFn: () => api.fetchProject(projectId) });
  const briefsQ = useQuery({ queryKey: api.qk.briefs(projectId), queryFn: () => api.fetchBriefs(projectId) });
  const runsQ = useQuery({ queryKey: api.qk.runs(projectId), queryFn: () => api.fetchRuns(projectId) });

  if (projectQ.isPending) {
    return (
      <AppShell title="Project">
        <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading project…
        </p>
      </AppShell>
    );
  }

  if (projectQ.error || !projectQ.data) {
    return (
      <AppShell title="Project">
        <div className="space-y-2 p-6">
          <p className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="size-4 text-destructive" /> This project could not be loaded
          </p>
          <Button variant="outline" size="sm" onClick={() => void projectQ.refetch()}>
            Try again
          </Button>
        </div>
      </AppShell>
    );
  }

  const project = projectQ.data;

  return (
    <AppShell
      title={project.name}
      subtitle={project.topic}
      actions={
        <Button size="sm" asChild>
          <Link to="/studio" search={{ project: project.id } as never}>
            Open in Studio <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl space-y-6 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Facts label="Audience" value={project.audience} />
          <Facts label="Point of view" value={project.pov} />
          <Facts label="Desired action" value={project.desired_action} />
          <Facts label="Status" value={project.status} />
        </div>

        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brief versions</h2>
          {briefsQ.isPending ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : (
            <ul className="space-y-2">
              {(briefsQ.data ?? []).map((brief) => (
                <li key={brief.id} className="rounded-xl border border-border bg-surface p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold">Version {brief.version}</p>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(brief.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{brief.topic}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Runs</h2>
          {runsQ.isPending ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : (
            <ul className="space-y-2">
              {(runsQ.data ?? []).map((run) => (
                <li
                  key={run.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface p-3.5"
                >
                  <div>
                    <p className="text-xs font-semibold">{run.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(run.created_at).toLocaleString()} · stage {run.current_stage}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {run.mode}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {run.status.replace("_", " ")}
                    </Badge>
                  </div>
                </li>
              ))}
              {!runsQ.data?.length ? (
                <li className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                  No runs yet. Open the Studio to start one.
                </li>
              ) : null}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Facts({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed">{value || "—"}</p>
    </div>
  );
}
