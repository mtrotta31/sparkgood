// Supabase Database Types
// These types match the database schema

import type {
  UserProfile,
  Idea,
  ViabilityReport,
  BusinessPlan,
  MarketingAssets,
  ActionRoadmap,
} from "@/types";

// Database schema types for Supabase
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          venture_type: string | null;
          format: string | null;
          causes: string[];
          experience: string | null;
          budget: string | null;
          commitment: string | null;
          depth: string | null;
          has_idea: boolean | null;
          own_idea: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          venture_type?: string | null;
          format?: string | null;
          causes?: string[];
          experience?: string | null;
          budget?: string | null;
          commitment?: string | null;
          depth?: string | null;
          has_idea?: boolean | null;
          own_idea?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          venture_type?: string | null;
          format?: string | null;
          causes?: string[];
          experience?: string | null;
          budget?: string | null;
          commitment?: string | null;
          depth?: string | null;
          has_idea?: boolean | null;
          own_idea?: string | null;
          updated_at?: string;
        };
      };
      saved_ideas: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string | null;
          idea_data: Idea;
          is_selected: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id?: string | null;
          idea_data: Idea;
          is_selected?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_id?: string | null;
          idea_data?: Idea;
          is_selected?: boolean;
          updated_at?: string;
        };
      };
      deep_dive_results: {
        Row: {
          id: string;
          user_id: string;
          idea_id: string;
          viability: ViabilityReport | null;
          business_plan: BusinessPlan | null;
          marketing: MarketingAssets | null;
          roadmap: ActionRoadmap | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          idea_id: string;
          viability?: ViabilityReport | null;
          business_plan?: BusinessPlan | null;
          marketing?: MarketingAssets | null;
          roadmap?: ActionRoadmap | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          idea_id?: string;
          viability?: ViabilityReport | null;
          business_plan?: BusinessPlan | null;
          marketing?: MarketingAssets | null;
          roadmap?: ActionRoadmap | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper type for converting database row to app types
export function dbProfileToUserProfile(
  row: Database["public"]["Tables"]["user_profiles"]["Row"]
): UserProfile {
  return {
    ventureType: row.venture_type as UserProfile["ventureType"],
    format: row.format as UserProfile["format"],
    causes: row.causes as UserProfile["causes"],
    experience: row.experience as UserProfile["experience"],
    budget: row.budget as UserProfile["budget"],
    commitment: row.commitment as UserProfile["commitment"],
    depth: row.depth as UserProfile["depth"],
    hasIdea: row.has_idea,
    ownIdea: row.own_idea || "",
  };
}

export function userProfileToDbProfile(
  profile: UserProfile,
  userId: string
): Database["public"]["Tables"]["user_profiles"]["Insert"] {
  return {
    user_id: userId,
    venture_type: profile.ventureType,
    format: profile.format,
    causes: profile.causes,
    experience: profile.experience,
    budget: profile.budget,
    commitment: profile.commitment,
    depth: profile.depth,
    has_idea: profile.hasIdea,
    own_idea: profile.ownIdea || null,
  };
}
