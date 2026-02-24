// Landing Page Generator for Launch Kit V2
// Uses Claude API to generate a beautiful standalone HTML page

import { sendMessage } from "@/lib/claude";
import type { DeepDiveData } from "./types";
import { getCategoryColors, extractBusinessOverview } from "./types";

const LANDING_PAGE_SYSTEM_PROMPT = `You are an expert web designer who creates beautiful, distinctive landing pages. You generate complete, standalone HTML files with inline CSS.

Your design principles:
- Bold, distinctive aesthetic — NOT generic template look
- Professional typography using Google Fonts (include the CDN link)
- Cohesive color palette based on the business category
- Mobile-responsive design
- Clean whitespace and visual hierarchy
- Smooth hover effects and transitions

Your output is ALWAYS a complete HTML file starting with <!DOCTYPE html> and nothing else before or after. No markdown code blocks. No explanations. Just the HTML.`;

export async function generateLandingPage(data: DeepDiveData): Promise<string> {
  const overview = extractBusinessOverview(data);
  const colors = getCategoryColors(overview.category);
  const { growth } = data;

  // Extract landing page copy from growth plan
  const landingCopy = growth?.landingPageCopy;
  const headline = landingCopy?.headline || overview.tagline;
  const subheadline = landingCopy?.subheadline || overview.problem;
  const benefits = landingCopy?.benefits || [];
  const about = landingCopy?.aboutSection || overview.description;
  const faq = landingCopy?.faq || [];
  const cta = landingCopy?.ctaButtonText || "Get Started";

  const prompt = `Create a beautiful, standalone landing page for this business.

## Business Information

**Name:** ${overview.name}
**Tagline:** ${overview.tagline}
**Location:** ${overview.city}${overview.state ? `, ${overview.state}` : ""}
**Category:** ${formatCategory(overview.category)}

## Content to Include

**Hero Section:**
- Headline: "${headline}"
- Subheadline: "${subheadline}"
- CTA Button: "${cta}"

**Problem/Solution Section:**
- Problem: ${overview.problem}
- Solution: ${overview.howItWorks || overview.description}

**Benefits Section (3 benefits):**
${benefits.slice(0, 3).map((b, i) => `${i + 1}. ${b.title}: ${b.description}`).join("\n")}

**About Section:**
${about}

**FAQ Section:**
${faq.slice(0, 3).map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

**Footer:**
- Business name
- Location: ${overview.city}${overview.state ? `, ${overview.state}` : ""}
- "Contact Us" placeholder
- Copyright line

## Design Requirements

**Color Palette (use these exact colors):**
- Primary: ${colors.primary}
- Secondary: ${colors.secondary}
- Accent: ${colors.accent}
- Background: ${colors.background}
- Text: ${colors.text}

**Typography:**
- Use Google Fonts CDN (suggest: Playfair Display for headings, DM Sans for body)
- Include the font link in <head>

**Structure:**
1. Hero with gradient or subtle background
2. Problem/Solution with icons or visual elements
3. Benefits as cards or grid
4. About section
5. FAQ with expandable styling (use CSS only, no JS required)
6. Footer

**Technical Requirements:**
- 100% standalone HTML with all CSS inline in a <style> tag
- No external dependencies except Google Fonts CDN
- Mobile responsive (use CSS media queries)
- No JavaScript required (pure CSS interactions)
- Smooth transitions and hover effects
- Professional, premium feel

Generate the complete HTML file now.`;

  const html = await sendMessage(prompt, {
    systemPrompt: LANDING_PAGE_SYSTEM_PROMPT,
    temperature: 0.7,
    maxTokens: 8000,
  });

  // Clean up the response - remove any markdown code blocks if present
  let cleanHtml = html.trim();

  // Remove markdown code block wrappers if present
  if (cleanHtml.startsWith("```html")) {
    cleanHtml = cleanHtml.replace(/^```html\s*/, "");
  }
  if (cleanHtml.startsWith("```")) {
    cleanHtml = cleanHtml.replace(/^```\s*/, "");
  }
  if (cleanHtml.endsWith("```")) {
    cleanHtml = cleanHtml.replace(/```\s*$/, "");
  }

  // Ensure it starts with DOCTYPE
  if (!cleanHtml.toLowerCase().startsWith("<!doctype")) {
    // Find the DOCTYPE and extract from there
    const doctypeIndex = cleanHtml.toLowerCase().indexOf("<!doctype");
    if (doctypeIndex > -1) {
      cleanHtml = cleanHtml.substring(doctypeIndex);
    }
  }

  return cleanHtml;
}

// Helper to format category for display
function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    food_beverage: "Food & Beverage",
    health_wellness: "Health & Wellness",
    education: "Education & Coaching",
    technology: "Technology",
    ecommerce: "E-Commerce & Retail",
    professional_services: "Professional Services",
    creative_arts: "Creative & Arts",
    real_estate: "Real Estate & Property",
    social_enterprise: "Social Enterprise",
    other: "Business",
  };
  return labels[category] || "Business";
}
