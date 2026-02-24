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

// Instagram Post (1080×1080) - Square format with diagonal split design
function createInstagramPost(
  overview: ReturnType<typeof extractBusinessOverview>,
  colors: CategoryColors,
  _width: number,
  _height: number
): SatoriElement {
  const location = overview.city && overview.state ? `${overview.city}, ${overview.state}` : "";
  const cta = getCTA(overview.category);

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: colors.background,
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Diagonal colored panel (top-left triangle)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary} 45%, transparent 45%)`,
            },
          },
        },
        // Decorative geometric shapes
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "60px",
              left: "60px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.3)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "200px",
              left: "160px",
              width: "60px",
              height: "60px",
              background: colors.accent,
              transform: "rotate(45deg)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "100px",
              right: "80px",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              border: `6px solid ${colors.primary}`,
              opacity: 0.3,
            },
          },
        },
        // Small accent dots
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "200px",
              right: "200px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: colors.secondary,
            },
          },
        },
        // Main content container
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px",
              zIndex: 10,
            },
            children: [
              // Business name
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "68px",
                    fontWeight: 700,
                    color: colors.text,
                    textAlign: "center",
                    lineHeight: 1.1,
                    marginBottom: "28px",
                  },
                  children: truncateText(overview.name, 30),
                },
              },
              // Tagline
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "28px",
                    fontWeight: 400,
                    color: colors.textLight,
                    textAlign: "center",
                    maxWidth: "700px",
                    marginBottom: "40px",
                    lineHeight: 1.4,
                  },
                  children: truncateText(overview.tagline, 80),
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
                    padding: "18px 48px",
                    background: colors.primary,
                    borderRadius: "50px",
                    marginBottom: "28px",
                  },
                  children: {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "26px",
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
                        fontSize: "22px",
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

// Helper to truncate text for graphics
function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

// Instagram Story (1080×1920) - Vertical format with wave design
function createInstagramStory(
  overview: ReturnType<typeof extractBusinessOverview>,
  colors: CategoryColors,
  _width: number,
  _height: number
): SatoriElement {
  const location = overview.city && overview.state ? `${overview.city}, ${overview.state}` : "";

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: colors.background,
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Top colored wave section
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "45%",
              background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              borderBottomLeftRadius: "50% 80px",
              borderBottomRightRadius: "50% 80px",
            },
          },
        },
        // Decorative circles on colored section
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "100px",
              right: "60px",
              width: "160px",
              height: "160px",
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
              top: "200px",
              left: "80px",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
            },
          },
        },
        // Small geometric accent
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "320px",
              right: "150px",
              width: "40px",
              height: "40px",
              background: colors.accent,
              transform: "rotate(45deg)",
            },
          },
        },
        // Main content container
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px",
              zIndex: 10,
              flex: 1,
            },
            children: [
              // Business name - in white on colored section
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "72px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    textAlign: "center",
                    lineHeight: 1.1,
                    marginBottom: "24px",
                    marginTop: "-200px",
                    textShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  },
                  children: truncateText(overview.name, 25),
                },
              },
              // Spacer to push content to light section
              {
                type: "div",
                props: {
                  style: {
                    height: "180px",
                  },
                },
              },
              // Tagline - in colored text on light section
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
                        marginBottom: "60px",
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
              position: "absolute",
              bottom: "100px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
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

// LinkedIn Post (1200×627) - Professional landscape with geometric design
function createLinkedInPost(
  overview: ReturnType<typeof extractBusinessOverview>,
  colors: CategoryColors,
  _width: number,
  _height: number
): SatoriElement {
  const location = overview.city && overview.state ? `${overview.city}, ${overview.state}` : "";

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
        // Decorative angled shape on right
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              right: 0,
              top: 0,
              width: "350px",
              height: "100%",
              background: `linear-gradient(135deg, transparent 0%, ${colors.primary} 0%)`,
              clipPath: "polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)",
            },
          },
        },
        // Geometric decorations on colored area
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              right: "80px",
              top: "60px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.25)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              right: "160px",
              bottom: "80px",
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
              right: "40px",
              bottom: "120px",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: colors.accent,
            },
          },
        },
        // Main content area
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "50px 60px",
              maxWidth: "800px",
              zIndex: 10,
            },
            children: [
              // Business name
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "52px",
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: "16px",
                    lineHeight: 1.1,
                  },
                  children: truncateText(overview.name, 35),
                },
              },
              // One-line description
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "24px",
                    fontWeight: 400,
                    color: colors.textLight,
                    marginBottom: "28px",
                    maxWidth: "650px",
                    lineHeight: 1.4,
                  },
                  children: truncateText(overview.tagline, 90),
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
                        width: "fit-content",
                      },
                      children: {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "20px",
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
      ],
    },
  };
}

// Facebook Cover (820×312) - Wide banner with gradient wave design
function createFacebookCover(
  overview: ReturnType<typeof extractBusinessOverview>,
  colors: CategoryColors,
  _width: number,
  _height: number
): SatoriElement {
  const location = overview.city && overview.state ? `${overview.city}, ${overview.state}` : "";

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
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 60%, ${colors.primary} 100%)`,
        fontFamily: "Inter",
        padding: "30px 50px",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Decorative wave shapes
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "-60px",
              left: "-40px",
              width: "200px",
              height: "200px",
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
              top: "-40px",
              right: "200px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.15)",
            },
          },
        },
        // Small accent squares
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "40px",
              right: "350px",
              width: "25px",
              height: "25px",
              background: colors.accent,
              transform: "rotate(45deg)",
              opacity: 0.6,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "50px",
              right: "150px",
              width: "15px",
              height: "15px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.3)",
            },
          },
        },
        // Left content
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              zIndex: 10,
            },
            children: [
              // Business name
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "40px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    marginBottom: "10px",
                    textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  },
                  children: truncateText(overview.name, 30),
                },
              },
              // Tagline
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.9)",
                    maxWidth: "450px",
                    lineHeight: 1.3,
                  },
                  children: truncateText(overview.tagline, 70),
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
                  zIndex: 10,
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
                            fontSize: "18px",
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
