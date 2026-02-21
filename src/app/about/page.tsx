// About Page
// SparkLocal's mission - helping people start businesses

import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "About SparkLocal — Our Mission",
  description:
    "We believe starting a business shouldn't be this hard. SparkLocal removes the barriers between wanting to start a business and actually doing it.",
  openGraph: {
    title: "About SparkLocal — Our Mission",
    description: "Removing barriers between wanting to start a business and doing it.",
    type: "website",
    siteName: "SparkLocal",
    url: "https://sparklocal.co/about",
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
              SparkLocal
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
            Starting a business{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-spark to-accent">
              shouldn&apos;t be this hard
            </span>
          </h1>
          <p className="text-xl text-warmwhite-muted leading-relaxed">
            SparkLocal removes the barriers between wanting to start a business
            and actually doing it. We give you the tools, research, and local
            resources to turn your idea into reality.
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
              <div className="text-5xl font-bold text-spark mb-4">62%</div>
              <p className="text-warmwhite-muted">
                of Americans dream of starting their own business
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="text-5xl font-bold text-red-400 mb-4">6%</div>
              <p className="text-warmwhite-muted">
                actually take the leap and start one
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-warmwhite-muted text-lg leading-relaxed mb-6">
              It&apos;s not a motivation problem. It&apos;s an overwhelm problem.
            </p>
            <p className="text-warmwhite-muted text-lg leading-relaxed mb-6">
              People get stuck asking: <em>What business should I start? Will this idea
              actually work? How do I validate it? Where do I find funding? How do I write
              a business plan? What do I do first?</em>
            </p>
            <p className="text-warmwhite text-lg leading-relaxed font-medium">
              SparkLocal answers these questions. We guide you from &ldquo;I have an idea&rdquo;
              to &ldquo;Here&apos;s exactly how to launch it.&rdquo;
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
                AI-Powered Business Planning
              </h3>
              <p className="text-warmwhite-muted">
                Our Idea Builder takes your interests, skills, and constraints and generates
                personalized business ideas tailored to you. Not generic templates — real
                opportunities matched to your unique situation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal border border-warmwhite/10">
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Real Market Research
              </h3>
              <p className="text-warmwhite-muted">
                We don&apos;t just brainstorm — we validate. Every idea gets real market
                analysis, competitive landscape research, and viability scoring. You know
                before you start whether your concept has potential.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal border border-warmwhite/10">
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Complete Launch Packages
              </h3>
              <p className="text-warmwhite-muted">
                Ideas are worthless without execution. We give you business plans, marketing
                copy, financial projections, and step-by-step roadmaps. Not theory — tools
                you can use today.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal border border-warmwhite/10">
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                2,400+ Local Resources
              </h3>
              <p className="text-warmwhite-muted">
                Our directory connects you with coworking spaces, grants, accelerators,
                SBA resources, and mentors in your area. Real opportunities, searchable
                by location. All free to browse.
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
                Everyone Can Start
              </h3>
              <p className="text-warmwhite-muted text-sm">
                Entrepreneurship isn&apos;t reserved for MBAs or venture capitalists.
                Everyone has a business inside them waiting to come out.
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
                Start Local, Scale Up
              </h3>
              <p className="text-warmwhite-muted text-sm">
                The best businesses start by solving problems in your community.
                Local roots create global potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-charcoal-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-6">
            Ready to start your business?
          </h2>
          <p className="text-warmwhite-muted text-lg mb-8">
            Five minutes from now, you could have a personalized business idea with
            a complete launch plan.
          </p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-3 px-10 py-5 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-all text-lg shadow-lg shadow-spark/20"
          >
            Start Building
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
