import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StudioWorkspace } from "@/components/studio/studio-workspace";
import * as api from "@/lib/studio/api";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — 180 LIFT AI Content Studio" },
      {
        name: "description",
        content:
          "Run a LinkedIn post from idea to human approval: research, angle, draft, visual prompt, QA and feed preview in one workspace.",
      },
      { property: "og:title", content: "Studio — 180 LIFT AI Content Studio" },
      {
        property: "og:description",
        content: "Idea to approval in one workspace. Demo Mode content is clearly labelled and nothing publishes.",
      },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const requested = search?.get("project");
  const settingsQ = useQuery({ queryKey: api.qk.settings, queryFn: api.fetchSettings });
  const projectsQ = useQuery({ queryKey: api.qk.projects, queryFn: api.fetchProjects });

  const projectId = requested ?? projectsQ.data?.[0]?.id;

  return (
    <AppShell
      title="Studio"
      demoMode={settingsQ.data?.demo_mode ?? false}
      subtitle={projectsQ.data?.find((p) => p.id === projectId)?.name ?? "Content workspace"}
    >
      {projectsQ.isPending ? (
        <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading projects…
        </div>
      ) : projectId ? (
        <StudioWorkspace projectId={projectId} />
      ) : (
        <div className="p-8 text-sm text-muted-foreground">
          No projects yet. Create one on the Projects page to start a run.
        </div>
      )}
    </AppShell>
  );
}
