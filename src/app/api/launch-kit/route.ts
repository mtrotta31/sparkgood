// API route for generating Launch Kit
// Generates landing page HTML, 4 social posts, 3-email sequence, and elevator pitch

import { NextRequest, NextResponse } from "next/server";
import { sendMessageForJSON } from "@/lib/claude";
import type {
  UserProfile,
  Idea,
  LaunchKit,
  ApiResponse,
} from "@/types";

interface LaunchKitRequest {
  idea: Idea;
  profile: UserProfile;
}

const LAUNCH_KIT_SYSTEM_PROMPT = `You are SparkGood's launch kit generator — a marketing expert who creates complete launch packages for social impact ventures.

Your copy is:
- Action-oriented and specific
- Empowering without being preachy
- Conversational and authentic
- Tailored to the venture type and audience

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;

function generateLaunchKitPrompt(idea: Idea, profile: UserProfile): string {
  const ventureType = profile.ventureType || "project";
  const locationContext = profile.location
    ? `\n**Location:** ${profile.location.city}, ${profile.location.state} (include local references where appropriate)`
    : "";

  return `Create a complete Launch Kit for this social impact venture.

## The Venture

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}
**Impact:** ${idea.impact}
**Sustainability Model:** ${idea.revenueModel || "Volunteer-driven community project"}

## User Context

**Venture Type:** ${ventureType}${locationContext}

## Generate These Assets

### 1. Landing Page HTML
Create a simple, standalone HTML page that works without external dependencies. Include:
- Clean, modern styling with inline CSS
- Hero section with headline and subheadline
- Problem/solution section
- Benefits (3-4 bullet points)
- Call to action button
- Use a warm color scheme (amber/orange accents on dark background)

### 2. Social Media Posts (4 platforms)
Create launch announcement posts for:
- **LinkedIn:** Professional but personable, 2-3 paragraphs
- **Twitter/X:** Concise, punchy, under 280 characters with line breaks
- **Instagram:** Casual, emoji-friendly, hook + story + CTA format
- **Nextdoor:** Neighborly tone, local focus, community-oriented

### 3. Email Welcome Sequence (3 emails)
Create a 3-email sequence:
- **Email 1 (Welcome):** Thank them for joining, set expectations, quick win
- **Email 2 (Value):** Share a story or insight, provide useful content
- **Email 3 (Call to Action):** Clear ask to take action, create urgency

### 4. Elevator Pitch
30-second verbal pitch (40-60 words) that explains:
- Who you help
- What problem you solve
- How you're different
- One proof point or impact statement

## Output Format (JSON)

\`\`\`json
{
  "landingPage": {
    "html": "<!DOCTYPE html>\\n<html>...",
    "headline": "The main headline",
    "subheadline": "The supporting subheadline"
  },
  "socialPosts": {
    "linkedin": {
      "platform": "linkedin",
      "content": "Full post text...",
      "hashtags": ["relevant", "hashtags"]
    },
    "twitter": {
      "platform": "twitter",
      "content": "Tweet text...",
      "hashtags": ["hashtags"]
    },
    "instagram": {
      "platform": "instagram",
      "content": "Instagram caption...",
      "hashtags": ["hashtags"]
    },
    "nextdoor": {
      "platform": "nextdoor",
      "content": "Nextdoor post...",
      "hashtags": []
    }
  },
  "emailSequence": {
    "email1": {
      "subject": "Welcome subject line",
      "body": "Email body text..."
    },
    "email2": {
      "subject": "Second email subject",
      "body": "Email body text..."
    },
    "email3": {
      "subject": "Third email subject",
      "body": "Email body text..."
    }
  },
  "elevatorPitch": "Your 30-second pitch goes here..."
}
\`\`\`

Return ONLY valid JSON.`;
}

export async function POST(request: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    const body = await request.json();
    const { idea, profile } = body as LaunchKitRequest;

    // Validate required fields
    if (!idea || !profile) {
      return NextResponse.json<ApiResponse<LaunchKit>>({
        success: false,
        error: "Missing required fields: idea or profile",
      });
    }

    // Check for API key
    if (!anthropicKey) {
      console.warn("No ANTHROPIC_API_KEY set, returning mock data");
      return NextResponse.json<ApiResponse<LaunchKit>>({
        success: true,
        data: getMockLaunchKit(idea),
      });
    }

    // Generate the launch kit
    const prompt = generateLaunchKitPrompt(idea, profile);
    const data = await sendMessageForJSON<LaunchKit>(prompt, {
      systemPrompt: LAUNCH_KIT_SYSTEM_PROMPT,
      temperature: 0.8,
      maxTokens: 8000,
    });

    return NextResponse.json<ApiResponse<LaunchKit>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error generating launch kit:", error);
    return NextResponse.json<ApiResponse<LaunchKit>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate launch kit",
      },
      { status: 500 }
    );
  }
}

