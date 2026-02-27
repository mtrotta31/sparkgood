import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

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
    "AI-powered business planning tools and 2,400+ local resources to help you start your business. Find coworking spaces, grants, accelerators, and mentors near you.",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sparklocal.co",
    siteName: "SparkLocal",
    title: "SparkLocal — Start Your Business Today",
    description:
      "AI-powered business planning and 2,400+ local resources. Find coworking, grants, accelerators, and mentors near you.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SparkLocal — Start Your Business Today",
    description:
      "AI-powered business planning and 2,400+ local resources. Find coworking, grants, accelerators, and mentors near you.",
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
      <body
        className={`${playfair.variable} ${dmSans.variable} font-body antialiased min-h-screen`}
      >
        <GoogleAnalytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
