// Hosted Landing Page Route
// Serves user-generated landing pages at sparklocal.co/sites/[slug]

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { sanitizeHTML } from "@/lib/sanitize";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fetch landing page data by slug
async function getLandingPage(slug: string) {
  const supabase = await createClient();

  // Look up the project by slug in launch_kit_assets
  const { data, error } = await supabase
    .from("deep_dive_results")
    .select(`
      launch_kit_assets,
      idea_id,
      saved_ideas!inner (
        idea_data
      )
    `)
    .not("launch_kit_assets", "is", null)
    .limit(100);

  if (error) {
    console.error("Error fetching landing pages:", error);
    return null;
  }

  // Find the matching landing page by slug
  for (const result of data || []) {
    const assets = result.launch_kit_assets as {
      landingPage?: { slug: string; storagePath: string };
    };

    if (assets?.landingPage?.slug === slug) {
      // Fetch the HTML from storage
      const { data: htmlData, error: storageError } = await supabase.storage
        .from("launch-kit-assets")
        .download(assets.landingPage.storagePath);

      if (storageError || !htmlData) {
        console.error("Error fetching HTML:", storageError);
        return null;
      }

      const html = await htmlData.text();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ideaData = (result.saved_ideas as any)?.idea_data;

      return {
        html,
        ideaData,
        slug,
      };
    }
  }

  return null;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLandingPage(slug);

  if (!page) {
    return {
      title: "Page Not Found | SparkLocal",
    };
  }

  const ideaData = page.ideaData;
  const businessName = ideaData?.name || slug;
  const tagline = ideaData?.tagline || "";

  return {
    title: `${businessName} | SparkLocal Sites`,
    description: tagline || `${businessName} - Built with SparkLocal`,
    openGraph: {
      title: businessName,
      description: tagline,
      type: "website",
      url: `https://sparklocal.co/sites/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: businessName,
      description: tagline,
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getLandingPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Render the landing page HTML (sanitized for XSS protection) */}
      <div
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(page.html) }}
        className="landing-page-container"
      />

      {/* Minimal SparkLocal attribution bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white text-xs py-2 px-4 flex items-center justify-between z-50">
        <span className="opacity-70">
          Built with{" "}
          <a
            href="https://sparklocal.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            SparkLocal
          </a>
        </span>
        <a
          href="https://sparklocal.co/builder"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 transition-colors"
        >
          Create your own →
        </a>
      </div>
    </div>
  );
}
