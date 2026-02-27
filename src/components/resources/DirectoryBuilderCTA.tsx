// Client component for directory-to-builder CTA buttons with GA tracking
"use client";

import Link from "next/link";
import { analytics } from "@/components/analytics/GoogleAnalytics";

interface DirectoryBuilderCTAProps {
  pageType: "listing" | "city_hub" | "directory_home";
  category?: string;
  city?: string;
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export default function DirectoryBuilderCTA({
  pageType,
  category,
  city,
  children,
  className = "",
  href = "/builder",
}: DirectoryBuilderCTAProps) {
  const handleClick = () => {
    analytics.directoryToBuilderClick(pageType, { category, city });
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
