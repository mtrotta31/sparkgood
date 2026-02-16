"use client";

import { useState, useCallback } from "react";
import { Button, FadeIn } from "@/components/ui";
import { AuthModal } from "@/components/auth";
import { useAuth } from "@/contexts/AuthContext";
import { savePendingSession } from "@/lib/sessionState";
import IdeaCard from "./IdeaCard";
import type { Idea, UserProfile } from "@/types";

interface IdeaListProps {
  ideas: (Idea & { mechanism?: string; whyNow?: string; firstStep?: string })[];
  profile: UserProfile;
  onSelectIdea: (idea: Idea) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
  selectedIdea: Idea | null;
  onContinue: () => void;
  onSaveIdeas?: (ideas: Idea[]) => Promise<void>;
  onSaveSingleIdea?: (idea: Idea) => Promise<{ success: boolean; savedId?: string; alreadySaved?: boolean }>;
}

export default function IdeaList({
  ideas,
  profile,
  onSelectIdea,
  onRegenerate,
  isRegenerating = false,
  selectedIdea,
  onContinue,
  onSaveIdeas,
  onSaveSingleIdea,
}: IdeaListProps) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"continue" | "save" | null>(null);
  const [pendingSaveIdea, setPendingSaveIdea] = useState<Idea | null>(null);

  // Handle continue click - prompt for auth if not logged in
  const handleContinue = useCallback(() => {
    if (!user) {
      // Save current state to localStorage before auth flow
      savePendingSession({
        profile,
        ideas,
        selectedIdeaId: selectedIdea?.id || null,
        pendingAction: "deep_dive",
      });
      setPendingAction("continue");
      setShowAuthModal(true);
      return;
    }
    onContinue();
  }, [user, onContinue, profile, ideas, selectedIdea]);

  // Handle save click - prompt for auth if not logged in
  const handleSave = useCallback(async () => {
    if (!user) {
      // Save current state to localStorage before auth flow
      savePendingSession({
        profile,
        ideas,
        selectedIdeaId: selectedIdea?.id || null,
        pendingAction: "save_ideas",
      });
      setPendingAction("save");
      setShowAuthModal(true);
      return;
    }
    if (onSaveIdeas) {
      await onSaveIdeas(ideas);
    }
  }, [user, onSaveIdeas, ideas, profile, selectedIdea]);

  // Handle request to save single idea (triggers auth if needed)
  const handleRequestSaveIdea = useCallback((idea: Idea) => {
    if (!user) {
      // Save current state to localStorage before auth flow
      savePendingSession({
        profile,
        ideas,
        selectedIdeaId: idea.id,
        pendingAction: "save_ideas",
      });
      setPendingSaveIdea(idea);
      setPendingAction("save");
      setShowAuthModal(true);
      return;
    }
  }, [user, profile, ideas]);

  // Handle successful auth - execute pending action
  // Note: This may not fire if page reloads, so builder page also checks for pending session
  const handleAuthSuccess = useCallback(async () => {
    if (pendingAction === "continue") {
      onContinue();
    } else if (pendingAction === "save") {
      if (pendingSaveIdea && onSaveSingleIdea) {
        // Save the pending single idea
        await onSaveSingleIdea(pendingSaveIdea);
      } else if (onSaveIdeas) {
        await onSaveIdeas(ideas);
      }
    }
    setPendingAction(null);
    setPendingSaveIdea(null);
  }, [pendingAction, onContinue, onSaveIdeas, onSaveSingleIdea, ideas, pendingSaveIdea]);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <FadeIn duration={500}>
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">✦</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              Here are your ideas
            </h1>
            <p className="text-warmwhite-muted text-lg max-w-xl mx-auto">
              Based on what you shared, I&apos;ve crafted 4 unique social impact
              concepts. Explore each one and choose the one that resonates most.
            </p>
          </div>
        </FadeIn>

        {/* Ideas Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {ideas.map((idea, index) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              index={index}
              isSelected={selectedIdea?.id === idea.id}
              onSelect={() => onSelectIdea(idea)}
              onContinue={handleContinue}
              onSave={onSaveSingleIdea ? () => onSaveSingleIdea(idea) : undefined}
              isAuthenticated={!!user}
              onRequestAuth={() => handleRequestSaveIdea(idea)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <FadeIn delay={600} duration={500}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Button
              variant="ghost"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2"
            >
              <svg
                className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRegenerating ? "Generating..." : "Generate New Ideas"}
            </Button>

            {selectedIdea && (
              <Button size="lg" onClick={handleContinue}>
                Continue with &quot;{selectedIdea.name}&quot;
              </Button>
            )}
          </div>
        </FadeIn>

        {/* Save Ideas button (for logged in users or to prompt login) */}
        {onSaveIdeas && (
          <FadeIn delay={700} duration={500}>
            <div className="text-center mt-6">
              <button
                onClick={handleSave}
                className="text-sm text-warmwhite-muted hover:text-spark transition-colors flex items-center gap-1.5 mx-auto"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                {user ? "Save these ideas" : "Save ideas (requires account)"}
              </button>
            </div>
          </FadeIn>
        )}

        {/* Help Text */}
        <FadeIn delay={800} duration={500}>
          <p className="text-center text-warmwhite-dim text-sm mt-8">
            Not quite right?{" "}
            <button
              onClick={onRegenerate}
              className="text-spark hover:underline"
              disabled={isRegenerating}
            >
              Regenerate
            </button>{" "}
            for fresh concepts, or select an idea to refine it in the next step.
          </p>
        </FadeIn>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingAction(null);
        }}
        initialMode="signup"
        onSuccess={handleAuthSuccess}
        message={
          pendingAction === "continue"
            ? "Create a free account to access the Deep Dive and save your work."
            : "Create a free account to save your ideas and come back later."
        }
      />
    </>
  );
}
