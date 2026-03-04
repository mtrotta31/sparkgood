#!/usr/bin/env npx tsx
/**
 * Generate favicon files from SparkLocal icon SVG
 *
 * Generates:
 * - favicon.ico (32x32 PNG)
 * - apple-touch-icon.png (180x180)
 * - favicon-32x32.png (32x32)
 * - favicon-16x16.png (16x16)
 *
 * Usage: npx tsx scripts/generate-favicon.ts
 */

import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

function generateFavicons() {
  const iconPath = join(process.cwd(), "public/sparklocal-icon.svg");
  const svgContent = readFileSync(iconPath, "utf-8");

  console.log("Generating favicons from sparklocal-icon.svg...\n");

  // Generate apple-touch-icon.png (180x180)
  const appleTouchResvg = new Resvg(svgContent, {
    fitTo: {
      mode: "width",
      value: 180,
    },
  });
  const appleTouchPng = appleTouchResvg.render().asPng();
  const appleTouchPath = join(process.cwd(), "public/apple-touch-icon.png");
  writeFileSync(appleTouchPath, appleTouchPng);
  console.log(`✅ Generated: ${appleTouchPath}`);
  console.log(`   Size: 180x180px (${(appleTouchPng.length / 1024).toFixed(1)} KB)\n`);

  // Generate favicon-32x32.png
  const favicon32Resvg = new Resvg(svgContent, {
    fitTo: {
      mode: "width",
      value: 32,
    },
  });
  const favicon32Png = favicon32Resvg.render().asPng();
  const favicon32Path = join(process.cwd(), "public/favicon-32x32.png");
  writeFileSync(favicon32Path, favicon32Png);
  console.log(`✅ Generated: ${favicon32Path}`);
  console.log(`   Size: 32x32px (${(favicon32Png.length / 1024).toFixed(1)} KB)\n`);

  // Write as PNG with .ico extension (modern browsers support PNG in .ico)
  const faviconPath = join(process.cwd(), "public/favicon.ico");
  writeFileSync(faviconPath, favicon32Png);
  console.log(`✅ Generated: ${faviconPath}`);
  console.log(`   Size: 32x32px (${(favicon32Png.length / 1024).toFixed(1)} KB)\n`);

  // Generate favicon-16x16.png
  const favicon16Resvg = new Resvg(svgContent, {
    fitTo: {
      mode: "width",
      value: 16,
    },
  });
  const favicon16Png = favicon16Resvg.render().asPng();
  const favicon16Path = join(process.cwd(), "public/favicon-16x16.png");
  writeFileSync(favicon16Path, favicon16Png);
  console.log(`✅ Generated: ${favicon16Path}`);
  console.log(`   Size: 16x16px (${(favicon16Png.length / 1024).toFixed(1)} KB)\n`);

  console.log("All favicons generated successfully!");
}

generateFavicons();
