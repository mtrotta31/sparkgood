// Robots.txt for SparkLocal
// Tells search engines where to find the sitemap and what to crawl

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/projects/", // User-specific pages
        ],
      },
    ],
    sitemap: "https://sparklocal.co/sitemap.xml",
  };
}
