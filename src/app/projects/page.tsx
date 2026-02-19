"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, FadeIn, Footer } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import ProjectCard from "@/components/projects/ProjectCard";
import type { Idea } from "@/types";

interface Project {
  id: string;
  idea: Idea;
  commitment: string | null;
  createdAt: string;
  updatedAt: string;
  deepDiveStatus: {
    hasViability: boolean;
    hasPlan: boolean;
    hasMarketing: boolean;
    hasRoadmap: boolean;
  };
}

export default function ProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to builder if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/builder");
    }
  }, [user, authLoading, router]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/user/projects");
        const result = await response.json();

        if (result.success) {
          setProjects(result.data);
        } else {
          setError(result.error || "Failed to load projects");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-spark border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if not logged in (will redirect)
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-charcoal-dark">
      <Header showBackToHome={false} />

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <FadeIn duration={400}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-2">
                My Projects
              </h1>
              <p className="text-warmwhite-muted">
                Your social impact ventures, all in one place.
              </p>
            </div>

            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-spark text-charcoal-dark font-medium rounded-full hover:bg-spark-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Start New Project
            </Link>
          </div>
        </FadeIn>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-3 border-spark border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-warmwhite-muted">Loading your projects...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <FadeIn duration={300}>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-spark hover:underline"
              >
                Try again
              </button>
            </div>
          </FadeIn>
        )}

        {/* Empty state */}
        {!isLoading && !error && projects.length === 0 && (
          <FadeIn duration={400}>
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-charcoal-light flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-warmwhite-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-3">
                No projects yet
              </h2>
              <p className="text-warmwhite-muted mb-8 max-w-md mx-auto">
                Start your first social impact venture by answering a few questions. We&apos;ll help you find the perfect idea.
              </p>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-spark text-charcoal-dark font-semibold rounded-full hover:bg-spark-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Start Your First Project
              </Link>
            </div>
          </FadeIn>
        )}

        {/* Projects grid */}
        {!isLoading && !error && projects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                idea={project.idea}
                commitment={project.commitment}
                createdAt={project.createdAt}
                updatedAt={project.updatedAt}
                deepDiveStatus={project.deepDiveStatus}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
