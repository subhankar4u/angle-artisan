export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      angles: {
        Row: {
          created_at: string
          headline: string
          id: string
          is_selected: boolean
          label: string
          position: number
          risk: string
          run_id: string
          thesis: string
          version: number
          why_it_works: string
        }
        Insert: {
          created_at?: string
          headline: string
          id?: string
          is_selected?: boolean
          label: string
          position?: number
          risk?: string
          run_id: string
          thesis?: string
          version?: number
          why_it_works?: string
        }
        Update: {
          created_at?: string
          headline?: string
          id?: string
          is_selected?: boolean
          label?: string
          position?: number
          risk?: string
          run_id?: string
          thesis?: string
          version?: number
          why_it_works?: string
        }
        Relationships: [
          {
            foreignKeyName: "angles_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          approver_name: string
          created_at: string
          decided_at: string | null
          decision: string
          id: string
          notes: string
          run_id: string
        }
        Insert: {
          approver_name?: string
          created_at?: string
          decided_at?: string | null
          decision?: string
          id?: string
          notes?: string
          run_id: string
        }
        Update: {
          approver_name?: string
          created_at?: string
          decided_at?: string | null
          decision?: string
          id?: string
          notes?: string
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      artifacts: {
        Row: {
          content_md: string
          created_at: string
          filename: string
          id: string
          is_current: boolean
          kind: string
          run_id: string
          source: string
          updated_at: string
          version: number
        }
        Insert: {
          content_md?: string
          created_at?: string
          filename: string
          id?: string
          is_current?: boolean
          kind: string
          run_id: string
          source?: string
          updated_at?: string
          version?: number
        }
        Update: {
          content_md?: string
          created_at?: string
          filename?: string
          id?: string
          is_current?: boolean
          kind?: string
          run_id?: string
          source?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      briefs: {
        Row: {
          audience: string
          created_at: string
          desired_action: string
          format: string
          id: string
          keywords: string[]
          notes: string
          pov: string
          project_id: string
          tone: string
          topic: string
          version: number
        }
        Insert: {
          audience?: string
          created_at?: string
          desired_action?: string
          format?: string
          id?: string
          keywords?: string[]
          notes?: string
          pov?: string
          project_id: string
          tone?: string
          topic?: string
          version?: number
        }
        Update: {
          audience?: string
          created_at?: string
          desired_action?: string
          format?: string
          id?: string
          keywords?: string[]
          notes?: string
          pov?: string
          project_id?: string
          tone?: string
          topic?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "briefs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_settings: {
        Row: {
          ai_provider_configured: boolean
          avatar_initials: string
          banned_words: string[]
          created_at: string
          creator_name: string
          demo_mode: boolean
          headline: string
          id: string
          image_provider_configured: boolean
          linkedin_connected: boolean
          research_provider_configured: boolean
          singleton: boolean
          system_prompt: string
          tone_guidelines: string
          updated_at: string
        }
        Insert: {
          ai_provider_configured?: boolean
          avatar_initials?: string
          banned_words?: string[]
          created_at?: string
          creator_name?: string
          demo_mode?: boolean
          headline?: string
          id?: string
          image_provider_configured?: boolean
          linkedin_connected?: boolean
          research_provider_configured?: boolean
          singleton?: boolean
          system_prompt?: string
          tone_guidelines?: string
          updated_at?: string
        }
        Update: {
          ai_provider_configured?: boolean
          avatar_initials?: string
          banned_words?: string[]
          created_at?: string
          creator_name?: string
          demo_mode?: boolean
          headline?: string
          id?: string
          image_provider_configured?: boolean
          linkedin_connected?: boolean
          research_provider_configured?: boolean
          singleton?: boolean
          system_prompt?: string
          tone_guidelines?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_versions: {
        Row: {
          body: string
          char_count: number
          created_at: string
          cta: string
          hashtags: string[]
          hooks: Json
          id: string
          is_current: boolean
          reading_seconds: number
          run_id: string
          selected_hook_index: number
          updated_at: string
          version: number
        }
        Insert: {
          body?: string
          char_count?: number
          created_at?: string
          cta?: string
          hashtags?: string[]
          hooks?: Json
          id?: string
          is_current?: boolean
          reading_seconds?: number
          run_id: string
          selected_hook_index?: number
          updated_at?: string
          version?: number
        }
        Update: {
          body?: string
          char_count?: number
          created_at?: string
          cta?: string
          hashtags?: string[]
          hooks?: Json
          id?: string
          is_current?: boolean
          reading_seconds?: number
          run_id?: string
          selected_hook_index?: number
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_versions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          audience: string
          created_at: string
          desired_action: string
          id: string
          name: string
          pov: string
          status: string
          topic: string
          updated_at: string
        }
        Insert: {
          audience?: string
          created_at?: string
          desired_action?: string
          id?: string
          name: string
          pov?: string
          status?: string
          topic?: string
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          desired_action?: string
          id?: string
          name?: string
          pov?: string
          status?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      qa_results: {
        Row: {
          checks: Json
          created_at: string
          id: string
          is_current: boolean
          run_id: string
          summary: string
          verdict: string
          version: number
        }
        Insert: {
          checks?: Json
          created_at?: string
          id?: string
          is_current?: boolean
          run_id: string
          summary?: string
          verdict?: string
          version?: number
        }
        Update: {
          checks?: Json
          created_at?: string
          id?: string
          is_current?: boolean
          run_id?: string
          summary?: string
          verdict?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "qa_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      research_sources: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          position: number
          publisher: string
          relevance: string
          run_id: string
          snippet: string
          source_type: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          position?: number
          publisher?: string
          relevance?: string
          run_id: string
          snippet?: string
          source_type?: string
          title: string
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          position?: number
          publisher?: string
          relevance?: string
          run_id?: string
          snippet?: string
          source_type?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_sources_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      visual_prompts: {
        Row: {
          alt_text: string
          aspect_ratio: string
          concept: string
          created_at: string
          id: string
          image_url: string | null
          is_current: boolean
          negative_prompt: string
          prompt: string
          run_id: string
          updated_at: string
          version: number
        }
        Insert: {
          alt_text?: string
          aspect_ratio?: string
          concept?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_current?: boolean
          negative_prompt?: string
          prompt?: string
          run_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          alt_text?: string
          aspect_ratio?: string
          concept?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_current?: boolean
          negative_prompt?: string
          prompt?: string
          run_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "visual_prompts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          brief_id: string | null
          completed_at: string | null
          created_at: string
          current_stage: string
          id: string
          label: string
          mode: string
          project_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          brief_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_stage?: string
          id?: string
          label?: string
          mode?: string
          project_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          brief_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_stage?: string
          id?: string
          label?: string
          mode?: string
          project_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_stages: {
        Row: {
          attempts: number
          completed_at: string | null
          error_message: string | null
          id: string
          position: number
          run_id: string
          stage: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          error_message?: string | null
          id?: string
          position: number
          run_id: string
          stage: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          error_message?: string | null
          id?: string
          position?: number
          run_id?: string
          stage?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_stages_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
