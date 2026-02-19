// About Page
// SparkGood's mission - bridging the intention-action gap

import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "About SparkGood — Our Mission",
  description:
    "SparkGood bridges the gap between wanting to help and actually helping. We make it easy to turn good intentions into real-world impact through AI-powered tools and resources.",
  openGraph: {
    title: "About SparkGood — Our Mission",
    description: "Bridging the gap between good intentions and real impact.",
    type: "website",
    siteName: "SparkGood",
    url: "https://sparkgood.io/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-charcoal-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal-dark/90 backdrop-blur-sm border-b border-warmwhite/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center">
              <span className="text-sm">✦</span>
            </div>
            <span className="font-display text-warmwhite font-semibold">
              SparkGood
            </span>
          </Link>
          <Link
            href="/builder"
            className="px-5 py-2 bg-spark hover:bg-spark-600 text-charcoal-dark font-semibold rounded-full transition-colors text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-warmwhite mb-6">
            Bridging the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-spark to-accent">
              intention-action gap
            </span>
          </h1>
          <p className="text-xl text-warmwhite-muted leading-relaxed">
            Most people want to make a difference. The problem isn&apos;t caring —
            it&apos;s knowing where to start. SparkGood removes the barriers between
            good intentions and real impact.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4 bg-charcoal border-t border-warmwhite/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-warmwhite mb-8 text-center">
            The Problem We&apos;re Solving
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="text-5xl font-bold text-spark mb-4">70%</div>
              <p className="text-warmwhite-muted">
                of Americans care deeply about social causes and want to make a difference
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="text-5xl font-bold text-red-400 mb-4">Few</div>
              <p className="text-warmwhite-muted">
                translate that care into concrete, sustained action
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-warmwhite-muted text-lg leading-relaxed mb-6">
              It&apos;s not a motivation problem. It&apos;s a clarity problem.
            </p>
            <p className="text-warmwhite-muted text-lg leading-relaxed mb-6">
              People get stuck asking: <em>What cause should I focus on? What can I realistically
              do with my time and budget? How do I know if my idea will work? Where do I even begin?</em>
            </p>
            <p className="text-warmwhite text-lg leading-relaxed font-medium">
              SparkGood answers these questions. We guide you from &ldquo;I want to help&rdquo;
              to &ldquo;Here&apos;s exactly what to do.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 px-4 bg-charcoal-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-warmwhite mb-8 text-center">
            How We Help
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-charcoal border border-warmwhite/10">
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Personalized to You
              </h3>
              <p className="text-warmwhite-muted">
                Not everyone can start a nonprofit or quit their job. We meet you where you are —
                whether you have a few hours a month or you&apos;re ready to go all in. Your budget,
                time, experience, and passions shape every recommendation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal border border-warmwhite/10">
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Research-Backed Ideas
              </h3>
              <p className="text-warmwhite-muted">
                We don&apos;t just brainstorm — we research. Every idea is validated against real
                market data, competitive landscape, and feasibility factors. You know before you
                start whether your concept has legs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal border border-warmwhite/10">
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Action-Ready Packages
              </h3>
              <p className="text-warmwhite-muted">
                Ideas are worthless without execution. We give you business plans, marketing copy,
                and step-by-step roadmaps. Not theory — tools you can use today.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal border border-warmwhite/10">
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Free Resources
              </h3>
              <p className="text-warmwhite-muted">
                Our directory connects you with grants, accelerators, SBA resources, and more.
                Real opportunities, searchable by location and focus area. All free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-charcoal border-t border-warmwhite/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-warmwhite mb-8 text-center">
            What We Believe
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-3xl mb-4">✦</div>
              <h3 className="font-display text-lg font-bold text-warmwhite mb-2">
                Everyone Can Contribute
              </h3>
              <p className="text-warmwhite-muted text-sm">
                Impact isn&apos;t reserved for the wealthy or well-connected. Everyone has
                something to offer.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-display text-lg font-bold text-warmwhite mb-2">
                Action Beats Planning
              </h3>
              <p className="text-warmwhite-muted text-sm">
                Perfect plans that never launch help no one. Good enough, started today,
                beats perfect never.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="font-display text-lg font-bold text-warmwhite mb-2">
                Small Starts Scale
              </h3>
              <p className="text-warmwhite-muted text-sm">
                The biggest movements started small. A local project can become a
                national movement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-charcoal-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-6">
            Ready to make a difference?
          </h2>
          <p className="text-warmwhite-muted text-lg mb-8">
            Five minutes from now, you could have tailored ideas for creating impact.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-3 px-10 py-5 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-all text-lg shadow-lg shadow-spark/20"
          >
            Find Your Spark
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
