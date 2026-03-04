import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

// Organization schema for brand recognition in SERPs
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SparkLocal",
  url: "https://sparklocal.co",
  logo: "https://sparklocal.co/sparklocal-logo.png",
  description:
    "AI-powered business planning platform helping entrepreneurs start and grow local businesses with personalized guidance and 2,900+ resources.",
  foundingDate: "2024",
  areaServed: "United States",
  sameAs: [],
};

// WebSite schema for sitelinks search box in Google
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SparkLocal",
  url: "https://sparklocal.co",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://sparklocal.co/resources?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

// Display font for headings - distinctive, human, warm
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Body font - clean, friendly, readable
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "SparkLocal — Find Everything You Need to Start a Business",
    template: "%s | SparkLocal",
  },
  description:
    "AI-powered business planning tools and 2,900+ local resources to help you start your business. Find coworking spaces, grants, accelerators, and mentors near you.",
  keywords: [
    "start a business",
    "business planning",
    "small business resources",
    "coworking spaces",
    "business grants",
    "startup accelerators",
    "AI business planning",
    "local business resources",
  ],
  authors: [{ name: "SparkLocal" }],
  creator: "SparkLocal",
  metadataBase: new URL("https://sparklocal.co"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/sparklocal-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sparklocal.co",
    siteName: "SparkLocal",
    title: "SparkLocal — Start Your Business Today",
    description:
      "AI-powered business planning and 2,900+ local resources. Find coworking, grants, accelerators, and mentors near you.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "SparkLocal — Start Your Business Today",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SparkLocal — Start Your Business Today",
    description:
      "AI-powered business planning and 2,900+ local resources. Find coworking, grants, accelerators, and mentors near you.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: '709GrHYEvWbufV8TiJ2PVihxLrav-8MRhV-LKv3L-Cs',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} font-body antialiased min-h-screen`}
      >
        <GoogleAnalytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
