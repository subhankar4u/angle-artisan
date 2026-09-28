import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, FolderKanban, Loader2, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DemoNotice } from "@/components/studio/demo-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/studio/api";
import { STAGE_META } from "@/lib/studio/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — 180 LIFT AI Content Studio" },
      {
        name: "description",
        content:
          "Overview of your LinkedIn content projects, workflow runs and approval state in 180 LIFT AI Content Studio.",
      },
      { property: "og:title", content: "Dashboard — 180 LIFT AI Content Studio" },
      {
        property: "og:description",
        content: "Projects, workflow runs and approvals at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const settingsQ = useQuery({ queryKey: api.qk.settings, queryFn: api.fetchSettings });
  const projectsQ = useQuery({ queryKey: api.qk.projects, queryFn: api.fetchProjects });
  const runsQ = useQuery({ queryKey: api.qk.allRuns, queryFn: api.fetchAllRuns });

  const settings = settingsQ.data;
  const projects = projectsQ.data ?? [];
  const runs = runsQ.data ?? [];

  const loading = settingsQ.isPending || projectsQ.isPending || runsQ.isPending;
  const failed = settingsQ.error || projectsQ.error || runsQ.error;

  return (
    <AppShell
      title="Dashboard"
      subtitle={settings ? `Workspace for ${settings.creator_name}` : undefined}
      demoMode={settings?.demo_mode ?? true}
      actions={
        <Button size="sm" asChild>
          <Link to="/studio">
            Open Studio <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6 p-5">
        {settings?.demo_mode ? <DemoNotice /> : null}

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading workspace…
          </p>
        ) : failed ? (
          <div className="space-y-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="text-sm font-medium">The dashboard could not be loaded.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void settingsQ.refetch();
                void projectsQ.refetch();
                void runsQ.refetch();
              }}
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Projects" value={projects.length} />
              <Stat label="Workflow runs" value={runs.length} />
              <Stat
                label="Runs awaiting approval"
                value={runs.filter((r) => r.status === "awaiting_approval").length}
              />
            </div>

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Projects
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/projects">
                    <Plus className="size-3.5" /> New project
                  </Link>
                </Button>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: project.id }}
                      className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
                    >
                      <p className="text-sm font-semibold leading-snug">{project.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {project.topic}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {project.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          Updated {new Date(project.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
                {!projects.length ? (
                  <li className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground sm:col-span-2">
                    No projects yet. Create one to start a content run.
                  </li>
                ) : null}
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent runs
              </h2>
              <ul className="space-y-2">
                {runs.slice(0, 8).map((run) => {
                  const project = projects.find((p) => p.id === run.project_id);
                  return (
                    <li
                      key={run.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {run.label}
                          {project ? ` · ${project.name}` : ""}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(run.created_at).toLocaleString()} · at{" "}
                          {STAGE_META[run.current_stage]?.label ?? run.current_stage}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {run.mode}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {run.status.replaceAll("_", " ")}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
                {!runs.length ? (
                  <li className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No runs yet. Open the Studio and start a Full Run.
                  </li>
                ) : null}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <FlaskConical className="mt-0.5 size-4 text-primary" />
                <div className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground">How this studio works</p>
                  <p>
                    Every project moves through Idea → Research → Angle → Post → Visual → QA →
                    Preview → Approval. Nothing is published from here — scheduling and publishing
                    stay locked until a real LinkedIn integration is connected in Settings.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link to="/projects">
                      <FolderKanban className="size-3.5" /> Browse projects
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
