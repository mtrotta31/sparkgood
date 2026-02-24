// Social Media Graphics Generator for Launch Kit V2
// Uses satori to convert JSX to SVG, then @resvg/resvg-js to convert SVG to PNG

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "fs";
import { join } from "path";
import type { DeepDiveData, GeneratedGraphic, CategoryColors } from "./types";
import { getCategoryColors, extractBusinessOverview } from "./types";

// Satori element type (simplified - satori accepts React-like objects)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SatoriElement = any;

// Graphic dimensions for each platform
const DIMENSIONS = {
  "instagram-post": { width: 1080, height: 1080 },
  "instagram-story": { width: 1080, height: 1920 },
  "linkedin-post": { width: 1200, height: 627 },
  "facebook-cover": { width: 820, height: 312 },
} as const;

// Font loading - use local .ttf files (satori only supports .ttf/.otf, not .woff2)
function loadFonts(): ArrayBuffer[] {
  const fontsDir = join(process.cwd(), "src/lib/launch-kit/fonts");

  const regularFont = readFileSync(join(fontsDir, "Inter-Regular.ttf"));
  const boldFont = readFileSync(join(fontsDir, "Inter-Bold.ttf"));

  return [regularFont.buffer.slice(regularFont.byteOffset, regularFont.byteOffset + regularFont.byteLength), boldFont.buffer.slice(boldFont.byteOffset, boldFont.byteOffset + boldFont.byteLength)];
}

// Cache fonts to avoid re-reading
let cachedFonts: ArrayBuffer[] | null = null;

function getFonts(): ArrayBuffer[] {
  if (!cachedFonts) {
    cachedFonts = loadFonts();
  }
  return cachedFonts;
}

export async function generateSocialGraphics(data: DeepDiveData): Promise<GeneratedGraphic[]> {
  const overview = extractBusinessOverview(data);
  const colors = getCategoryColors(overview.category);
  const fonts = getFonts();

  console.log("[Social Graphics] Category:", overview.category);
  console.log("[Social Graphics] Colors:", colors.primary, colors.secondary);

  const graphics: GeneratedGraphic[] = [];

  // Generate all 4 graphics
  const platforms: Array<keyof typeof DIMENSIONS> = [
    "instagram-post",
    "instagram-story",
    "linkedin-post",
    "facebook-cover",
  ];

  for (const platform of platforms) {
    const { width, height } = DIMENSIONS[platform];

    // Generate JSX-like element for satori
    const element = createGraphicElement(platform, overview, colors, width, height);

    // Convert to SVG using satori
    const svg = await satori(element, {
      width,
      height,
      fonts: [
        {
          name: "Inter",
          data: fonts[0],
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: fonts[1],
          weight: 700,
          style: "normal",
        },
      ],
    });

    // Convert SVG to PNG using resvg
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: width,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    graphics.push({
      name: getFileName(overview.name, platform),
      buffer: Buffer.from(pngBuffer),
      width,
      height,
      platform,
    });
  }

  return graphics;
}