// Mock data for development
function getMockLaunchKit(idea: Idea): LaunchKit {
  return {
    landingPage: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${idea.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1C1412; color: #f5f5f5; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .hero { text-align: center; padding: 4rem 0; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #F59E0B, #F97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { font-size: 1.25rem; color: #a3a3a3; margin-bottom: 2rem; }
    .cta { display: inline-block; background: #F59E0B; color: #1C1412; padding: 1rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 600; transition: transform 0.2s; }
    .cta:hover { transform: scale(1.05); }
    .section { padding: 3rem 0; border-top: 1px solid rgba(255,255,255,0.1); }
    .section h2 { font-size: 1.5rem; margin-bottom: 1rem; color: #F59E0B; }
    ul { list-style: none; }
    li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
    li::before { content: "✓"; position: absolute; left: 0; color: #F59E0B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>${idea.name}</h1>
      <p class="subtitle">${idea.tagline}</p>
      <a href="#join" class="cta">Join the Movement</a>
    </div>
    <div class="section">
      <h2>The Problem</h2>
      <p>${idea.problem}</p>
    </div>
    <div class="section">
      <h2>Who We Help</h2>
      <p>${idea.audience}</p>
    </div>
    <div class="section">
      <h2>Our Impact</h2>
      <p>${idea.impact}</p>
    </div>
    <div class="section" style="text-align: center;">
      <a href="#join" class="cta">Get Started Today</a>
    </div>
  </div>
</body>
</html>`,
      headline: idea.name,
      subheadline: idea.tagline,
    },
    socialPosts: {
      linkedin: {
        platform: "linkedin",
        content: `I'm excited to announce the launch of ${idea.name}.

${idea.problem}

That's why we built ${idea.name} — ${idea.tagline.toLowerCase()}.

We're looking for:
→ People who care about ${idea.audience.toLowerCase()}
→ Volunteers who want to make a difference
→ Partners who share our mission

If this resonates, I'd love to connect. Drop a comment or send me a message.`,
        hashtags: ["SocialImpact", "Community", "MakingADifference"],
      },
      twitter: {
        platform: "twitter",
        content: `Launching ${idea.name} 🚀

${idea.tagline}

${idea.problem.split('.')[0]}.

Join us: [link]`,
        hashtags: ["LaunchDay", "SocialGood"],
      },
      instagram: {
        platform: "instagram",
        content: `Something exciting is happening ✨

We just launched ${idea.name}.

Here's why it matters:
${idea.problem}

Here's what we're doing about it:
${idea.tagline}

Ready to be part of something bigger?
Link in bio to join us.

Who's in? 👇`,
        hashtags: ["SocialImpact", "Community", "MakingADifference", "LaunchDay", "JoinTheMovement"],
      },
      nextdoor: {
        platform: "nextdoor",
        content: `Hey neighbors! 👋

I wanted to share something I've been working on: ${idea.name}.

${idea.problem}

If you or someone you know could benefit from this, I'd love to connect. We're looking for neighbors who want to ${idea.tagline.toLowerCase()}.

Feel free to reach out with questions!`,
        hashtags: [],
      },
    },
    emailSequence: {
      email1: {
        subject: `Welcome to ${idea.name}!`,
        body: `Hey there!

Thanks for joining ${idea.name}. You're now part of a community that believes ${idea.tagline.toLowerCase()}.

Here's what you can expect:
• Regular updates on our progress
• Opportunities to get involved
• Stories from people we're helping

Your first step? Reply to this email and tell me what drew you to ${idea.name}. I read every response.

Talk soon,
[Your Name]

P.S. — Know someone who should join us? Forward this email.`,
      },
      email2: {
        subject: `Why ${idea.name} matters`,
        body: `Hey,

Let me tell you why I started ${idea.name}.

${idea.problem}

I saw this firsthand, and I knew something had to change.

That's why we're building ${idea.name} — to ${idea.tagline.toLowerCase()}.

But here's the thing: we can't do this alone. Every person who joins makes a difference.

What could you contribute? Even 30 minutes of your time or sharing our story with one friend helps.

Reply and let me know how you'd like to get involved.

[Your Name]`,
      },
      email3: {
        subject: `Ready to make a difference?`,
        body: `Hey,

I'll keep this short.

${idea.name} is growing, and we need people like you.

Here are 3 ways to take action this week:

1. Share our story with one friend who cares about ${idea.audience.toLowerCase()}
2. Volunteer 30 minutes of your time (just reply to this email)
3. Follow us on social media and engage with our posts

Every small action adds up to big change.

Ready?

[Your Name]

P.S. — Hit reply and let me know which action you're taking. I'll personally respond.`,
      },
    },
    elevatorPitch: `We help ${idea.audience.toLowerCase()} by ${idea.tagline.toLowerCase()}. ${idea.problem.split('.')[0]}. ${idea.name} changes that by creating ${idea.impact.toLowerCase()}. Join us and be part of the solution.`,
  };
}
