"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserCredits } from "@/app/api/user/credits/route";
import { useAuth } from "@/contexts/AuthContext";

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/user/credits");
      const data = await response.json();

      if (data.success) {
        setCredits(data.data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch credits");
      }
    } catch (err) {
      console.error("Error fetching credits:", err);
      setError("Failed to fetch credits");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Check if user has access to deep dive for a specific idea
  const hasDeepDiveAccess = useCallback(
    (ideaId: string): boolean => {
      if (!credits) return false;

      // Ignite has unlimited access
      if (credits.subscriptionTier === "ignite" && credits.subscriptionStatus === "active") {
        return true;
      }

      // Check one-time purchase
      if (credits.oneTimePurchases.includes(ideaId)) {
        return true;
      }

      // Spark with credits
      if (
        credits.subscriptionTier === "spark" &&
        credits.subscriptionStatus === "active" &&
        credits.deepDiveCreditsRemaining > 0
      ) {
        return true;
      }

      return false;
    },
    [credits]
  );

  // Check if user has access to launch kit for a specific idea
  const hasLaunchKitAccess = useCallback(
    (ideaId: string): boolean => {
      if (!credits) return false;

      // Must have deep dive access first
      if (!hasDeepDiveAccess(ideaId)) return false;

      // Ignite has unlimited access
      if (credits.subscriptionTier === "ignite" && credits.subscriptionStatus === "active") {
        return true;
      }

      // Check one-time purchase
      if (credits.oneTimePurchases.includes(`launch_kit_${ideaId}`)) {
        return true;
      }

      // Spark with credits
      if (
        credits.subscriptionTier === "spark" &&
        credits.subscriptionStatus === "active" &&
        credits.launchKitCreditsRemaining > 0
      ) {
        return true;
      }

      return false;
    },
    [credits, hasDeepDiveAccess]
  );

  // Get access status for display
  const getAccessStatus = useCallback((): {
    tier: string;
    canAccessDeepDive: boolean;
    canAccessLaunchKit: boolean;
    deepDiveCredits: number | "unlimited";
    launchKitCredits: number | "unlimited";
  } => {
    if (!credits) {
      return {
        tier: "free",
        canAccessDeepDive: false,
        canAccessLaunchKit: false,
        deepDiveCredits: 0,
        launchKitCredits: 0,
      };
    }

    const isIgnite = credits.subscriptionTier === "ignite" && credits.subscriptionStatus === "active";
    const isSpark = credits.subscriptionTier === "spark" && credits.subscriptionStatus === "active";

    return {
      tier: credits.subscriptionTier,
      canAccessDeepDive: isIgnite || (isSpark && credits.deepDiveCreditsRemaining > 0),
      canAccessLaunchKit: isIgnite || (isSpark && credits.launchKitCreditsRemaining > 0),
      deepDiveCredits: isIgnite ? "unlimited" : credits.deepDiveCreditsRemaining,
      launchKitCredits: isIgnite ? "unlimited" : credits.launchKitCreditsRemaining,
    };
  }, [credits]);

  return {
    credits,
    loading,
    error,
    refetch: fetchCredits,
    hasDeepDiveAccess,
    hasLaunchKitAccess,
    getAccessStatus,
  };
}
