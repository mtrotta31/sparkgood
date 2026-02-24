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

// Font loading - use local .otf files (satori only supports .ttf/.otf, not .woff2)
function loadFonts(): ArrayBuffer[] {
  const fontsDir = join(process.cwd(), "src/lib/launch-kit/fonts");

  const regularFont = readFileSync(join(fontsDir, "Inter-Regular.otf"));
  const boldFont = readFileSync(join(fontsDir, "Inter-Bold.otf"));

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

// Instagram Post (1080×1080) - Square format
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
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        fontFamily: "Inter",
        padding: "80px",
      },
      children: [
        // Decorative circles
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "-150px",
              left: "-150px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            },
          },
        },
        // Business name
        {
          type: "div",
          props: {
            style: {
              fontSize: "72px",
              fontWeight: 700,
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1.1,
              marginBottom: "32px",
              textShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
            children: overview.name,
          },
        },
        // Tagline
        {
          type: "div",
          props: {
            style: {
              fontSize: "32px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              maxWidth: "800px",
              marginBottom: "48px",
            },
            children: overview.tagline,
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
              padding: "16px 40px",
              background: "#FFFFFF",
              borderRadius: "50px",
              marginBottom: "32px",
            },
            children: {
              type: "div",
              props: {
                style: {
                  fontSize: "28px",
                  fontWeight: 700,
                  color: colors.primary,
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
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.8)",
                  display: "flex",
                  alignItems: "center",
                },
                children: `📍 ${location}`,
              },
            }
          : null,
      ].filter(Boolean),
    },
  };
}

// Instagram Story (1080×1920) - Vertical format
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
        background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.primary} 100%)`,
        fontFamily: "Inter",
        padding: "80px",
      },
      children: [
        // Top decorative element
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "60px",
              width: "200px",
              height: "4px",
              background: "rgba(255,255,255,0.4)",
              borderRadius: "2px",
            },
          },
        },
        // Business name - large and centered
        {
          type: "div",
          props: {
            style: {
              fontSize: "80px",
              fontWeight: 700,
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1.1,
              marginBottom: "40px",
              textShadow: "0 4px 16px rgba(0,0,0,0.2)",
            },
            children: overview.name,
          },
        },
        // Tagline
        {
          type: "div",
          props: {
            style: {
              fontSize: "36px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              maxWidth: "900px",
              marginBottom: "60px",
              lineHeight: 1.4,
            },
            children: overview.tagline,
          },
        },
        // Location
        location
          ? {
              type: "div",
              props: {
                style: {
                  fontSize: "28px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.8)",
                  marginBottom: "100px",
                },
                children: `📍 ${location}`,
              },
            }
          : null,
        // Link in Bio CTA
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "auto",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "24px",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "12px",
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
                    padding: "20px 48px",
                    background: "#FFFFFF",
                    borderRadius: "50px",
                  },
                  children: {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "28px",
                        fontWeight: 700,
                        color: colors.primary,
                      },
                      children: "Link in Bio",
                    },
                  },
                },
              },
            ],
          },
        },
      ].filter(Boolean),
    },
  };
}

// LinkedIn Post (1200×627) - Professional landscape
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
        background: "#FFFFFF",
        fontFamily: "Inter",
      },
      children: [
        // Left color bar
        {
          type: "div",
          props: {
            style: {
              width: "12px",
              height: "100%",
              background: colors.primary,
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
              padding: "60px",
              background: `linear-gradient(135deg, ${colors.background} 0%, #FFFFFF 100%)`,
            },
            children: [
              // Business name
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "56px",
                    fontWeight: 700,
                    color: colors.text,
                    marginBottom: "20px",
                    lineHeight: 1.1,
                  },
                  children: overview.name,
                },
              },
              // One-line description
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "28px",
                    fontWeight: 400,
                    color: colors.textLight,
                    marginBottom: "32px",
                    maxWidth: "800px",
                    lineHeight: 1.4,
                  },
                  children: overview.tagline,
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
                            fontSize: "22px",
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
        // Right accent panel
        {
          type: "div",
          props: {
            style: {
              width: "300px",
              height: "100%",
              background: colors.primary,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
            },
            children: [
              // Decorative pattern
              {
                type: "div",
                props: {
                  style: {
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: "4px solid rgba(255,255,255,0.3)",
                    marginBottom: "20px",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: "4px solid rgba(255,255,255,0.2)",
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

// Facebook Cover (820×312) - Wide banner
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
        background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        fontFamily: "Inter",
        padding: "40px 60px",
      },
      children: [
        // Left content
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
            },
            children: [
              // Business name
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "44px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    marginBottom: "12px",
                    textShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  },
                  children: overview.name,
                },
              },
              // Tagline
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "22px",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.9)",
                    maxWidth: "500px",
                  },
                  children: overview.tagline,
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
                        padding: "12px 24px",
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        backdropFilter: "blur(10px)",
                      },
                      children: {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "20px",
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
