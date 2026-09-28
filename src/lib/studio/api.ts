import { supabase } from "@/integrations/supabase/client";

import { STAGE_IDS } from "./types";
import type {
  Angle,
  Approval,
  Artifact,
  ArtifactKind,
  Brief,
  CreatorSettings,
  PostVersion,
  Project,
  QaResult,
  ResearchSource,
  StageId,
  StageStatus,
  VisualPrompt,
  WorkflowRun,
  WorkflowStage,
} from "./types";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null) throw new Error("No data returned");
  return res.data;
}

/* ----------------------------------------------------------------- settings */

export async function fetchSettings(): Promise<CreatorSettings> {
  const res = await supabase.from("creator_settings").select("*").limit(1).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  if (!res.data) throw new Error("Creator settings row is missing.");
  return res.data as unknown as CreatorSettings;
}

export async function updateSettings(patch: Partial<CreatorSettings>): Promise<CreatorSettings> {
  const current = await fetchSettings();
  const res = await supabase
    .from("creator_settings")
    .update(patch as never)
    .eq("id", current.id)
    .select("*")
    .single();
  return unwrap(res) as unknown as CreatorSettings;
}

/* ----------------------------------------------------------------- projects */

export async function fetchProjects(): Promise<Project[]> {
  const res = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
  return (unwrap(res) as unknown as Project[]) ?? [];
}

export async function fetchProject(id: string): Promise<Project> {
  const res = await supabase.from("projects").select("*").eq("id", id).single();
  return unwrap(res) as unknown as Project;
}

export type BriefInput = {
  topic: string;
  audience: string;
  pov: string;
  desired_action: string;
  tone: string;
  format: string;
  keywords: string[];
  notes: string;
};

export async function createProject(input: BriefInput & { name: string }): Promise<Project> {
  const res = await supabase
    .from("projects")
    .insert({
      name: input.name,
      topic: input.topic,
      audience: input.audience,
      pov: input.pov,
      desired_action: input.desired_action,
    } as never)
    .select("*")
    .single();
  const project = unwrap(res) as unknown as Project;
  await createBriefVersion(project.id, input);
  return project;
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project> {
  const res = await supabase
    .from("projects")
    .update(patch as never)
    .eq("id", id)
    .select("*")
    .single();
  return unwrap(res) as unknown as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await supabase.from("projects").delete().eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

/* ------------------------------------------------------------------- briefs */

export async function fetchBriefs(projectId: string): Promise<Brief[]> {
  const res = await supabase
    .from("briefs")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: false });
  return (unwrap(res) as unknown as Brief[]) ?? [];
}

export async function fetchLatestBrief(projectId: string): Promise<Brief | null> {
  const briefs = await fetchBriefs(projectId);
  return briefs[0] ?? null;
}

export async function createBriefVersion(projectId: string, input: BriefInput): Promise<Brief> {
  const existing = await fetchBriefs(projectId);
  const version = (existing[0]?.version ?? 0) + 1;
  const res = await supabase
    .from("briefs")
    .insert({ project_id: projectId, version, ...input } as never)
    .select("*")
    .single();
  const brief = unwrap(res) as unknown as Brief;
  await supabase
    .from("projects")
    .update({
      topic: input.topic,
      audience: input.audience,
      pov: input.pov,
      desired_action: input.desired_action,
    } as never)
    .eq("id", projectId);
  return brief;
}

/* --------------------------------------------------------------------- runs */

export async function fetchRuns(projectId: string): Promise<WorkflowRun[]> {
  const res = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return (unwrap(res) as unknown as WorkflowRun[]) ?? [];
}

