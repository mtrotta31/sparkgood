import { useState, useCallback } from "react";
import type { ResourceListing } from "@/types/resources";

interface MatchRequest {
  cause_areas: string[];
  location?: {
    city: string;
    state: string;
  };
  commitment_level?: "weekend" | "steady" | "all_in";
  venture_type?: "project" | "nonprofit" | "business" | "hybrid";
  budget_level?: "zero" | "low" | "medium" | "high";
}

interface ScoredListing extends ResourceListing {
  match_score: number;
  match_reasons: string[];
}

interface MatchResponse {
  success: boolean;
  data?: {
    matches: Record<string, ScoredListing[]>;
    filters_applied: MatchRequest;
  };
  error?: string;
}

interface UseResourceMatchReturn {
  matches: Record<string, ScoredListing[]> | null;
  loading: boolean;
  error: string | null;
  fetchMatches: (params: MatchRequest) => Promise<void>;
}

export function useResourceMatch(): UseResourceMatchReturn {
  const [matches, setMatches] = useState<Record<string, ScoredListing[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async (params: MatchRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/resources/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data: MatchResponse = await response.json();

      if (data.success && data.data) {
        setMatches(data.data.matches);
      } else {
        setError(data.error || "Failed to fetch matched resources");
        setMatches(null);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setMatches(null);
      console.error("Match API error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { matches, loading, error, fetchMatches };
}

export type { MatchRequest, ScoredListing };
