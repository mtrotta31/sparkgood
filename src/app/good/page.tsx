// SparkGood Social Impact Landing Page
// Preserves the original social impact experience at sparklocal.co/good

import Link from "next/link";
import Footer from "@/components/ui/Footer";

export const metadata = {
  title: "SparkGood — Spark Something Good",
  description:
    "Turn your desire to make a difference into real-world action. Get personalized social impact ideas, business plans, and a roadmap to create change.",
};

export default function GoodPage() {
  return (
    <main className="min-h-screen bg-charcoal-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal-dark/90 backdrop-blur-sm border-b border-warmwhite/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center">
              <span className="text-sm">✦</span>
            </div>
            <span className="font-display text-warmwhite font-semibold">
              SparkGood
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-warmwhite-muted hover:text-warmwhite transition-colors text-sm hidden sm:block"
            >
              SparkLocal Home
            </Link>
            <Link
              href="/builder?path=social-enterprise"
              className="px-5 py-2 bg-spark hover:bg-spark-600 text-charcoal-dark font-semibold rounded-full transition-colors text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
        {/* Spark Icon */}
        <div className="mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center shadow-lg shadow-spark/20">
            <span className="text-3xl">✦</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-warmwhite mb-6 tracking-tight max-w-4xl px-2">
          Spark something{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-spark to-accent">
            good
          </span>
          .
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-warmwhite-muted max-w-2xl mb-8 font-body leading-relaxed">
          You want to make a difference in the world.
          <br className="hidden md:block" />
          That&apos;s the hardest part — the caring.
          <br className="hidden md:block" />
          Now let&apos;s turn that into action.
        </p>

        {/* CTA */}
        <Link
          href="/builder?path=social-enterprise"
          className="group px-10 py-5 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-all text-lg shadow-lg shadow-spark/20 hover:shadow-xl hover:shadow-spark/30 flex items-center gap-3"
        >
          Let&apos;s Begin
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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

        {/* Trust Badge */}
        <p className="mt-6 text-warmwhite-dim text-sm">
          Takes about 5 minutes • Free to start
        </p>
      </section>

      {/* What You Get Section */}
      <section className="py-24 px-4 bg-charcoal border-t border-warmwhite/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              From good intentions to real impact
            </h2>
            <p className="text-warmwhite-muted text-lg max-w-2xl mx-auto">
              We&apos;ll help you find the perfect way to create change — whether that&apos;s a nonprofit, social enterprise, community project, or something new.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="w-12 h-12 rounded-full bg-spark/20 flex items-center justify-center mb-6">
                <span className="text-spark font-bold text-xl">1</span>
              </div>
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Tell us what matters
              </h3>
              <p className="text-warmwhite-muted leading-relaxed">
                What causes do you care about? How much time can you commit? A quick conversation to understand your passion and situation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="w-12 h-12 rounded-full bg-spark/20 flex items-center justify-center mb-6">
                <span className="text-spark font-bold text-xl">2</span>
              </div>
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Get impact ideas
              </h3>
              <p className="text-warmwhite-muted leading-relaxed">
                Our AI generates personalized social impact concepts tailored to your interests, skills, and constraints. Pick the one that excites you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20">
              <div className="w-12 h-12 rounded-full bg-spark/30 flex items-center justify-center mb-6">
                <span className="text-spark font-bold text-xl">3</span>
              </div>
              <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                Create real change
              </h3>
              <p className="text-warmwhite-muted leading-relaxed">
                Get a complete package: market research, business plan, marketing assets, and an action roadmap. Everything you need to start making a difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 px-4 bg-charcoal-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              For people who want to help
            </h2>
            <p className="text-warmwhite-muted text-lg">
              You don&apos;t need experience. You just need to care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Aspiring Changemakers",
                description:
                  "You want to do something meaningful but don't know where to start. We'll help you find the perfect way to create impact.",
                icon: "💡",
              },
              {
                title: "Social Entrepreneurs",
                description:
                  "You believe business can be a force for good. We'll help you build a venture that creates both impact and income.",
                icon: "🌱",
              },
              {
                title: "Community Builders",
                description:
                  "You see a problem in your community and want to fix it. We'll help you turn your vision into a concrete plan.",
                icon: "🤝",
              },
              {
                title: "Career Pivoters",
                description:
                  "You're ready to leave your job and do work that matters. We'll help you explore options and find your path.",
                icon: "🔄",
              },
            ].map((persona) => (
              <div
                key={persona.title}
                className="p-6 rounded-2xl bg-charcoal border border-warmwhite/10 flex gap-4"
              >
                <div className="text-3xl flex-shrink-0">{persona.icon}</div>
                <div>
                  <h3 className="font-display text-lg font-bold text-warmwhite mb-2">
                    {persona.title}
                  </h3>
                  <p className="text-warmwhite-muted text-sm leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 bg-gradient-to-b from-charcoal-dark to-charcoal">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center mx-auto mb-8 shadow-lg shadow-spark/20">
            <span className="text-2xl">✦</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-bold text-warmwhite mb-6">
            Ready to make a difference?
          </h2>

          <p className="text-warmwhite-muted text-xl mb-10 max-w-xl mx-auto">
            In just a few minutes, you could have personalized impact ideas and a complete plan to create change.
          </p>

          <Link
            href="/builder?path=social-enterprise"
            className="group inline-flex items-center gap-3 px-12 py-6 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-all text-xl shadow-xl shadow-spark/30 hover:shadow-2xl hover:shadow-spark/40"
          >
            Let&apos;s Begin
            <svg
              className="w-6 h-6 group-hover:translate-x-1 transition-transform"
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

          <p className="mt-6 text-warmwhite-dim text-sm">
            Free to start • No credit card required
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
