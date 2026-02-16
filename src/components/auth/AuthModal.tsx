"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FadeIn } from "@/components/ui";

type AuthMode = "signin" | "signup" | "forgot";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
  message?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "signup",
  onSuccess,
  message,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signIn, resetPassword } = useAuth();

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
  }, [mode]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      try {
        if (mode === "signup") {
          if (password !== confirmPassword) {
            setError("Passwords don't match");
            setIsLoading(false);
            return;
          }
          if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
          }
          const { error } = await signUp(email, password);
          if (error) {
            setError(error.message);
          } else {
            setSuccess(
              "Check your email for a confirmation link to complete your signup."
            );
          }
        } else if (mode === "signin") {
          const { error } = await signIn(email, password);
          if (error) {
            setError(error.message);
          } else {
            onSuccess?.();
            onClose();
          }
        } else if (mode === "forgot") {
          const { error } = await resetPassword(email);
          if (error) {
            setError(error.message);
          } else {
            setSuccess("Check your email for a password reset link.");
          }
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [
      mode,
      email,
      password,
      confirmPassword,
      signUp,
      signIn,
      resetPassword,
      onSuccess,
      onClose,
    ]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-dark/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <FadeIn duration={200}>
        <div className="relative bg-charcoal-medium border border-warmwhite/10 rounded-2xl p-6 md:p-8 w-full max-w-md mx-4 shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-warmwhite-muted hover:text-warmwhite transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center mx-auto mb-4">
              <span className="text-lg">✦</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-warmwhite">
              {mode === "signin"
                ? "Welcome back"
                : mode === "signup"
                ? "Create your account"
                : "Reset password"}
            </h2>
            {message && (
              <p className="text-warmwhite-muted text-sm mt-2">{message}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-warmwhite-muted mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-charcoal-dark/50 border border-warmwhite/10 rounded-lg text-warmwhite placeholder:text-warmwhite-dim focus:outline-none focus:border-spark/50 focus:ring-1 focus:ring-spark/25 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password (not shown for forgot mode) */}
            {mode !== "forgot" && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-warmwhite-muted mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-charcoal-dark/50 border border-warmwhite/10 rounded-lg text-warmwhite placeholder:text-warmwhite-dim focus:outline-none focus:border-spark/50 focus:ring-1 focus:ring-spark/25 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}

            {/* Confirm Password (only for signup) */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-warmwhite-muted mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-charcoal-dark/50 border border-warmwhite/10 rounded-lg text-warmwhite placeholder:text-warmwhite-dim focus:outline-none focus:border-spark/50 focus:ring-1 focus:ring-spark/25 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-spark text-charcoal-dark font-semibold rounded-full hover:bg-spark-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Loading..."
                : mode === "signin"
                ? "Sign In"
                : mode === "signup"
                ? "Create Account"
                : "Send Reset Link"}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center space-y-2">
            {mode === "signin" && (
              <>
                <button
                  onClick={() => setMode("forgot")}
                  className="text-sm text-warmwhite-muted hover:text-spark transition-colors"
                >
                  Forgot your password?
                </button>
                <p className="text-sm text-warmwhite-muted">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-spark hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p className="text-sm text-warmwhite-muted">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-spark hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <button
                onClick={() => setMode("signin")}
                className="text-sm text-warmwhite-muted hover:text-spark transition-colors"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
