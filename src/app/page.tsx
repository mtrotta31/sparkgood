// SparkGood Landing Page
// "Campfire energy" - warm, grounded, mentorship-feeling

import Link from "next/link";

export default function Home() {
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
          <Link
            href="/builder"
            className="px-5 py-2 bg-spark hover:bg-spark-600 text-charcoal-dark font-semibold rounded-full transition-colors text-sm"
          >
            Get Started
          </Link>
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
            good.
          </span>
        </h1>

        {/* Subheadline - reader as hero */}
        <p className="text-xl md:text-2xl text-warmwhite-muted max-w-2xl mb-8 font-body leading-relaxed">
          You want to make a difference but don&apos;t know where to start.
          <br className="hidden md:block" />
          We&apos;ll help you find the right idea — and actually launch it.
        </p>

        {/* Primary CTA */}
        <Link
          href="/builder"
          className="group px-10 py-5 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-all text-lg shadow-lg shadow-spark/20 hover:shadow-xl hover:shadow-spark/30 flex items-center gap-3"
        >
          Find Your Spark
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
        <p className="mt-8 text-warmwhite-dim text-sm">
          Free to start • Takes 5 minutes • No credit card
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <svg
            className="w-6 h-6 text-warmwhite-dim"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* The Problem - Intention-Action Gap */}
      <section className="py-24 px-4 bg-charcoal border-t border-warmwhite/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-6">
            The gap between{" "}
            <span className="text-spark">wanting to help</span> and{" "}
            <span className="text-spark">actually helping</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-12">
            {/* Stat Card 1 */}
            <div className="p-6 md:p-8 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-spark mb-3 md:mb-4">
                70%
              </div>
              <p className="text-warmwhite-muted text-base md:text-lg">
                of Americans care deeply about social causes
              </p>
            </div>

            {/* Stat Card 2 */}
            <div className="p-6 md:p-8 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-red-400 mb-3 md:mb-4">
                Few
              </div>
              <p className="text-warmwhite-muted text-base md:text-lg">
                translate that care into concrete action
              </p>
            </div>
          </div>

          <p className="text-warmwhite-muted text-lg mt-12 max-w-2xl mx-auto leading-relaxed">
            It&apos;s not that people don&apos;t care. It&apos;s that they
            don&apos;t know where to start. Too many ideas, not enough
            direction. Too much complexity, not enough time.
          </p>

          <p className="text-warmwhite text-xl mt-8 font-medium">
            SparkGood closes that gap.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-charcoal-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              From &ldquo;I want to help&rdquo; to &ldquo;I&apos;m making a
              difference&rdquo;
            </h2>
            <p className="text-warmwhite-muted text-lg max-w-2xl mx-auto">
              Three steps. One conversation. Your complete launch package.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {/* Step 1 */}
            <div className="relative">
              <div className="p-8 rounded-2xl bg-charcoal border border-warmwhite/10 h-full">
                <div className="w-12 h-12 rounded-full bg-spark/20 flex items-center justify-center mb-6">
                  <span className="text-spark font-bold text-xl">1</span>
                </div>
                <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                  Answer a few questions
                </h3>
                <p className="text-warmwhite-muted leading-relaxed">
                  Not a survey — a conversation. What causes light you up? How
                  much time can you give? What&apos;s your budget? We get to
                  know you.
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-4 rotate-45 border-t-2 border-r-2 border-spark/40" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="p-8 rounded-2xl bg-charcoal border border-warmwhite/10 h-full">
                <div className="w-12 h-12 rounded-full bg-spark/20 flex items-center justify-center mb-6">
                  <span className="text-spark font-bold text-xl">2</span>
                </div>
                <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                  Get tailored ideas
                </h3>
                <p className="text-warmwhite-muted leading-relaxed">
                  AI generates social impact concepts calibrated to your life.
                  Weekend warrior? Simple actions. All in? Ambitious ventures.
                  Each idea fits you.
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-4 rotate-45 border-t-2 border-r-2 border-spark/40" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20 h-full">
                <div className="w-12 h-12 rounded-full bg-spark/30 flex items-center justify-center mb-6">
                  <span className="text-spark font-bold text-xl">3</span>
                </div>
                <h3 className="font-display text-xl font-bold text-warmwhite mb-3">
                  Get your launch package
                </h3>
                <p className="text-warmwhite-muted leading-relaxed">
                  Viability analysis. Game plan. Marketing copy. Action
                  roadmap. Everything you need to stop planning and start
                  doing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-24 px-4 bg-charcoal border-t border-b border-warmwhite/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              The movement is already happening
            </h2>
            <p className="text-warmwhite-muted text-lg max-w-2xl mx-auto">
              Social entrepreneurship isn&apos;t a niche. It&apos;s where the
              world is heading.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center p-4 md:p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-spark mb-2">
                $2T
              </div>
              <p className="text-warmwhite-muted text-xs sm:text-sm">
                annual social enterprise revenue globally
              </p>
            </div>

            <div className="text-center p-4 md:p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-spark mb-2">
                10M
              </div>
              <p className="text-warmwhite-muted text-xs sm:text-sm">
                social enterprises worldwide
              </p>
            </div>

            <div className="text-center p-4 md:p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-spark mb-2">
                200M+
              </div>
              <p className="text-warmwhite-muted text-xs sm:text-sm">
                jobs created by social ventures
              </p>
            </div>

            <div className="text-center p-4 md:p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-spark mb-2">
                60%
              </div>
              <p className="text-warmwhite-muted text-xs sm:text-sm">
                of entrepreneurs prioritize impact over profit
              </p>
            </div>
          </div>

          {/* Supporting Quote */}
          <div className="mt-16 text-center">
            <p className="text-warmwhite text-xl md:text-2xl font-display italic max-w-3xl mx-auto">
              &ldquo;When people see clear pathways to help, action increases by
              55%.&rdquo;
            </p>
            <p className="text-warmwhite-dim text-sm mt-4">
              — Social Impact Research, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 px-4 bg-charcoal-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              Built for people who want to do good
            </h2>
            <p className="text-warmwhite-muted text-lg">
              Not just for startup founders. For anyone with good intentions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Weekend Warriors",
                description:
                  "You have a few hours a month and want to make them count. We'll find simple, powerful actions you can start this weekend.",
                icon: "☀️",
              },
              {
                title: "Steady Builders",
                description:
                  "You can commit a few hours a week to something meaningful. We'll help you build something that grows over time.",
                icon: "⚡",
              },
              {
                title: "Career Changers",
                description:
                  "You're ready to align your work with your values. We'll help you explore purpose-driven paths that fit your skills.",
                icon: "🔄",
              },
              {
                title: "All-In Entrepreneurs",
                description:
                  "You're ready to commit serious time and resources. We'll help you build a venture that can change the world.",
                icon: "🚀",
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

      {/* What You Get */}
      <section className="py-24 px-4 bg-charcoal">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              Everything you need to launch
            </h2>
            <p className="text-warmwhite-muted text-lg max-w-2xl mx-auto">
              Not just ideas. A complete package to go from thinking to doing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                title: "Will This Work?",
                description:
                  "Market research and viability analysis so you know if your idea has legs.",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                    />
                  </svg>
                ),
              },
              {
                title: "Your Game Plan",
                description:
                  "A clear business or project plan tailored to your venture type and budget.",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                ),
              },
              {
                title: "Spread the Word",
                description:
                  "Marketing copy, social posts, and outreach templates ready to use.",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                    />
                  </svg>
                ),
              },
              {
                title: "Start Here",
                description:
                  "A prioritized action roadmap so you know exactly what to do first.",
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                    />
                  </svg>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10"
              >
                <div className="w-12 h-12 rounded-xl bg-spark/10 flex items-center justify-center mb-4 text-spark">
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-warmwhite mb-2">
                  {feature.title}
                </h3>
                <p className="text-warmwhite-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
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
            Ready to spark something good?
          </h2>

          <p className="text-warmwhite-muted text-xl mb-10 max-w-xl mx-auto">
            Five minutes from now, you could have four tailored ideas for making
            a difference. The world needs what you have to offer.
          </p>

          <Link
            href="/builder"
            className="group inline-flex items-center gap-3 px-12 py-6 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-all text-xl shadow-xl shadow-spark/30 hover:shadow-2xl hover:shadow-spark/40"
          >
            Find Your Spark
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

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-warmwhite/10 bg-charcoal-dark">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center">
                <span className="text-sm">✦</span>
              </div>
              <span className="font-display text-warmwhite font-semibold">
                SparkGood
              </span>
            </div>

            <p className="text-warmwhite-dim text-sm text-center md:text-right">
              Helping people turn good intentions into real impact.
              <br className="md:hidden" />
              <span className="hidden md:inline"> • </span>© 2026 SparkGood
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