function getFileName(businessName: string, platform: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}-${platform}.png`;
}

// Create JSX-like element for satori
function createGraphicElement(
  platform: keyof typeof DIMENSIONS,
  overview: ReturnType<typeof extractBusinessOverview>,
  colors: CategoryColors,
  width: number,
  height: number
): SatoriElement {
  switch (platform) {
    case "instagram-post":
      return createInstagramPost(overview, colors, width, height);
    case "instagram-story":
      return createInstagramStory(overview, colors, width, height);
    case "linkedin-post":
      return createLinkedInPost(overview, colors, width, height);
    case "facebook-cover":
      return createFacebookCover(overview, colors, width, height);
    default:
      return createInstagramPost(overview, colors, width, height);
  }
}

// Instagram Post (1080×1080) - Square format with clean gradient design
// Text is always on a solid background to prevent clipping
function createInstagramPost(
  overview: ReturnType<typeof extractBusinessOverview>,
  colors: CategoryColors,
  _width: number,
  _height: number
): SatoriElement {
  const location = overview.city && overview.state ? `${overview.city}, ${overview.state}` : "";
  const cta = getCTA(overview.category);

  // Calculate responsive font size based on business name length
  const nameLength = overview.name.length;
  const nameFontSize = nameLength > 20 ? 48 : nameLength > 15 ? 56 : 64;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Decorative elements wrapper - must have display flex for satori
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    top: "40px",
                    left: "40px",
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    border: "4px solid rgba(255,255,255,0.2)",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    top: "80px",
                    right: "60px",
                    width: "60px",
                    height: "60px",
                    background: "rgba(255,255,255,0.15)",
                    transform: "rotate(45deg)",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    top: "180px",
                    left: "120px",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: colors.accent,
                  },
                },
              },
            ],
          },
        },
        // Main content area - positioned in bottom portion on solid background
        {
          type: "div",
          props: {
            style: {
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px",
              paddingTop: "80px",
              paddingBottom: "80px",
              background: colors.background,
              borderTopLeftRadius: "40px",
              borderTopRightRadius: "40px",
            },
            children: [
              // Business name - fully visible with responsive sizing
              {
                type: "div",
                props: {
                  style: {
                    fontSize: `${nameFontSize}px`,
                    fontWeight: 700,
                    color: colors.text,
                    textAlign: "center",
                    lineHeight: 1.2,
                    marginBottom: "20px",
                    maxWidth: "900px",
                    wordWrap: "break-word",
                  },
                  children: overview.name,
                },
              },
              // Tagline
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "24px",
                    fontWeight: 400,
                    color: colors.textLight,
                    textAlign: "center",
                    maxWidth: "800px",
                    marginBottom: "36px",
                    lineHeight: 1.4,
                  },
                  children: truncateText(overview.tagline, 100),
                },
              },
              // CTA Badge
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px 44px",
                    background: colors.primary,
                    borderRadius: "50px",
                    marginBottom: "24px",
                  },
                  children: {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#FFFFFF",
                      },
                      children: cta,
                    },
                  },
                },
              },
              // Location
              location
                ? {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "20px",
                        fontWeight: 500,
                        color: colors.textLight,
                        display: "flex",
                        alignItems: "center",
                      },
                      children: `📍 ${location}`,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
      ],
    },
  };
}

// Helper to truncate text for graphics - truncate at word boundaries
function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  // Find the last space before maxLength
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");

  // If there's a space and it's not too far back, truncate at the word boundary
  if (lastSpace > maxLength * 0.5) {
    return truncated.substring(0, lastSpace) + "...";
  }

  // Otherwise just truncate (for single long words)
  return truncated + "...";
}

// Instagram Story (1080×1920) - Vertical format with clean sections
// Text is on solid backgrounds, decorations in corners
function createInstagramStory(
  overview: ReturnType<typeof extractBusinessOverview>,
  colors: CategoryColors,
  _width: number,
  _height: number
): SatoriElement {
  const location = overview.city && overview.state ? `${overview.city}, ${overview.state}` : "";

  // Calculate responsive font size based on business name length
  const nameLength = overview.name.length;
  const nameFontSize = nameLength > 20 ? 56 : nameLength > 15 ? 64 : 72;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background: colors.background,
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Top colored section with business name
        {
          type: "div",
          props: {
            style: {
              width: "100%",
              height: "40%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              padding: "60px",
              position: "relative",
            },
            children: [
              // Decorative circles wrapper - must have display flex for satori
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          position: "absolute",
                          top: "60px",
                          right: "40px",
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          border: "4px solid rgba(255,255,255,0.2)",
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          position: "absolute",
                          top: "140px",
                          left: "50px",
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.15)",
                        },
                      },
                    },
                  ],
                },
              },
              // Business name - fully visible
              {
                type: "div",
                props: {
                  style: {
                    fontSize: `${nameFontSize}px`,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    textAlign: "center",
                    lineHeight: 1.2,
                    textShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    maxWidth: "900px",
                    wordWrap: "break-word",
                  },
                  children: overview.name,
                },
              },
            ],
          },
        },
        // Middle content section on light background
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px",
            },
            children: [
              // Tagline
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "32px",
                    fontWeight: 400,
                    color: colors.text,
                    textAlign: "center",
                    maxWidth: "850px",
                    marginBottom: "40px",
                    lineHeight: 1.4,
                  },
                  children: truncateText(overview.tagline, 100),
                },
              },
              // Location
              location
                ? {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "26px",
                        fontWeight: 500,
                        color: colors.textLight,
                      },
                      children: `📍 ${location}`,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        // Bottom CTA section
        {
          type: "div",
          props: {
            style: {
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingBottom: "100px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "20px",
                    fontWeight: 400,
                    color: colors.textLight,
                    marginBottom: "16px",
                  },
                  children: "⬆️",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "18px 48px",
                    background: colors.primary,
                    borderRadius: "50px",
                  },
                  children: {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#FFFFFF",
                      },
                      children: "Link in Bio",
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// LinkedIn Post (1200×627) - Professional landscape with clean design
// Text on left side with solid background, accent on right edge
function createLinkedInPost(
  overview: ReturnType<typeof extractBusinessOverview>,
  colors: CategoryColors,
  _width: number,
  _height: number
): SatoriElement {
  const location = overview.city && overview.state ? `${overview.city}, ${overview.state}` : "";

  // Calculate responsive font size based on business name length
  const nameLength = overview.name.length;
  const nameFontSize = nameLength > 25 ? 40 : nameLength > 18 ? 46 : 52;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        background: colors.background,
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Left accent bar
        {
          type: "div",
          props: {
            style: {
              width: "10px",
              height: "100%",
              background: colors.primary,
            },
          },
        },
        // Main content area - takes most of the width
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "50px 60px",
              maxWidth: "750px",
            },
            children: [
              // Business name - fully visible with responsive sizing
              {
                type: "div",
                props: {
                  style: {
                    fontSize: `${nameFontSize}px`,
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: "16px",
                    lineHeight: 1.2,
                    wordWrap: "break-word",
                  },
                  children: overview.name,
                },
              },
              // One-line description
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "22px",
                    fontWeight: 400,
                    color: colors.textLight,
                    marginBottom: "28px",
                    maxWidth: "600px",
                    lineHeight: 1.4,
                  },
                  children: truncateText(overview.tagline, 100),
                },
              },
              // Launching in location badge
              location
                ? {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 24px",
                        background: colors.primary,
                        borderRadius: "8px",
                      },
                      children: {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#FFFFFF",
                          },
                          children: `🚀 Launching in ${location}`,
                        },
                      },
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        // Right accent panel with decorations (no text overlap)
        {
          type: "div",
          props: {
            style: {
              width: "280px",
              height: "100%",
              display: "flex",
              background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              position: "relative",
            },
            children: [
              // Single decorative circle (keeping it simple for satori)
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    right: "40px",
                    top: "60px",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: "4px solid rgba(255,255,255,0.25)",
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// Facebook Cover (820×312) - Wide banner with clean gradient
// Text on solid background, decorations at edges only
function createFacebookCover(
  overview: ReturnType<typeof extractBusinessOverview>,
  colors: CategoryColors,
  _width: number,
  _height: number
): SatoriElement {
  const location = overview.city && overview.state ? `${overview.city}, ${overview.state}` : "";

  // Calculate responsive font size based on business name length
  const nameLength = overview.name.length;
  const nameFontSize = nameLength > 25 ? 32 : nameLength > 18 ? 36 : 40;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        fontFamily: "Inter",
        padding: "30px 50px",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Decorative elements wrapper - must have display flex for satori
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    bottom: "-50px",
                    left: "-30px",
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    position: "absolute",
                    top: "-30px",
                    right: "40px",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.15)",
                  },
                },
              },
            ],
          },
        },
        // Left content - business name and tagline
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              maxWidth: "550px",
            },
            children: [
              // Business name - fully visible with responsive sizing
              {
                type: "div",
                props: {
                  style: {
                    fontSize: `${nameFontSize}px`,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    marginBottom: "10px",
                    textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    lineHeight: 1.2,
                    wordWrap: "break-word",
                  },
                  children: overview.name,
                },
              },
              // Tagline
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "16px",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.9)",
                    maxWidth: "450px",
                    lineHeight: 1.3,
                  },
                  children: truncateText(overview.tagline, 80),
                },
              },
            ],
          },
        },
        // Right content - location badge
        location
          ? {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        padding: "10px 20px",
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      },
                      children: {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#FFFFFF",
                          },
                          children: `📍 ${location}`,
                        },
                      },
                    },
                  },
                ],
              },
            }
          : null,
      ].filter(Boolean),
    },
  };
}

// Get appropriate CTA based on business category
function getCTA(category: string): string {
  const ctas: Record<string, string> = {
    food_beverage: "Now Serving",
    health_wellness: "Book Now",
    education: "Enroll Today",
    technology: "Get Started",
    ecommerce: "Shop Now",
    professional_services: "Schedule a Call",
    creative_arts: "View Our Work",
    real_estate: "Find Your Space",
    social_enterprise: "Join the Movement",
    other: "Learn More",
  };

  return ctas[category] || "Coming Soon";
}
