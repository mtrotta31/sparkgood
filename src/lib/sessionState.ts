// Session State Management
// Saves and restores user progress through the auth flow

import type { UserProfile, Idea } from "@/types";

const STORAGE_KEY = "sparkgood_pending_session";

export interface PendingSessionState {
  profile: UserProfile;
  ideas: Idea[];
  selectedIdeaId: string | null;
  pendingAction: "deep_dive" | "save_ideas" | null;
  timestamp: number;
}

/**
 * Save current session state before auth flow
 */
export function savePendingSession(state: Omit<PendingSessionState, "timestamp">): void {
  try {
    const data: PendingSessionState = {
      ...state,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save pending session:", error);
  }
}

/**
 * Load and clear pending session state after auth
 * Returns null if no valid pending session exists
 */
export function loadPendingSession(): PendingSessionState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: PendingSessionState = JSON.parse(stored);

    // Check if the session is less than 30 minutes old
    const maxAge = 30 * 60 * 1000; // 30 minutes
    if (Date.now() - data.timestamp > maxAge) {
      clearPendingSession();
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to load pending session:", error);
    return null;
  }
}

/**
 * Clear pending session state
 */
export function clearPendingSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear pending session:", error);
  }
}

/**
 * Check if there's a pending session without loading it
 */
export function hasPendingSession(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
