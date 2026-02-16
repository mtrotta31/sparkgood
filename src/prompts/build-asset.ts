// Prompts for "Build This For Me" asset generation
// These create actual, usable assets — not templates or placeholders

import type { AssetType, BuildAssetRequest } from "@/types/assets";

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

export const ASSET_SYSTEM_PROMPT = `You are SparkGood's asset builder. You create ACTUAL, READY-TO-USE content — not templates, not placeholders, not "insert X here" instructions.

Your outputs should be:
- Complete and ready to use immediately
- Specific to the project (use the actual name, actual audience, actual problem)
- Professional quality but appropriately casual for community projects
- Compelling and action-oriented

CRITICAL: Return ONLY a valid JSON object. No explanation text. No markdown code blocks. Just the raw JSON starting with { and ending with }.`;

// ============================================================================
// LANDING PAGE PROMPT
// ============================================================================

export function generateLandingPagePrompt(request: BuildAssetRequest): string {
  const { idea, profile, taskDescription } = request;

  return `Create a complete, standalone landing page for this social impact project.

## The Project
**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Who it helps:** ${idea.audience}
**Impact:** ${idea.impact}
${idea.revenueModel ? `**How it sustains:** ${idea.revenueModel}` : ""}

## Context
**Venture Type:** ${profile.ventureType}
**Format:** ${profile.format}
**User's Task:** ${taskDescription}

## Requirements

Create a COMPLETE standalone HTML file with:
1. Inline CSS (no external stylesheets)
2. Mobile-responsive design
3. Warm, inviting colors (use amber/gold #F59E0B as accent, dark backgrounds #1C1412)
4. Clear sections: Hero, Problem, Solution, How It Works, Call to Action
5. A signup form (can be a mailto: link or placeholder form)
6. Professional typography (use system fonts: -apple-system, BlinkMacSystemFont, 'Segoe UI', etc.)

The page should be immediately usable — someone could save this HTML file and host it.

## Output Format (JSON)

\`\`\`json
{
  "type": "landing_page",
  "title": "Landing Page for ${idea.name}",
  "content": "<!DOCTYPE html>\\n<html>... COMPLETE HTML HERE ...</html>",
  "metadata": {
    "filename": "${idea.name.toLowerCase().replace(/\s+/g, '-')}-landing-page.html",
    "wordCount": 250
  }
}
\`\`\`

Return ONLY valid JSON.`;
}

// ============================================================================
// SOCIAL POST PROMPT
// ============================================================================

export function generateSocialPostPrompt(request: BuildAssetRequest): string {
  const { idea, profile, taskDescription, platform } = request;

  // Detect platform from task description if not specified
  let targetPlatform = platform || "general";
  const taskLower = taskDescription.toLowerCase();
  if (taskLower.includes("nextdoor") || taskLower.includes("facebook")) {
    targetPlatform = "nextdoor";
  } else if (taskLower.includes("linkedin")) {
    targetPlatform = "linkedin";
  } else if (taskLower.includes("instagram")) {
    targetPlatform = "instagram";
  } else if (taskLower.includes("twitter") || taskLower.includes("x.com")) {
    targetPlatform = "twitter";
  }

  const platformGuidelines: Record<string, string> = {
    nextdoor: "Neighborly and local. Reference the specific community. 2-3 short paragraphs. Include specific date/time/location if relevant.",
    facebook: "Conversational, can be longer. Use line breaks. Can include emoji sparingly. End with a question to encourage comments.",
    linkedin: "Professional but warm. 2-3 paragraphs. Focus on impact and story. Good for recruiting volunteers with professional skills.",
    instagram: "Casual, visual language. Use line breaks between thoughts. End with a clear CTA. Can suggest hashtags.",
    twitter: "Concise, punchy. Under 280 characters. Hook in first line. End with link or CTA.",
    general: "Adaptable for any platform. Clear, compelling, 2-3 paragraphs."
  };

  return `Create a ready-to-post social media post for this project.

## The Project
**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Who it helps:** ${idea.audience}
**Impact:** ${idea.impact}

## Context
**Venture Type:** ${profile.ventureType}
**Platform:** ${targetPlatform}
**User's Task:** ${taskDescription}

## Platform Guidelines
${platformGuidelines[targetPlatform] || platformGuidelines.general}

## Requirements
- Write the ACTUAL post, not a template
- Include real details from the project
- Be specific and compelling
- Include a clear call to action
- Sound human, not corporate

## Output Format (JSON)

\`\`\`json
{
  "type": "social_post",
  "title": "${targetPlatform.charAt(0).toUpperCase() + targetPlatform.slice(1)} Post for ${idea.name}",
  "content": "The complete post text here, ready to copy and paste",
  "metadata": {
    "platform": "${targetPlatform}",
    "hashtags": ["relevant", "hashtags"],
    "wordCount": 50
  }
}
\`\`\`

Return ONLY valid JSON.`;
}

