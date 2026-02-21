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
          // Business category (determines path)
          business_category: string | null;
          // General business path fields
          target_customer: string | null;
          business_model_preference: string | null;
          key_skills: string[];
          // Social enterprise path fields
          venture_type: string | null;
          causes: string[];
          // Common fields
          format: string | null;
          location_city: string | null;
          location_state: string | null;
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
          business_category?: string | null;
          target_customer?: string | null;
          business_model_preference?: string | null;
          key_skills?: string[];
          venture_type?: string | null;
          causes?: string[];
          format?: string | null;
          location_city?: string | null;
          location_state?: string | null;
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
          business_category?: string | null;
          target_customer?: string | null;
          business_model_preference?: string | null;
          key_skills?: string[];
          venture_type?: string | null;
          causes?: string[];
          format?: string | null;
          location_city?: string | null;
          location_state?: string | null;
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
      user_credits: {
        Row: {
          id: string;
          user_id: string;
          subscription_tier: "free" | "spark" | "ignite";
          subscription_status: "active" | "canceled" | "past_due" | "none";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          deep_dive_credits_remaining: number;
          launch_kit_credits_remaining: number;
          one_time_purchases: string[]; // Array of idea IDs purchased
          credits_reset_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_tier?: "free" | "spark" | "ignite";
          subscription_status?: "active" | "canceled" | "past_due" | "none";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          deep_dive_credits_remaining?: number;
          launch_kit_credits_remaining?: number;
          one_time_purchases?: string[];
          credits_reset_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_tier?: "free" | "spark" | "ignite";
          subscription_status?: "active" | "canceled" | "past_due" | "none";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          deep_dive_credits_remaining?: number;
          launch_kit_credits_remaining?: number;
          one_time_purchases?: string[];
          credits_reset_at?: string | null;
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
    // Business category (determines path)
    businessCategory: row.business_category as UserProfile["businessCategory"],
    // General business path fields
    targetCustomer: row.target_customer as UserProfile["targetCustomer"],
    businessModelPreference: row.business_model_preference as UserProfile["businessModelPreference"],
    keySkills: (row.key_skills || []) as UserProfile["keySkills"],
    // Social enterprise path fields
    ventureType: row.venture_type as UserProfile["ventureType"],
    causes: (row.causes || []) as UserProfile["causes"],
    // Common fields
    format: row.format as UserProfile["format"],
    location:
      row.location_city && row.location_state
        ? { city: row.location_city, state: row.location_state }
        : null,
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
    // Business category
    business_category: profile.businessCategory,
    // General business path fields
    target_customer: profile.targetCustomer,
    business_model_preference: profile.businessModelPreference,
    key_skills: profile.keySkills || [],
    // Social enterprise path fields
    venture_type: profile.ventureType,
    causes: profile.causes || [],
    // Common fields
    format: profile.format,
    location_city: profile.location?.city || null,
    location_state: profile.location?.state || null,
    experience: profile.experience,
    budget: profile.budget,
    commitment: profile.commitment,
    depth: profile.depth,
    has_idea: profile.hasIdea,
    own_idea: profile.ownIdea || null,
  };
}
