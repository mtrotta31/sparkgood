// Session State Management
// Saves and restores user progress through the auth flow

import type { UserProfile, Idea } from "@/types";

const STORAGE_KEY = "sparklocal_pending_session";

export interface PendingSessionState {
  profile: UserProfile;
  ideas: Idea[];
  selectedIdeaId: string | null;
  pendingAction: "deep_dive" | "launch_kit" | "save_ideas" | null;
  timestamp: number;
}

// Default values for new profile fields (for migrating old sessions)
const DEFAULT_PROFILE_FIELDS: Partial<UserProfile> = {
  businessCategory: null,
  targetCustomer: null,
  businessModelPreference: null,
  keySkills: [],
};

/**
 * Migrate old profile format to include new fields
 * Ensures backwards compatibility with sessions saved before the update
 */
function migrateProfile(profile: Partial<UserProfile>): UserProfile {
  return {
    // Apply defaults for new fields
    ...DEFAULT_PROFILE_FIELDS,
    // Then apply the stored profile (overwriting defaults where values exist)
    ...profile,
    // Ensure arrays are always arrays
    keySkills: profile.keySkills || [],
    causes: profile.causes || [],
  } as UserProfile;
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
 * Migrates old profiles to include new fields
 */
export function loadPendingSession(): PendingSessionState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as PendingSessionState;

    // Check if the session is less than 30 minutes old
    const maxAge = 30 * 60 * 1000; // 30 minutes
    if (Date.now() - data.timestamp > maxAge) {
      clearPendingSession();
      return null;
    }

    // Migrate profile to ensure new fields exist
    return {
      ...data,
      profile: migrateProfile(data.profile),
    };
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
