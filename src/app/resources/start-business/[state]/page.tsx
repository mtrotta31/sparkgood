// State Business Guide Page
// SEO-optimized "How to Start a Business in [State]" programmatic page

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { getStateGuide, getAllStateSlugs } from "@/data/state-guides";

interface PageProps {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllStateSlugs();
  return slugs.map((state) => ({ state }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const guide = getStateGuide(stateSlug);

  if (!guide) {
    return { title: "Not Found" };
  }

  const title = `How to Start a Business in ${guide.name} (${new Date().getFullYear()} Guide)`;
  const description = `Complete guide to starting a business in ${guide.name}. Learn about ${guide.abbreviation} business registration, state taxes, licenses, permits, and key industries.`;

  return {
    title,
    description,
    keywords: [
      `start a business in ${guide.name.toLowerCase()}`,
      `${guide.name.toLowerCase()} business registration`,
      `${guide.abbreviation} LLC`,
      `${guide.name.toLowerCase()} business license`,
      `${guide.name.toLowerCase()} small business`,
      "how to start a business",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "SparkLocal",
      url: `https://sparklocal.co/resources/start-business/${stateSlug}`,
      images: [
        {
          url: "https://sparklocal.co/og-default.png",
          width: 1200,
          height: 630,
          alt: `Start a Business in ${guide.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://sparklocal.co/og-default.png"],
    },
    alternates: {
      canonical: `https://sparklocal.co/resources/start-business/${stateSlug}`,
    },
  };
}

// Clean up any remaining markdown formatting from guide text
function cleanGuideText(text: string): string {
  return text
    // Remove headers
    .replace(/^#{1,6}\s+.+$/gm, '')
    // Remove bold markers but keep text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // Remove italic markers
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Split guide into paragraphs
function splitIntoParagraphs(text: string): string[] {
  const cleaned = cleanGuideText(text);
  return cleaned.split(/\n\n+/).filter(p => p.trim().length > 0);
}

export default async function StateGuidePage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const guide = getStateGuide(stateSlug);

  if (!guide) {
    notFound();
  }

  const paragraphs = splitIntoParagraphs(guide.guide);
  const currentYear = new Date().getFullYear();

  // Build JSON-LD structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Resources",
        item: "https://sparklocal.co/resources",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Start a Business",
        item: "https://sparklocal.co/resources/start-business",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.name,
        item: `https://sparklocal.co/resources/start-business/${stateSlug}`,
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Start a Business in ${guide.name}`,
    description: `A comprehensive guide to starting and registering a business in ${guide.name}, covering business structures, state registration, taxes, and licenses.`,
    step: [
      {
        "@type": "HowToStep",
        name: "Choose a Business Structure",
        text: `Select the appropriate business entity type for your ${guide.name} business (LLC, Corporation, Sole Proprietorship, or Partnership).`,
      },
      {
        "@type": "HowToStep",
        name: "Register with the State",
        text: `File your business formation documents with the ${guide.name} Secretary of State or equivalent agency.`,
      },
      {
        "@type": "HowToStep",
        name: "Obtain an EIN",
        text: "Apply for an Employer Identification Number (EIN) from the IRS for tax purposes.",
      },
      {
        "@type": "HowToStep",
        name: "Register for State Taxes",
        text: `Register with ${guide.name}'s tax authority for applicable state taxes including sales tax and employer withholding.`,
      },
      {
        "@type": "HowToStep",
        name: "Obtain Licenses and Permits",
        text: `Apply for required business licenses and permits at both state and local levels in ${guide.name}.`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/resources" className="hover:text-gray-700">
                Resources
              </Link>
              <span>/</span>
              <Link href="/resources/start-business" className="hover:text-gray-700">
                Start a Business
              </Link>
              <span>/</span>
              <span className="text-gray-900">{guide.name}</span>
            </nav>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How to Start a Business in {guide.name}
            </h1>
            <p className="text-gray-600 text-lg">
              Your complete {currentYear} guide to business registration, state taxes, licenses, and
              key industries in {guide.name}.
            </p>
          </div>
        </section>

        {/* Guide Content */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <article className="prose prose-lg prose-gray max-w-none">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </article>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {guide.faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white rounded-lg border border-gray-200"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="pr-4">{faq.question}</span>
                    <svg
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0"
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
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Cities Section */}
        {guide.cities.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
                Find Resources in {guide.name}
              </h2>
              <p className="text-gray-600 mb-6">
                Explore coworking spaces, grants, accelerators, and SBA resources in these{" "}
                {guide.name} cities:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {guide.cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/resources/${city.slug}`}
                    className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-amber-300 hover:bg-amber-50 transition-all text-center"
                  >
                    {city.city}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-12 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Your Business?
            </h2>
            <p className="text-gray-600 mb-6">
              Get personalized guidance, a custom business plan, and matched resources for your
              specific idea and location.
            </p>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
            >
              Start Building Your Plan
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
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* Back Link */}
        <section className="py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/resources/start-business"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
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
              View All State Guides
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
