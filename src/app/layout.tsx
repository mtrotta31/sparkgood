import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
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
    default: "SparkGood — Turn Good Intentions Into Real Impact",
    template: "%s | SparkGood",
  },
  description:
    "From idea to action: AI-powered tools that help you launch social ventures, community projects, and nonprofits that make a real difference.",
  keywords: [
    "social entrepreneurship",
    "nonprofit startup",
    "community project",
    "social impact",
    "social enterprise",
    "purpose-driven business",
    "AI business planning",
  ],
  authors: [{ name: "SparkGood" }],
  creator: "SparkGood",
  metadataBase: new URL("https://sparkgood.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sparkgood.io",
    siteName: "SparkGood",
    title: "SparkGood — Spark Something Good",
    description:
      "From idea to action: AI-powered tools that help you launch social ventures that make a real difference.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SparkGood — Spark Something Good",
    description:
      "From idea to action: AI-powered tools that help you launch social ventures that make a real difference.",
  },
  robots: {
    index: true,
    follow: true,
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
        {children}
      </body>
    </html>
  );
}
