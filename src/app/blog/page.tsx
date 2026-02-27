// SparkLocal Blog - Index Page
// Lists all blog posts, newest first

import Link from "next/link";
import type { Metadata } from "next";
import { getAllPostsMeta, formatBlogDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | SparkLocal",
  description:
    "Startup guides, funding tips, and business resources for entrepreneurs. Learn how to start and grow your business with SparkLocal.",
  keywords: [
    "startup blog",
    "business tips",
    "entrepreneur resources",
    "small business guides",
    "funding advice",
  ],
  openGraph: {
    title: "Blog | SparkLocal",
    description:
      "Startup guides, funding tips, and business resources for entrepreneurs.",
    type: "website",
    siteName: "SparkLocal",
    url: "https://sparklocal.co/blog",
    images: [
      {
        url: "https://sparklocal.co/og-default.png",
        width: 1200,
        height: 630,
        alt: "SparkLocal Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | SparkLocal",
    description:
      "Startup guides, funding tips, and business resources for entrepreneurs.",
    images: ["https://sparklocal.co/og-default.png"],
  },
  alternates: {
    canonical: "https://sparklocal.co/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 bg-gradient-to-b from-amber-50/50 to-cream">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            SparkLocal{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-spark to-accent">
              Blog
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Guides, tips, and resources to help you start and grow your business.
          </p>
        </div>
      </section>

      {/* Posts List */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">
                No posts yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-warm hover:shadow-warm-md transition-shadow"
                >
                  <Link href={`/blog/${post.slug}`} className="block group">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-800 mb-3 group-hover:text-spark transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {post.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{formatBlogDate(post.date)}</span>
                      <span>•</span>
                      <span>{post.author}</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-12 text-center shadow-warm-xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to start your business?
            </h2>
            <p className="text-slate-300 text-lg max-w-xl mx-auto mb-8">
              SparkLocal helps you discover business ideas, create a launch plan,
              and find resources in your city.
            </p>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-8 py-4 bg-spark hover:bg-spark-400 text-white font-bold rounded-full transition-all text-lg shadow-lg shadow-spark/30"
            >
              Get Started Free
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
        </div>
      </section>
    </main>
  );
}
