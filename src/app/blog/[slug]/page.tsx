// SparkLocal Blog - Individual Post Page
// Renders markdown content with clean prose styling

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPostBySlug,
  getAllPostSlugs,
  formatBlogDate,
} from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: `${post.title} | SparkLocal Blog`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      siteName: "SparkLocal",
      url: `https://sparklocal.co/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: "https://sparklocal.co/og-default.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["https://sparklocal.co/og-default.png"],
    },
    alternates: {
      canonical: `https://sparklocal.co/blog/${post.slug}`,
    },
  };
}

// Article structured data component
function ArticleStructuredData({
  title,
  description,
  slug,
  date,
  author,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  author: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    url: `https://sparklocal.co/blog/${slug}`,
    datePublished: date,
    dateModified: date,
    author: {
      "@type": "Organization",
      name: author,
      url: "https://sparklocal.co",
    },
    publisher: {
      "@type": "Organization",
      name: "SparkLocal",
      url: "https://sparklocal.co",
      logo: {
        "@type": "ImageObject",
        url: "https://sparklocal.co/og-default.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://sparklocal.co/blog/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <ArticleStructuredData
        title={post.title}
        description={post.description}
        slug={post.slug}
        date={post.date}
        author={post.author}
      />

      <main className="min-h-screen">
        {/* Header */}
        <section className="pt-12 pb-8 px-4 sm:px-6 bg-gradient-to-b from-amber-50/50 to-cream">
          <div className="max-w-3xl mx-auto">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8"
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
              Back to Blog
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-slate-500">
              <span>{formatBlogDate(post.date)}</span>
              <span>•</span>
              <span>{post.author}</span>
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="py-12 px-4 sm:px-6">
          <div
            className="max-w-3xl mx-auto prose prose-slate prose-lg
              prose-headings:font-display prose-headings:font-bold prose-headings:text-slate-800
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-a:text-spark prose-a:font-medium prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-800 prose-strong:font-semibold
              prose-ul:text-slate-600 prose-ol:text-slate-600
              prose-li:marker:text-spark
              prose-blockquote:border-spark prose-blockquote:text-slate-600 prose-blockquote:not-italic
              prose-code:text-amber-700 prose-code:bg-amber-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-slate-800 prose-pre:text-slate-100"
            dangerouslySetInnerHTML={{ __html: post.htmlContent || "" }}
          />
        </article>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 bg-cream-dark">
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
    </>
  );
}
