#!/usr/bin/env npx tsx
/**
 * Generate default Open Graph image for SparkLocal directory pages
 *
 * Usage: npx tsx scripts/generate-og-image.ts
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Brand colors
const SPARK = "#F59E0B";
const ACCENT = "#F97316";
const CREAM = "#FFF8F0";
const SLATE = "#1E293B";

// OG image dimensions
const WIDTH = 1200;
const HEIGHT = 630;

async function generateOGImage() {
  // Load Inter font (already available in the project for Launch Kit)
  const interRegular = readFileSync(
    join(process.cwd(), "src/lib/launch-kit/fonts/Inter-Regular.ttf")
  );
  const interBold = readFileSync(
    join(process.cwd(), "src/lib/launch-kit/fonts/Inter-Bold.ttf")
  );

  // Create the OG image using satori
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: CREAM,
          padding: "60px",
          position: "relative",
        },
        children: [
          // Top accent line
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "8px",
                background: `linear-gradient(90deg, ${SPARK} 0%, ${ACCENT} 100%)`,
              },
            },
          },
          // Logo/Icon area
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
              },
              children: [
                // Spark icon (simplified S shape)
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "80px",
                      height: "80px",
                      borderRadius: "20px",
                      background: `linear-gradient(135deg, ${SPARK} 0%, ${ACCENT} 100%)`,
                      marginRight: "20px",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            color: "white",
                            fontSize: "48px",
                            fontWeight: 700,
                            fontFamily: "Inter",
                          },
                          children: "S",
                        },
                      },
                    ],
                  },
                },
                // SparkLocal text
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: "64px",
                      fontWeight: 700,
                      fontFamily: "Inter",
                      color: SLATE,
                      letterSpacing: "-1px",
                    },
                    children: "SparkLocal",
                  },
                },
              ],
            },
          },
          // Tagline
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: "32px",
                fontWeight: 400,
                fontFamily: "Inter",
                color: "#64748B",
                textAlign: "center",
                maxWidth: "800px",
                lineHeight: 1.4,
              },
              children: "Find everything you need to start a business in your city",
            },
          },
          // Bottom accent element
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                position: "absolute",
                bottom: "60px",
                width: "120px",
                height: "4px",
                borderRadius: "2px",
                background: `linear-gradient(90deg, ${SPARK} 0%, ${ACCENT} 100%)`,
              },
            },
          },
          // URL at bottom
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                position: "absolute",
                bottom: "30px",
                fontSize: "18px",
                fontWeight: 400,
                fontFamily: "Inter",
                color: "#94A3B8",
              },
              children: "sparklocal.co/resources",
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "Inter",
          data: interRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: interBold,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  // Convert SVG to PNG using resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: WIDTH,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // Save to public folder
  const outputPath = join(process.cwd(), "public/og-default.png");
  writeFileSync(outputPath, pngBuffer);

  console.log(`✅ Generated OG image: ${outputPath}`);
  console.log(`   Dimensions: ${WIDTH}x${HEIGHT}px`);
  console.log(`   Size: ${(pngBuffer.length / 1024).toFixed(1)} KB`);
}

generateOGImage().catch((error) => {
  console.error("Failed to generate OG image:", error);
  process.exit(1);
});