// ============================================================================
// EMAIL PROMPT
// ============================================================================

export function generateEmailPrompt(request: BuildAssetRequest): string {
  const { idea, profile, taskDescription } = request;

  // Detect email type from task description
  const taskLower = taskDescription.toLowerCase();
  let emailType = "outreach";
  if (taskLower.includes("welcome")) emailType = "welcome";
  else if (taskLower.includes("reminder")) emailType = "reminder";
  else if (taskLower.includes("follow")) emailType = "followup";
  else if (taskLower.includes("partner") || taskLower.includes("sponsor")) emailType = "partnership";
  else if (taskLower.includes("volunteer")) emailType = "volunteer_recruit";
  else if (taskLower.includes("thank")) emailType = "thank_you";

  const emailGuidelines: Record<string, string> = {
    outreach: "Introduce the project, explain why you're reaching out, clear ask, easy next step.",
    welcome: "Warm welcome, what to expect, first action they should take, how to get help.",
    reminder: "Brief, specific reminder of date/time/location, what to bring, excitement.",
    followup: "Reference previous interaction, provide update, next step or ask.",
    partnership: "Professional, explain mutual value, specific partnership opportunity, clear next step.",
    volunteer_recruit: "Inspiring, explain the impact, specific roles available, low-commitment first step.",
    thank_you: "Genuine gratitude, specific impact they had, what's next, invitation to stay involved."
  };

  return `Create a complete, ready-to-send email for this project.

## The Project
**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Who it helps:** ${idea.audience}
**Impact:** ${idea.impact}

## Context
**Venture Type:** ${profile.ventureType}
**Email Type:** ${emailType}
**User's Task:** ${taskDescription}

## Email Guidelines
${emailGuidelines[emailType]}

## Requirements
- Write the ACTUAL email, not a template
- Include a compelling subject line
- Use the project's real name and details
- Keep it appropriately short (3-4 paragraphs max for most types)
- End with a clear, easy next step
- Sound human and warm, not corporate

## Output Format (JSON)

\`\`\`json
{
  "type": "email",
  "title": "${emailType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Email for ${idea.name}",
  "content": "Subject: Compelling subject line\\n\\nHi [Name],\\n\\nEmail body here...\\n\\nBest,\\n[Your name]",
  "metadata": {
    "subject": "The subject line",
    "wordCount": 150
  }
}
\`\`\`

Return ONLY valid JSON.`;
}

// ============================================================================
// FLYER PROMPT
// ============================================================================

export function generateFlyerPrompt(request: BuildAssetRequest): string {
  const { idea, profile, taskDescription } = request;

  return `Create flyer content for this project. Output as structured text that can be easily laid out in any design tool.

## The Project
**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Who it helps:** ${idea.audience}
**Impact:** ${idea.impact}

## Context
**Venture Type:** ${profile.ventureType}
**Format:** ${profile.format}
**User's Task:** ${taskDescription}

## Requirements
- Create clear, scannable content for a one-page flyer
- Include: headline, subheadline, 3-4 bullet points, call to action, contact info placeholder
- Keep text SHORT — flyers are visual, not essays
- Make it compelling enough that someone would take action

## Output Format (JSON)

\`\`\`json
{
  "type": "flyer",
  "title": "Flyer for ${idea.name}",
  "content": "HEADLINE\\n${idea.name}\\n\\nSUBHEADLINE\\nCompelling one-liner\\n\\nKEY POINTS\\n• Point 1\\n• Point 2\\n• Point 3\\n\\nCALL TO ACTION\\nWhat to do next\\n\\nCONTACT\\n[Your contact info]\\n\\nDATE/LOCATION (if applicable)\\n[Details]",
  "metadata": {
    "filename": "${idea.name.toLowerCase().replace(/\s+/g, '-')}-flyer.txt",
    "wordCount": 75
  }
}
\`\`\`

Return ONLY valid JSON.`;
}

// ============================================================================
// PITCH SCRIPT PROMPT
// ============================================================================

