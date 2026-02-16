"use client";

import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile, Idea, ViabilityReport, BusinessPlan, MarketingAssets, ActionRoadmap } from "@/types";

export function useUserData() {
  const { user } = useAuth();

  // Save user profile
  const saveProfile = useCallback(
    async (profile: UserProfile): Promise<string | null> => {
      if (!user) return null;

      try {
        const response = await fetch("/api/user/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile }),
        });

        const result = await response.json();
        if (result.success) {
          return result.data.profileId;
        }
        console.error("Failed to save profile:", result.error);
        return null;
      } catch (error) {
        console.error("Error saving profile:", error);
        return null;
      }
    },
    [user]
  );

  // Load user profile
  const loadProfile = useCallback(async (): Promise<{ profileId: string; profile: UserProfile } | null> => {
    if (!user) return null;

    try {
      const response = await fetch("/api/user/profile");
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Error loading profile:", error);
      return null;
    }
  }, [user]);

  // Save ideas (batch)
  const saveIdeas = useCallback(
    async (ideas: Idea[], profileId?: string, selectedIdeaId?: string): Promise<boolean> => {
      if (!user) {
        console.log("[useUserData] saveIdeas: No user, skipping save");
        return false;
      }

      console.log("[useUserData] saveIdeas: Saving", ideas.length, "ideas");

      try {
        const response = await fetch("/api/user/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ideas, profileId, selectedIdeaId }),
        });

        const result = await response.json();
        console.log("[useUserData] saveIdeas result:", result);
        return result.success;
      } catch (error) {
        console.error("[useUserData] Error saving ideas:", error);
        return false;
      }
    },
    [user]
  );

  // Save a single idea to My Projects
  const saveSingleIdea = useCallback(
    async (idea: Idea, profileId?: string): Promise<{ success: boolean; savedId?: string; alreadySaved?: boolean }> => {
      if (!user) {
        console.log("[useUserData] saveSingleIdea: No user, skipping save");
        return { success: false };
      }

      console.log("[useUserData] saveSingleIdea: Saving idea", idea.id, idea.name);

      try {
        const response = await fetch("/api/user/ideas/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, profileId }),
        });

        const result = await response.json();
        console.log("[useUserData] saveSingleIdea result:", result);

        if (result.success) {
          return {
            success: true,
            savedId: result.data.savedId,
            alreadySaved: result.data.alreadySaved,
          };
        }
        return { success: false };
      } catch (error) {
        console.error("[useUserData] Error saving single idea:", error);
        return { success: false };
      }
    },
    [user]
  );

  // Load saved ideas
  const loadIdeas = useCallback(async (): Promise<Idea[] | null> => {
    if (!user) return null;

    try {
      const response = await fetch("/api/user/ideas");
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("Error loading ideas:", error);
      return null;
    }
  }, [user]);

  // Save deep dive result (individual section)
  const saveDeepDiveResult = useCallback(
    async (
      ideaId: string,
      data: {
        viability?: ViabilityReport;
        businessPlan?: BusinessPlan;
        marketing?: MarketingAssets;
        roadmap?: ActionRoadmap;
      }
    ): Promise<boolean> => {
      if (!user) return false;

      try {
        const response = await fetch("/api/user/deep-dive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ideaId, ...data }),
        });

        const result = await response.json();
        return result.success;
      } catch (error) {
        console.error("Error saving deep dive result:", error);
        return false;
      }
    },
    [user]
  );

  // Load deep dive results for an idea
  const loadDeepDiveResults = useCallback(
    async (
      ideaId: string
    ): Promise<{
      viability?: ViabilityReport;
      businessPlan?: BusinessPlan;
      marketing?: MarketingAssets;
      roadmap?: ActionRoadmap;
    } | null> => {
      if (!user) return null;

      try {
        const response = await fetch(`/api/user/deep-dive?ideaId=${ideaId}`);
        const result = await response.json();
        if (result.success && result.data) {
          return result.data;
        }
        return null;
      } catch (error) {
        console.error("Error loading deep dive results:", error);
        return null;
      }
    },
    [user]
  );

  return {
    isAuthenticated: !!user,
    saveProfile,
    loadProfile,
    saveIdeas,
    saveSingleIdea,
    loadIdeas,
    saveDeepDiveResult,
    loadDeepDiveResults,
  };
}