export async function fetchAllRuns(): Promise<WorkflowRun[]> {
  const res = await supabase
    .from("workflow_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return (unwrap(res) as unknown as WorkflowRun[]) ?? [];
}

export async function fetchRun(runId: string): Promise<WorkflowRun> {
  const res = await supabase.from("workflow_runs").select("*").eq("id", runId).single();
  return unwrap(res) as unknown as WorkflowRun;
}

export async function createRun(projectId: string, briefId: string | null, mode: string): Promise<WorkflowRun> {
  const previous = await fetchRuns(projectId);
  const res = await supabase
    .from("workflow_runs")
    .insert({
      project_id: projectId,
      brief_id: briefId,
      mode,
      status: "idle",
      current_stage: "idea",
      label: `Run ${previous.length + 1}`,
    } as never)
    .select("*")
    .single();
  const run = unwrap(res) as unknown as WorkflowRun;

  const stages = STAGE_IDS.map((stage, position) => ({
    run_id: run.id,
    stage,
    position,
    status: position === 0 ? "complete" : "pending",
    completed_at: position === 0 ? new Date().toISOString() : null,
  }));
  const stageRes = await supabase.from("workflow_stages").insert(stages as never);
  if (stageRes.error) throw new Error(stageRes.error.message);

  const approvalRes = await supabase
    .from("approvals")
    .insert({ run_id: run.id, decision: "pending" } as never);
  if (approvalRes.error) throw new Error(approvalRes.error.message);

  return run;
}

export async function updateRun(runId: string, patch: Partial<WorkflowRun>): Promise<void> {
  const res = await supabase
    .from("workflow_runs")
    .update(patch as never)
    .eq("id", runId);
  if (res.error) throw new Error(res.error.message);
}

export async function deleteRun(runId: string): Promise<void> {
  const res = await supabase.from("workflow_runs").delete().eq("id", runId);
  if (res.error) throw new Error(res.error.message);
}

/* ------------------------------------------------------------------- stages */

export async function fetchStages(runId: string): Promise<WorkflowStage[]> {
  const res = await supabase
    .from("workflow_stages")
    .select("*")
    .eq("run_id", runId)
    .order("position", { ascending: true });
  return (unwrap(res) as unknown as WorkflowStage[]) ?? [];
}

export async function setStageStatus(
  runId: string,
  stage: StageId,
  status: StageStatus,
  options: { error?: string | null; bumpAttempt?: boolean } = {},
): Promise<void> {
  const patch: Record<string, unknown> = {
    status,
    error_message: options.error ?? null,
  };
  if (status === "running") patch['started_at'] = new Date().toISOString();
  if (status === "complete") patch['completed_at'] = new Date().toISOString();
  if (options.bumpAttempt) {
    const current = await supabase
      .from("workflow_stages")
      .select("attempts")
      .eq("run_id", runId)
      .eq("stage", stage)
      .single();
    patch['attempts'] = ((current.data as { attempts?: number } | null)?.attempts ?? 0) + 1;
  }
  const res = await supabase
    .from("workflow_stages")
    .update(patch as never)
    .eq("run_id", runId)
    .eq("stage", stage);
  if (res.error) throw new Error(res.error.message);
}

/* ---------------------------------------------------------------- artifacts */

export async function fetchArtifacts(runId: string): Promise<Artifact[]> {
  const res = await supabase
    .from("artifacts")
    .select("*")
    .eq("run_id", runId)
    .order("version", { ascending: false });
  return (unwrap(res) as unknown as Artifact[]) ?? [];
}

export async function saveArtifact(
  runId: string,
  kind: ArtifactKind,
  filename: string,
  content: string,
  source: string,
): Promise<void> {
  const existing = await fetchArtifacts(runId);
  const sameKind = existing.filter((a) => a.kind === kind);
  const version = (sameKind[0]?.version ?? 0) + 1;
  await supabase
    .from("artifacts")
    .update({ is_current: false } as never)
    .eq("run_id", runId)
    .eq("kind", kind);
  const res = await supabase
    .from("artifacts")
    .insert({ run_id: runId, kind, filename, content_md: content, version, source, is_current: true } as never);
  if (res.error) throw new Error(res.error.message);
}

export async function updateArtifactContent(artifactId: string, content: string): Promise<void> {
  const res = await supabase
    .from("artifacts")
    .update({ content_md: content } as never)
    .eq("id", artifactId);
  if (res.error) throw new Error(res.error.message);
}

/* ------------------------------------------------------------ research etc. */

export async function fetchSources(runId: string): Promise<ResearchSource[]> {
  const res = await supabase
    .from("research_sources")
    .select("*")
    .eq("run_id", runId)
    .order("position", { ascending: true });
  return (unwrap(res) as unknown as ResearchSource[]) ?? [];
}

export async function replaceSources(
  runId: string,
  sources: Omit<ResearchSource, "id" | "run_id">[],
): Promise<void> {
  await supabase.from("research_sources").delete().eq("run_id", runId);
  if (!sources.length) return;
  const res = await supabase
    .from("research_sources")
    .insert(sources.map((s) => ({ ...s, run_id: runId })) as never);
  if (res.error) throw new Error(res.error.message);
}

export async function fetchAngles(runId: string): Promise<Angle[]> {
  const res = await supabase
    .from("angles")
    .select("*")
    .eq("run_id", runId)
    .order("position", { ascending: true });
  return (unwrap(res) as unknown as Angle[]) ?? [];
}

export async function replaceAngles(
  runId: string,
  candidates: { label: string; headline: string; thesis: string; why_it_works: string; risk: string; position: number }[],
): Promise<void> {
  const existing = await fetchAngles(runId);
  const version = (existing[0]?.version ?? 0) + 1;
  await supabase.from("angles").delete().eq("run_id", runId);
  const res = await supabase
    .from("angles")
    .insert(
      candidates.map((c) => ({ ...c, run_id: runId, version, is_selected: c.position === 0 })) as never,
    );
  if (res.error) throw new Error(res.error.message);
}

export async function selectAngle(runId: string, angleId: string): Promise<void> {
  await supabase
    .from("angles")
    .update({ is_selected: false } as never)
    .eq("run_id", runId);
  const res = await supabase
    .from("angles")
    .update({ is_selected: true } as never)
    .eq("id", angleId);
  if (res.error) throw new Error(res.error.message);
}

export async function fetchPostVersions(runId: string): Promise<PostVersion[]> {
  const res = await supabase
    .from("post_versions")
    .select("*")
    .eq("run_id", runId)
    .order("version", { ascending: false });
  return (unwrap(res) as unknown as PostVersion[]) ?? [];
}

export async function insertPostVersion(
  runId: string,
  draft: Omit<PostVersion, "id" | "run_id" | "version" | "is_current" | "updated_at">,
): Promise<void> {
  const existing = await fetchPostVersions(runId);
  const version = (existing[0]?.version ?? 0) + 1;
  await supabase
    .from("post_versions")
    .update({ is_current: false } as never)
    .eq("run_id", runId);
  const res = await supabase
    .from("post_versions")
    .insert({ ...draft, run_id: runId, version, is_current: true } as never);
  if (res.error) throw new Error(res.error.message);
}

export async function updatePostVersion(id: string, patch: Partial<PostVersion>): Promise<void> {
  const res = await supabase
    .from("post_versions")
    .update(patch as never)
    .eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

export async function restorePostVersion(runId: string, id: string): Promise<void> {
  await supabase
    .from("post_versions")
    .update({ is_current: false } as never)
    .eq("run_id", runId);
  const res = await supabase
    .from("post_versions")
    .update({ is_current: true } as never)
    .eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

export async function fetchVisuals(runId: string): Promise<VisualPrompt[]> {
  const res = await supabase
    .from("visual_prompts")
    .select("*")
    .eq("run_id", runId)
    .order("version", { ascending: false });
  return (unwrap(res) as unknown as VisualPrompt[]) ?? [];
}

export async function insertVisual(
  runId: string,
  draft: { concept: string; prompt: string; negative_prompt: string; aspect_ratio: string; alt_text: string },
): Promise<void> {
  const existing = await fetchVisuals(runId);
  const version = (existing[0]?.version ?? 0) + 1;
  await supabase
    .from("visual_prompts")
    .update({ is_current: false } as never)
    .eq("run_id", runId);
  const res = await supabase
    .from("visual_prompts")
    .insert({ ...draft, run_id: runId, version, is_current: true } as never);
  if (res.error) throw new Error(res.error.message);
}

export async function updateVisual(id: string, patch: Partial<VisualPrompt>): Promise<void> {
  const res = await supabase
    .from("visual_prompts")
    .update(patch as never)
    .eq("id", id);
  if (res.error) throw new Error(res.error.message);
}

export async function fetchQaResults(runId: string): Promise<QaResult[]> {
  const res = await supabase
    .from("qa_results")
    .select("*")
    .eq("run_id", runId)
    .order("version", { ascending: false });
  return (unwrap(res) as unknown as QaResult[]) ?? [];
}

export async function insertQaResult(
  runId: string,
  report: { checks: unknown[]; verdict: string; summary: string },
): Promise<void> {
  const existing = await fetchQaResults(runId);
  const version = (existing[0]?.version ?? 0) + 1;
  await supabase
    .from("qa_results")
    .update({ is_current: false } as never)
    .eq("run_id", runId);
  const res = await supabase
    .from("qa_results")
    .insert({ ...report, run_id: runId, version, is_current: true } as never);
  if (res.error) throw new Error(res.error.message);
}

export async function fetchApproval(runId: string): Promise<Approval | null> {
  const res = await supabase
    .from("approvals")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (res.error) throw new Error(res.error.message);
  return (res.data as unknown as Approval) ?? null;
}

export async function decideApproval(
  runId: string,
  decision: "pending" | "approved" | "changes_requested",
  approverName: string,
  notes: string,
): Promise<void> {
  const existing = await fetchApproval(runId);
  const payload = {
    decision,
    approver_name: approverName,
    notes,
    decided_at: decision === "pending" ? null : new Date().toISOString(),
  };
  const res = existing
    ? await supabase
        .from("approvals")
        .update(payload as never)
        .eq("id", existing.id)
    : await supabase
        .from("approvals")
        .insert({ ...payload, run_id: runId } as never);
  if (res.error) throw new Error(res.error.message);
}

/* --------------------------------------------------------------- run bundle */

export type RunBundle = {
  run: WorkflowRun;
  stages: WorkflowStage[];
  artifacts: Artifact[];
  sources: ResearchSource[];
  angles: Angle[];
  posts: PostVersion[];
  visuals: VisualPrompt[];
  qa: QaResult[];
  approval: Approval | null;
};

export async function fetchRunBundle(runId: string): Promise<RunBundle> {
  const [run, stages, artifacts, sources, angles, posts, visuals, qa, approval] = await Promise.all([
    fetchRun(runId),
    fetchStages(runId),
    fetchArtifacts(runId),
    fetchSources(runId),
    fetchAngles(runId),
    fetchPostVersions(runId),
    fetchVisuals(runId),
    fetchQaResults(runId),
    fetchApproval(runId),
  ]);
  return { run, stages, artifacts, sources, angles, posts, visuals, qa, approval };
}

export const qk = {
  settings: ["settings"] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["project", id] as const,
  briefs: (id: string) => ["briefs", id] as const,
  runs: (id: string) => ["runs", id] as const,
  allRuns: ["runs", "all"] as const,
  bundle: (id: string) => ["bundle", id] as const,
};