export function generatePitchScriptPrompt(request: BuildAssetRequest): string {
  const { idea, profile, taskDescription } = request;

  // Detect pitch type from task
  const taskLower = taskDescription.toLowerCase();
  let pitchType = "30_second";
  if (taskLower.includes("elevator") || taskLower.includes("30") || taskLower.includes("quick")) {
    pitchType = "30_second";
  } else if (taskLower.includes("2 minute") || taskLower.includes("detailed")) {
    pitchType = "2_minute";
  } else if (taskLower.includes("explain") || taskLower.includes("talking points")) {
    pitchType = "talking_points";
  }

  const pitchGuidelines: Record<string, string> = {
    "30_second": "30-second elevator pitch. Hook, problem, solution, impact, ask. Memorizable.",
    "2_minute": "2-minute pitch. Story-driven, includes a specific example or anecdote, ends with clear ask.",
    "talking_points": "Flexible talking points for different situations. 5-7 key messages with supporting details."
  };

  return `Create a pitch script for this project.

## The Project
**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Who it helps:** ${idea.audience}
**Impact:** ${idea.impact}
${idea.revenueModel ? `**How it sustains:** ${idea.revenueModel}` : ""}

## Context
**Venture Type:** ${profile.ventureType}
**Pitch Type:** ${pitchType}
**User's Task:** ${taskDescription}

## Pitch Guidelines
${pitchGuidelines[pitchType]}

## Requirements
- Write the ACTUAL script, word for word
- Make it conversational, not robotic
- Include natural pauses and transitions
- End with a specific ask or next step
- Should sound authentic when spoken aloud

## Output Format (JSON)

\`\`\`json
{
  "type": "pitch_script",
  "title": "${pitchType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Pitch for ${idea.name}",
  "content": "The complete script here, written as natural speech",
  "metadata": {
    "wordCount": 100
  }
}
\`\`\`

Return ONLY valid JSON.`;
}

// ============================================================================
// MAIN PROMPT GENERATOR
// ============================================================================

export function generateAssetPrompt(request: BuildAssetRequest): string {
  switch (request.assetType) {
    case "landing_page":
      return generateLandingPagePrompt(request);
    case "social_post":
    case "volunteer_post":
      return generateSocialPostPrompt(request);
    case "email":
    case "partnership_email":
      return generateEmailPrompt(request);
    case "flyer":
      return generateFlyerPrompt(request);
    case "pitch_script":
      return generatePitchScriptPrompt(request);
    case "press_release":
      return generatePressReleasePrompt(request);
    case "grant_intro":
      return generateGrantIntroPrompt(request);
    default:
      return generateGenericAssetPrompt(request);
  }
}

// ============================================================================
// ADDITIONAL ASSET PROMPTS
// ============================================================================

function generatePressReleasePrompt(request: BuildAssetRequest): string {
  const { idea, profile, taskDescription } = request;

  return `Create a press release for this project launch.

## The Project
**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Who it helps:** ${idea.audience}
**Impact:** ${idea.impact}

## Context
**Venture Type:** ${profile.ventureType}
**User's Task:** ${taskDescription}

## Requirements
- Standard press release format (FOR IMMEDIATE RELEASE, headline, dateline, body, boilerplate, contact)
- Lead paragraph answers who, what, when, where, why
- Include a quote from the founder (write it for them)
- Newsworthy angle appropriate for local media
- 300-400 words

## Output Format (JSON)

\`\`\`json
{
  "type": "press_release",
  "title": "Press Release for ${idea.name}",
  "content": "FOR IMMEDIATE RELEASE\\n\\n[Full press release here]",
  "metadata": {
    "filename": "${idea.name.toLowerCase().replace(/\s+/g, '-')}-press-release.txt",
    "wordCount": 350
  }
}
\`\`\`

Return ONLY valid JSON.`;
}

function generateGrantIntroPrompt(request: BuildAssetRequest): string {
  const { idea, profile, taskDescription } = request;

  return `Create a letter of inquiry (LOI) introduction for grant applications.

## The Project
**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Who it helps:** ${idea.audience}
**Impact:** ${idea.impact}
${idea.revenueModel ? `**Sustainability:** ${idea.revenueModel}` : ""}

## Context
**Venture Type:** ${profile.ventureType}
**User's Task:** ${taskDescription}

## Requirements
- Professional grant-writing tone
- Lead with the problem and impact
- Explain the solution clearly
- Include measurable outcomes
- Adaptable to different foundations
- 250-350 words

## Output Format (JSON)

\`\`\`json
{
  "type": "grant_intro",
  "title": "Grant Introduction for ${idea.name}",
  "content": "Dear [Foundation Name],\\n\\n[Full letter of inquiry here]\\n\\nSincerely,\\n[Your name]\\n[Your title]\\n${idea.name}",
  "metadata": {
    "filename": "${idea.name.toLowerCase().replace(/\s+/g, '-')}-grant-intro.txt",
    "wordCount": 300
  }
}
\`\`\`

Return ONLY valid JSON.`;
}

function generateGenericAssetPrompt(request: BuildAssetRequest): string {
  const { idea, profile, taskDescription, assetType } = request;

  return `Create content for this task.

## The Project
**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Who it helps:** ${idea.audience}
**Impact:** ${idea.impact}

## Context
**Venture Type:** ${profile.ventureType}
**Task:** ${taskDescription}

## Requirements
- Create complete, ready-to-use content
- Be specific to this project
- Professional but appropriate for the context

## Output Format (JSON)

\`\`\`json
{
  "type": "${assetType}",
  "title": "Content for ${idea.name}",
  "content": "The complete content here",
  "metadata": {
    "wordCount": 200
  }
}
\`\`\`

Return ONLY valid JSON.`;
}
