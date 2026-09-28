-- Enum-ish via text + triggers-free simple constraints

CREATE TABLE public.creator_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  creator_name text NOT NULL DEFAULT 'Subhankar Dey',
  headline text NOT NULL DEFAULT '',
  avatar_initials text NOT NULL DEFAULT 'SD',
  tone_guidelines text NOT NULL DEFAULT '',
  banned_words text[] NOT NULL DEFAULT '{}',
  system_prompt text NOT NULL DEFAULT '',
  demo_mode boolean NOT NULL DEFAULT true,
  linkedin_connected boolean NOT NULL DEFAULT false,
  ai_provider_configured boolean NOT NULL DEFAULT false,
  research_provider_configured boolean NOT NULL DEFAULT false,
  image_provider_configured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  topic text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT '',
  pov text NOT NULL DEFAULT '',
  desired_action text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  topic text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT '',
  pov text NOT NULL DEFAULT '',
  desired_action text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'Direct, practical, senior operator',
  format text NOT NULL DEFAULT 'text',
  keywords text[] NOT NULL DEFAULT '{}',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  brief_id uuid REFERENCES public.briefs(id) ON DELETE SET NULL,
  mode text NOT NULL DEFAULT 'demo',
  status text NOT NULL DEFAULT 'idle',
  current_stage text NOT NULL DEFAULT 'idea',
  label text NOT NULL DEFAULT 'Run',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workflow_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  stage text NOT NULL,
  position integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, stage)
);

CREATE TABLE public.artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  kind text NOT NULL,
  filename text NOT NULL,
  content_md text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'demo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.research_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL DEFAULT '',
  publisher text NOT NULL DEFAULT '',
  source_type text NOT NULL DEFAULT 'example',
  snippet text NOT NULL DEFAULT '',
  relevance text NOT NULL DEFAULT '',
  is_demo boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.angles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  label text NOT NULL,
  headline text NOT NULL,
  thesis text NOT NULL DEFAULT '',
  why_it_works text NOT NULL DEFAULT '',
  risk text NOT NULL DEFAULT '',
  is_selected boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.post_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  hooks jsonb NOT NULL DEFAULT '[]'::jsonb,
  selected_hook_index integer NOT NULL DEFAULT 0,
  body text NOT NULL DEFAULT '',
  cta text NOT NULL DEFAULT '',
  hashtags text[] NOT NULL DEFAULT '{}',
  char_count integer NOT NULL DEFAULT 0,
  reading_seconds integer NOT NULL DEFAULT 0,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.visual_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  concept text NOT NULL DEFAULT '',
  prompt text NOT NULL DEFAULT '',
  negative_prompt text NOT NULL DEFAULT '',
  aspect_ratio text NOT NULL DEFAULT '1200x627',
  alt_text text NOT NULL DEFAULT '',
  image_url text,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.qa_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  checks jsonb NOT NULL DEFAULT '[]'::jsonb,
  verdict text NOT NULL DEFAULT 'warning',
  summary text NOT NULL DEFAULT '',
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  decision text NOT NULL DEFAULT 'pending',
  approver_name text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Grants + RLS (open shared workspace, no sign-in)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['creator_settings','projects','briefs','workflow_runs','workflow_stages','artifacts','research_sources','angles','post_versions','visual_prompts','qa_results','approvals']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "open_workspace_read_%1$s" ON public.%1$I FOR SELECT USING (true);', t);
    EXECUTE format('CREATE POLICY "open_workspace_insert_%1$s" ON public.%1$I FOR INSERT WITH CHECK (true);', t);
    EXECUTE format('CREATE POLICY "open_workspace_update_%1$s" ON public.%1$I FOR UPDATE USING (true) WITH CHECK (true);', t);
    EXECUTE format('CREATE POLICY "open_workspace_delete_%1$s" ON public.%1$I FOR DELETE USING (true);', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER t_creator_settings BEFORE UPDATE ON public.creator_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_runs BEFORE UPDATE ON public.workflow_runs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_stages BEFORE UPDATE ON public.workflow_stages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_artifacts BEFORE UPDATE ON public.artifacts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_posts BEFORE UPDATE ON public.post_versions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_visuals BEFORE UPDATE ON public.visual_prompts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed creator settings
INSERT INTO public.creator_settings (singleton, creator_name, headline, avatar_initials, tone_guidelines, banned_words, system_prompt, demo_mode)
VALUES (
  true,
  'Subhankar Dey',
  'Global Program Manager | Program Delivery & Transformation | Cross-Functional Leadership | AI-Enabled Execution | PMP | PSM I | Speaker | Digital Transformation',
  'SD',
  'Direct, specific, senior-operator voice. Short lines. Concrete examples over adjectives. No hype, no emoji walls, no engagement bait.',
  ARRAY['game-changer','revolutionary','unlock the power','synergy','10x'],
  'You are the 180 LIFT content agent writing LinkedIn posts for a global program manager.

Rules:
1. Write in a direct, practical, senior-operator voice. Short lines, concrete specifics.
2. Never invent statistics, studies, named companies, or quotes. If evidence is unavailable, say so and argue from first principles and operating experience.
3. Every post must earn attention in the first two lines, deliver one clear idea, and end with one specific action the reader can take today.
4. Avoid hype language, engagement bait, and hashtag stuffing. Maximum five hashtags.
5. Respect the brief: audience, point of view, and desired action are non-negotiable.
6. Flag anything that would need a human fact-check before publishing.',
  true
);

-- Seed demo project + brief
WITH p AS (
  INSERT INTO public.projects (name, topic, audience, pov, desired_action, status)
  VALUES (
    'AI adoption starts with gaps, not tools',
    'Why AI adoption fails when teams buy tools before finding the gaps to improve',
    'Working professionals / program managers',
    'Buying a tool is not adoption',
    'Map one workflow before buying another tool',
    'draft'
  ) RETURNING id
)
INSERT INTO public.briefs (project_id, version, topic, audience, pov, desired_action, tone, keywords, notes)
SELECT
  p.id, 1,
  'Why AI adoption fails when teams buy tools before finding the gaps to improve',
  'Working professionals / program managers',
  'Buying a tool is not adoption',
  'Map one workflow before buying another tool',
  'Direct, practical, senior operator',
  ARRAY['AI adoption','process mapping','program management','change management'],
  'Lead with the pattern the reader has lived through: a tool arrives, nobody changes how work flows, adoption stalls.'
FROM p;