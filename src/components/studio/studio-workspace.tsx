import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ApprovalPanel } from "@/components/studio/approval-panel";
import { BriefPanel } from "@/components/studio/brief-panel";
import { LinkedInPreview } from "@/components/studio/linkedin-preview";
import { RunModeContext } from "@/components/studio/demo-notice";
import { AngleTab } from "@/components/studio/tabs/angle-tab";
import { PostTab } from "@/components/studio/tabs/post-tab";
import { QaTab } from "@/components/studio/tabs/qa-tab";
import { ResearchTab } from "@/components/studio/tabs/research-tab";
import { VisualTab } from "@/components/studio/tabs/visual-tab";
import { WorkflowProgress } from "@/components/studio/workflow-progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import * as api from "@/lib/studio/api";
import { executeFullRun, executeStage } from "@/lib/studio/runner";
import { STAGE_META, type PostVersion, type StageId, type VisualPrompt } from "@/lib/studio/types";

const TABS: { stage: StageId; file: string }[] = [
  { stage: "research", file: "research.md" },
  { stage: "angle", file: "angle.md" },
  { stage: "post", file: "post.md" },
  { stage: "visual", file: "image-prompt.md" },
  { stage: "qa", file: "qa.md" },
];

export function StudioWorkspace({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<StageId>("research");
  const [runningStage, setRunningStage] = useState<StageId | null>(null);
  const [fullRunning, setFullRunning] = useState(false);

  const settingsQ = useQuery({ queryKey: api.qk.settings, queryFn: api.fetchSettings });
  const projectQ = useQuery({ queryKey: api.qk.project(projectId), queryFn: () => api.fetchProject(projectId) });
  const briefsQ = useQuery({ queryKey: api.qk.briefs(projectId), queryFn: () => api.fetchBriefs(projectId) });
  const runsQ = useQuery({ queryKey: api.qk.runs(projectId), queryFn: () => api.fetchRuns(projectId) });

  const runs = runsQ.data ?? [];
  useEffect(() => {
    if (!activeRunId && runs.length) setActiveRunId(runs[0]!.id);
  }, [runs, activeRunId]);

  const bundleQ = useQuery({
    queryKey: api.qk.bundle(activeRunId ?? "none"),
    queryFn: () => api.fetchRunBundle(activeRunId!),
    enabled: !!activeRunId,
  });

  const brief = briefsQ.data?.[0] ?? null;
  const settings = settingsQ.data;
  const bundle = bundleQ.data;

  const refreshBundle = async () => {
    await qc.invalidateQueries({ queryKey: api.qk.bundle(activeRunId ?? "none") });
    await qc.invalidateQueries({ queryKey: api.qk.runs(projectId) });
  };

  const [saving, setSaving] = useState(false);
  const withSave = async (label: string, fn: () => Promise<void>) => {
    setSaving(true);
    try {
      await fn();
      await refreshBundle();
      toast.success(label);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const runStage = async (stage: StageId) => {
    if (!activeRunId || !brief || !settings) return;
    setRunningStage(stage);
    try {
      await executeStage({ runId: activeRunId, stage, brief, settings });
      await refreshBundle();
      setActiveStage(stage === "preview" || stage === "approval" ? activeStage : stage);
      toast.success(`${STAGE_META[stage].label} complete`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `${STAGE_META[stage].label} failed`);
      await refreshBundle();
    } finally {
      setRunningStage(null);
    }
  };

  const fullRun = async () => {
    if (!activeRunId || !brief || !settings) return;
    setFullRunning(true);
    try {
      await executeFullRun({
        runId: activeRunId,
        brief,
        settings,
        onStage: (stage) => {
          setRunningStage(stage);
          if (TABS.some((t) => t.stage === stage)) setActiveStage(stage);
        },
      });
      toast.success("Full run complete — awaiting human approval");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The run stopped on an error");
    } finally {
      setRunningStage(null);
      setFullRunning(false);
      await refreshBundle();
    }
  };

  const newRun = useMutation({
    mutationFn: async () => {
      if (!settings) throw new Error("Settings are not loaded yet");
      return api.createRun(projectId, brief?.id ?? null, settings.demo_mode ? "demo" : "live");
    },
    onSuccess: async (run) => {
      setActiveRunId(run.id);
      setActiveStage("research");
      await qc.invalidateQueries({ queryKey: api.qk.runs(projectId) });
      toast.success("New run created");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create the run"),
  });

  if (settingsQ.isPending || projectQ.isPending || briefsQ.isPending || runsQ.isPending) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading workspace…
      </div>
    );
  }

  const loadError = settingsQ.error ?? projectQ.error ?? briefsQ.error ?? runsQ.error;
  if (loadError || !settings || !projectQ.data) {
    return (
      <ErrorState
        message={loadError instanceof Error ? loadError.message : "The workspace could not be loaded."}
        onRetry={() => {
          void qc.invalidateQueries();
        }}
      />
    );
  }

  const busy = !!runningStage || fullRunning;
  const post = bundle?.posts.find((p) => p.is_current) ?? bundle?.posts[0];
  const visual = bundle?.visuals.find((v) => v.is_current) ?? bundle?.visuals[0];
  const qa = bundle?.qa.find((q) => q.is_current) ?? bundle?.qa[0];

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[19rem_minmax(0,1fr)_24rem]">
        <section className="border-border bg-surface xl:border-r">
          <BriefPanel
            project={projectQ.data}
            brief={brief}
            briefs={briefsQ.data ?? []}
            runs={runs}
            activeRunId={activeRunId}
            onSelectRun={(id) => {
              setActiveRunId(id);
              setActiveStage("research");
            }}
            onSaveBrief={(input) =>
              void withSave("Brief saved as a new version", async () => {
                await api.createBriefVersion(projectId, input);
                await qc.invalidateQueries({ queryKey: api.qk.briefs(projectId) });
                await qc.invalidateQueries({ queryKey: api.qk.project(projectId) });
              })
            }
            onNewRun={() => newRun.mutate()}
            onFullRun={() => void fullRun()}
            running={fullRunning}
            saving={saving}
          />
        </section>

        <section className="flex min-w-0 flex-col border-border xl:border-r">
          {!activeRunId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-sm font-medium">No run yet</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Create a run to start the workflow for this brief.
              </p>
              <Button size="sm" onClick={() => newRun.mutate()}>
                Create first run
              </Button>
            </div>
          ) : bundleQ.isPending ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading run…
            </div>
          ) : bundleQ.error || !bundle ? (
            <ErrorState
              message={bundleQ.error instanceof Error ? bundleQ.error.message : "This run could not be loaded."}
              onRetry={() => void refreshBundle()}
            />
          ) : (
            <RunModeContext.Provider value={bundle?.run.mode === "live" ? "live" : "demo"}>
            <Tabs
              value={activeStage}
              onValueChange={(v) => setActiveStage(v as StageId)}
              className="flex min-h-0 flex-1 flex-col gap-0"
            >
              <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border bg-surface px-3 py-2">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.stage} value={tab.stage} className="font-mono text-[11px]">
                    {tab.file}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <TabsContent value="research" className="mt-0">
                  <ResearchTab
                    bundle={bundle}
                    busy={busy}
                    saving={saving}
                    onRegenerate={() => void runStage("research")}
                    onSaveArtifact={(id, content) =>
                      void withSave("research.md saved", () => api.updateArtifactContent(id, content))
                    }
                  />
                </TabsContent>
                <TabsContent value="angle" className="mt-0">
                  <AngleTab
                    bundle={bundle}
                    busy={busy}
                    saving={saving}
                    onRegenerate={() => void runStage("angle")}
                    onSelect={(angleId) =>
                      void withSave("Angle selected", () => api.selectAngle(activeRunId!, angleId))
                    }
                    onSaveArtifact={(id, content) =>
                      void withSave("angle.md saved", () => api.updateArtifactContent(id, content))
                    }
                  />
                </TabsContent>
                <TabsContent value="post" className="mt-0">
                  <PostTab
                    bundle={bundle}
                    busy={busy}
                    saving={saving}
                    onRegenerate={() => void runStage("post")}
                    onSave={(patch: Partial<PostVersion>) =>
                      void withSave("Draft saved", async () => {
                        if (!post) return;
                        await api.updatePostVersion(post.id, patch);
                      })
                    }
                    onRestore={(id) =>
                      void withSave("Version restored", () => api.restorePostVersion(activeRunId!, id))
                    }
                    onSaveArtifact={(id, content) =>
                      void withSave("post.md saved", () => api.updateArtifactContent(id, content))
                    }
                  />
                </TabsContent>
                <TabsContent value="visual" className="mt-0">
                  <VisualTab
                    bundle={bundle}
                    busy={busy}
                    saving={saving}
                    onRegenerate={() => void runStage("visual")}
                    onSave={(id: string, patch: Partial<VisualPrompt>) =>
                      void withSave("Visual saved", () => api.updateVisual(id, patch))
                    }
                    onSaveArtifact={(id, content) =>
                      void withSave("image-prompt.md saved", () => api.updateArtifactContent(id, content))
                    }
                  />
                </TabsContent>
                <TabsContent value="qa" className="mt-0">
                  <QaTab
                    bundle={bundle}
                    busy={busy}
                    saving={saving}
                    onRegenerate={() => void runStage("qa")}
                    onSaveArtifact={(id, content) =>
                      void withSave("qa.md saved", () => api.updateArtifactContent(id, content))
                    }
                  />
                </TabsContent>
              </div>
            </Tabs>
            </RunModeContext.Provider>
          )}
        </section>

        <section className="min-w-0 space-y-4 overflow-y-auto bg-surface-2/40 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            LinkedIn preview
          </h2>
          <LinkedInPreview post={post} visual={visual} settings={settings} />
          <ApprovalPanel
            approval={bundle?.approval ?? null}
            qa={qa}
            settings={settings}
            busy={saving}
            onDecide={(decision, approver, notes) =>
              void withSave(
                decision === "approved" ? "Draft approved" : decision === "pending" ? "Approval reset" : "Changes requested",
                () => api.decideApproval(activeRunId!, decision, approver, notes),
              )
            }
          />
        </section>
      </div>

      {bundle ? (
        <WorkflowProgress
          stages={bundle.stages}
          activeStage={activeStage}
          runningStage={runningStage}
          onSelect={(stage) => {
            if (TABS.some((t) => t.stage === stage)) setActiveStage(stage);
          }}
          onRun={(stage) => void runStage(stage)}
        />
      ) : null}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <AlertCircle className="size-5 text-destructive" />
      <p className="text-sm font-medium">Something did not load</p>
      <p className="max-w-sm text-xs text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-3.5" /> Try again
      </Button>
    </div>
  );
}

