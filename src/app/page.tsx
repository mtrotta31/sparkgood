// SparkLocal Landing Page
// "Find everything you need to start a business."

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/ui/Footer";

// Fetch category counts from database
async function getCategoryCounts() {
  try {
    const supabase = await createClient();

    // Get counts for the 4 main categories
    const categories = ["grant", "accelerator", "coworking", "sba"] as const;
    const counts: Record<string, number> = {};

    for (const category of categories) {
      const { count } = await supabase
        .from("resource_listings")
        .select("*", { count: "exact", head: true })
        .eq("category", category)
        .eq("is_active", true);

      counts[category] = count || 0;
    }

    return counts;
  } catch (error) {
    console.error("Error fetching category counts:", error);
    return { grant: 0, accelerator: 0, coworking: 0, sba: 0 };
  }
}

// Calculate total resources
function getTotalResources(counts: Record<string, number>): string {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (total >= 1000) {
    return `${(total / 1000).toFixed(1)}k+`;
  }
  return `${total}+`;
}

export default async function Home() {
  const categoryCounts = await getCategoryCounts();
  const totalResources = getTotalResources(categoryCounts);

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
              SparkLocal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/resources"
              className="text-warmwhite-muted hover:text-warmwhite transition-colors text-sm hidden sm:block"
            >
              Resources
            </Link>
            <Link
              href="/builder"
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
          Start your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-spark to-accent">
            business
          </span>{" "}
          today.
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-warmwhite-muted max-w-2xl mb-8 font-body leading-relaxed">
          AI-powered business planning and {totalResources} local resources.
          <br className="hidden md:block" />
          Everything you need to go from idea to launch.
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="/builder"
            className="group px-10 py-5 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-all text-lg shadow-lg shadow-spark/20 hover:shadow-xl hover:shadow-spark/30 flex items-center gap-3"
          >
            Build Your Plan
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
          <Link
            href="/resources"
            className="group px-10 py-5 bg-warmwhite/10 hover:bg-warmwhite/20 text-warmwhite font-bold rounded-full transition-all text-lg flex items-center gap-3"
          >
            Find Local Resources
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>
        </div>

        {/* Trust Badge */}
        <p className="mt-4 text-warmwhite-dim text-sm">
          Free to start • No credit card required
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

      {/* Two Products Section */}
      <section className="py-24 px-4 bg-charcoal border-t border-warmwhite/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              Two ways to get started
            </h2>
            <p className="text-warmwhite-muted text-lg max-w-2xl mx-auto">
              Whether you need help figuring out your idea or you&apos;re ready to find resources, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Product 1: Business Idea Builder */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-spark/10 to-accent/5 border border-spark/20">
              <div className="w-14 h-14 rounded-xl bg-spark/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-warmwhite mb-3">
                Business Idea Builder
              </h3>
              <p className="text-warmwhite-muted mb-6 leading-relaxed">
                Answer a few questions about yourself. Get 4 personalized business ideas tailored to your skills, budget, and goals. Then dive deep with market research, business plans, and marketing assets.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-warmwhite-muted text-sm">
                  <span className="text-spark">✓</span>
                  AI-generated business ideas
                </li>
                <li className="flex items-center gap-2 text-warmwhite-muted text-sm">
                  <span className="text-spark">✓</span>
                  Market research & viability analysis
                </li>
                <li className="flex items-center gap-2 text-warmwhite-muted text-sm">
                  <span className="text-spark">✓</span>
                  Complete business plans
                </li>
                <li className="flex items-center gap-2 text-warmwhite-muted text-sm">
                  <span className="text-spark">✓</span>
                  Marketing assets & launch roadmap
                </li>
              </ul>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 text-spark hover:text-spark-400 font-medium transition-colors"
              >
                Start Building
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Product 2: Local Resources Directory */}
            <div className="p-8 rounded-2xl bg-charcoal-light border border-warmwhite/10">
              <div className="w-14 h-14 rounded-xl bg-blue-400/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-warmwhite mb-3">
                Local Resources Directory
              </h3>
              <p className="text-warmwhite-muted mb-6 leading-relaxed">
                Search {totalResources} coworking spaces, grants, accelerators, and SBA resources near you. Filter by location and find exactly what you need to get your business off the ground.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-warmwhite-muted text-sm">
                  <span className="text-blue-400">✓</span>
                  {categoryCounts.coworking}+ coworking spaces
                </li>
                <li className="flex items-center gap-2 text-warmwhite-muted text-sm">
                  <span className="text-blue-400">✓</span>
                  {categoryCounts.grant}+ grant programs
                </li>
                <li className="flex items-center gap-2 text-warmwhite-muted text-sm">
                  <span className="text-blue-400">✓</span>
                  {categoryCounts.accelerator}+ accelerators
                </li>
                <li className="flex items-center gap-2 text-warmwhite-muted text-sm">
                  <span className="text-blue-400">✓</span>
                  {categoryCounts.sba}+ SBA resources
                </li>
              </ul>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Browse Resources
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How the Builder Works */}
      <section className="py-24 px-4 bg-charcoal-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              From idea to launch plan in minutes
            </h2>
            <p className="text-warmwhite-muted text-lg max-w-2xl mx-auto">
              Our AI does the heavy lifting. You just answer a few questions.
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
                  Tell us about yourself
                </h3>
                <p className="text-warmwhite-muted leading-relaxed">
                  What are you interested in? How much time can you commit? What&apos;s your budget? A quick conversation to understand your situation.
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
                  Get business ideas
                </h3>
                <p className="text-warmwhite-muted leading-relaxed">
                  Our AI generates 4 personalized business concepts that match your interests, skills, and constraints. Pick the one that excites you.
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
                  Market research. Business plan. Marketing copy. Action roadmap. Everything you need to stop planning and start doing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Directory Preview */}
      <section className="py-24 px-4 bg-charcoal border-t border-warmwhite/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wide uppercase bg-spark/10 text-spark rounded-full mb-4">
              Free Resource
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              {totalResources} Local Business Resources
            </h2>
            <p className="text-warmwhite-muted text-lg max-w-2xl mx-auto">
              Find coworking spaces, grants, accelerators, and mentorship programs near you. Searchable by location. Always free.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Grants */}
            <Link
              href="/resources/grant"
              className="group p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10 hover:border-green-400/30 transition-all hover:shadow-lg hover:shadow-green-400/5"
            >
              <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center mb-4 text-green-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-warmwhite mb-1 group-hover:text-green-400 transition-colors">
                Grants
              </h3>
              <p className="text-warmwhite-muted text-sm mb-3">
                Funding that doesn&apos;t need to be repaid
              </p>
              <span className="text-warmwhite-dim text-xs">
                {categoryCounts.grant} listings
              </span>
            </Link>

            {/* Accelerators */}
            <Link
              href="/resources/accelerator"
              className="group p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10 hover:border-spark/30 transition-all hover:shadow-lg hover:shadow-spark/5"
            >
              <div className="w-12 h-12 rounded-xl bg-spark/10 flex items-center justify-center mb-4 text-spark">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-warmwhite mb-1 group-hover:text-spark transition-colors">
                Accelerators
              </h3>
              <p className="text-warmwhite-muted text-sm mb-3">
                Intensive programs to fast-track growth
              </p>
              <span className="text-warmwhite-dim text-xs">
                {categoryCounts.accelerator} listings
              </span>
            </Link>

            {/* Coworking */}
            <Link
              href="/resources/coworking"
              className="group p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10 hover:border-blue-400/30 transition-all hover:shadow-lg hover:shadow-blue-400/5"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center mb-4 text-blue-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-warmwhite mb-1 group-hover:text-blue-400 transition-colors">
                Coworking
              </h3>
              <p className="text-warmwhite-muted text-sm mb-3">
                Flexible workspace for entrepreneurs
              </p>
              <span className="text-warmwhite-dim text-xs">
                {categoryCounts.coworking} listings
              </span>
            </Link>

            {/* SBA Resources */}
            <Link
              href="/resources/sba"
              className="group p-6 rounded-2xl bg-charcoal-light border border-warmwhite/10 hover:border-red-400/30 transition-all hover:shadow-lg hover:shadow-red-400/5"
            >
              <div className="w-12 h-12 rounded-xl bg-red-400/10 flex items-center justify-center mb-4 text-red-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-warmwhite mb-1 group-hover:text-red-400 transition-colors">
                SBA Resources
              </h3>
              <p className="text-warmwhite-muted text-sm mb-3">
                Free government business assistance
              </p>
              <span className="text-warmwhite-dim text-xs">
                {categoryCounts.sba} listings
              </span>
            </Link>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-spark hover:text-spark-400 font-medium transition-colors"
            >
              Browse all resources
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 px-4 bg-charcoal-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warmwhite mb-4">
              Built for aspiring entrepreneurs
            </h2>
            <p className="text-warmwhite-muted text-lg">
              Whether you&apos;re starting a side hustle or going all in, we&apos;ve got you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Side Hustlers",
                description:
                  "You have a few hours a week and want to start something on the side. We'll help you find low-commitment business ideas that work with your schedule.",
                icon: "☀️",
              },
              {
                title: "First-Time Founders",
                description:
                  "You're ready to start a real business but don't know where to begin. We'll guide you from idea to launch with everything you need.",
                icon: "🚀",
              },
              {
                title: "Career Changers",
                description:
                  "You're ready to leave your job and do your own thing. We'll help you explore options and build a plan you can believe in.",
                icon: "🔄",
              },
              {
                title: "Local Business Owners",
                description:
                  "You're starting a local business and need resources. Find coworking spaces, grants, and mentors in your area.",
                icon: "📍",
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
                  "A clear business plan tailored to your venture type and budget.",
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
            Ready to start your business?
          </h2>

          <p className="text-warmwhite-muted text-xl mb-10 max-w-xl mx-auto">
            In just a few minutes, you could have personalized business ideas and a complete plan to make it happen.
          </p>

          <Link
            href="/builder"
            className="group inline-flex items-center gap-3 px-12 py-6 bg-spark hover:bg-spark-400 text-charcoal-dark font-bold rounded-full transition-all text-xl shadow-xl shadow-spark/30 hover:shadow-2xl hover:shadow-spark/40"
          >
            Get Started Free
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
