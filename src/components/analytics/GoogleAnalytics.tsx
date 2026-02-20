// Google Analytics 4 Component
// Loads GA4 on all pages and provides custom event tracking

"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// Extend window type for gtag
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Track page views
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

// Main Google Analytics component
export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

// Custom event tracking functions
export function trackEvent(
  eventName: string,
  parameters?: Record<string, unknown>
) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, parameters);
}

// Pre-defined event tracking helpers
export const analytics = {
  // Track when ideas are generated
  ideaGenerated: (count: number, ventureType: string) => {
    trackEvent("idea_generated", {
      event_category: "engagement",
      event_label: ventureType,
      value: count,
    });
  },

  // Track deep dive purchase
  deepDivePurchased: (ideaId: string, ideaName: string) => {
    trackEvent("deep_dive_purchased", {
      event_category: "conversion",
      event_label: ideaName,
      idea_id: ideaId,
      currency: "USD",
      value: 4.99,
    });
  },

  // Track launch kit purchase
  launchKitPurchased: (ideaId: string, ideaName: string) => {
    trackEvent("launch_kit_purchased", {
      event_category: "conversion",
      event_label: ideaName,
      idea_id: ideaId,
      currency: "USD",
      value: 2.99,
    });
  },

  // Track resource clicks
  resourceClicked: (resourceId: string, resourceName: string, category: string) => {
    trackEvent("resource_clicked", {
      event_category: "engagement",
      event_label: resourceName,
      resource_id: resourceId,
      resource_category: category,
    });
  },

  // Track newsletter signup
  newsletterSignup: (city?: string, state?: string) => {
    trackEvent("newsletter_signup", {
      event_category: "engagement",
      event_label: city && state ? `${city}, ${state}` : "general",
    });
  },

  // Track subscription started
  subscriptionStarted: (plan: "spark" | "ignite") => {
    trackEvent("subscription_started", {
      event_category: "conversion",
      event_label: plan,
      currency: "USD",
      value: plan === "spark" ? 9.99 : 29.99,
    });
  },
};
