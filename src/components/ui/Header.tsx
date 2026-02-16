"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

interface HeaderProps {
  showBackToHome?: boolean;
  showAuth?: boolean;
}

export default function Header({
  showBackToHome = true,
  showAuth = true,
}: HeaderProps) {
  const { user, isLoading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal-dark/95 backdrop-blur-sm border-b border-warmwhite/5">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-sm">✦</span>
            </div>
            <span className="font-display text-warmwhite font-semibold hidden sm:inline">
              SparkGood
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Back to Home link */}
            {showBackToHome && !user && (
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm text-warmwhite-muted hover:text-warmwhite transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            )}

            {/* Auth buttons */}
            {showAuth && !isLoading && (
              <>
                {user ? (
                  // Logged in - show user menu
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warmwhite/5 hover:bg-warmwhite/10 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-spark/50 to-accent/50 flex items-center justify-center">
                        <span className="text-xs text-warmwhite font-medium">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-warmwhite-muted transition-transform ${
                          showUserMenu ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-charcoal-medium border border-warmwhite/10 rounded-lg shadow-xl z-50 overflow-hidden">
                          <div className="px-4 py-3 border-b border-warmwhite/10">
                            <p className="text-sm text-warmwhite font-medium truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/projects"
                              className="block px-4 py-2 text-sm text-warmwhite-muted hover:text-warmwhite hover:bg-warmwhite/5 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              My Projects
                            </Link>
                            <Link
                              href="/builder"
                              className="block px-4 py-2 text-sm text-warmwhite-muted hover:text-warmwhite hover:bg-warmwhite/5 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Start New Project
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left px-4 py-2 text-sm text-warmwhite-muted hover:text-warmwhite hover:bg-warmwhite/5 transition-colors"
                            >
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // Not logged in - show sign in/up buttons
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSignIn}
                      className="px-4 py-1.5 text-sm text-warmwhite-muted hover:text-warmwhite transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={handleSignUp}
                      className="px-4 py-1.5 text-sm bg-spark text-charcoal-dark font-medium rounded-full hover:bg-spark-400 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}
