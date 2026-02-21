// API route for generating Launch Kit
// Generates landing page HTML, 4 social posts, 3-email sequence, and elevator pitch

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasDeepDiveAccess, hasLaunchKitAccess, type SubscriptionTier } from "@/lib/stripe";
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

const LAUNCH_KIT_SYSTEM_PROMPT = `You are SparkLocal's launch kit generator — a marketing expert who creates complete launch packages for social impact ventures.

Your copy is:
- Action-oriented and specific
- Empowering without being preachy
- Conversational and authentic
- Tailored to the venture type and audience

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;

// Get color scheme based on cause area
function getColorScheme(causeAreas: string[]): { name: string; colors: string; description: string } {
  const primaryCause = causeAreas?.[0] || "";

  const colorSchemes: Record<string, { name: string; colors: string; description: string }> = {
    environment: {
      name: "Nature",
      colors: "Primary: Forest green (#228B22), Accent: Earth brown (#8B4513), Background: Soft cream (#FFFEF7), Text: Dark forest (#1a3a1a)",
      description: "Earthy greens and warm browns on a light cream background"
    },
    health: {
      name: "Wellness",
      colors: "Primary: Calming teal (#008B8B), Accent: Soft coral (#FF7F7F), Background: Clean white (#FFFFFF), Text: Deep teal (#004D4D)",
      description: "Calming teals and soft corals on a clean white background"
    },
    mental_health: {
      name: "Calm",
      colors: "Primary: Peaceful lavender (#9370DB), Accent: Soft sage (#98D8AA), Background: Warm white (#FAFAFA), Text: Deep purple (#4B0082)",
      description: "Soothing lavenders and sage greens on a warm white background"
    },
    education: {
      name: "Learning",
      colors: "Primary: Warm orange (#E67E22), Accent: Sky blue (#5DADE2), Background: Cream (#FFF8E7), Text: Rich brown (#5D4037)",
      description: "Warm oranges and friendly blues on a cream background"
    },
    poverty: {
      name: "Hope",
      colors: "Primary: Hopeful gold (#DAA520), Accent: Warm terracotta (#CD5C5C), Background: Soft ivory (#FFFFF0), Text: Warm charcoal (#3D3D3D)",
      description: "Warm golds and terracotta on an ivory background"
    },
    food_security: {
      name: "Harvest",
      colors: "Primary: Fresh green (#32CD32), Accent: Harvest orange (#FF8C00), Background: Natural cream (#FFFEF5), Text: Earth brown (#4A3C31)",
      description: "Fresh greens and harvest oranges on a natural cream background"
    },
    equity: {
      name: "Unity",
      colors: "Primary: Vibrant purple (#8E44AD), Accent: Teal (#1ABC9C), Background: Light lavender (#F8F4FF), Text: Deep purple (#2C1654)",
      description: "Vibrant purples and teals on a soft lavender background"
    },
    animals: {
      name: "Nature Friend",
      colors: "Primary: Warm brown (#8B4513), Accent: Leaf green (#6B8E23), Background: Soft tan (#FFF8DC), Text: Dark brown (#3E2723)",
      description: "Warm browns and natural greens on a soft tan background"
    },
    youth: {
      name: "Bright Future",
      colors: "Primary: Bright blue (#3498DB), Accent: Sunny yellow (#F1C40F), Background: Soft white (#FEFEFE), Text: Navy (#1A237E)",
      description: "Bright blues and sunny yellows on a clean white background"
    },
    elder_care: {
      name: "Comfort",
      colors: "Primary: Warm rose (#C08081), Accent: Soft sage (#9DC183), Background: Warm cream (#FDF5E6), Text: Warm gray (#5D5D5D)",
      description: "Warm roses and soft sages on a comforting cream background"
    },
    arts: {
      name: "Creative",
      colors: "Primary: Creative magenta (#C71585), Accent: Artistic teal (#20B2AA), Background: Gallery white (#FDFDFD), Text: Deep charcoal (#2D2D2D)",
      description: "Bold magentas and artistic teals on a gallery white background"
    },
    tech_access: {
      name: "Digital",
      colors: "Primary: Tech blue (#0066CC), Accent: Innovation green (#00C853), Background: Clean white (#FFFFFF), Text: Digital gray (#333333)",
      description: "Modern blues and innovation greens on a clean white background"
    }
  };

  return colorSchemes[primaryCause] || {
    name: "Community",
    colors: "Primary: Friendly teal (#26A69A), Accent: Warm coral (#FF8A65), Background: Soft white (#FAFAFA), Text: Warm charcoal (#424242)",
    description: "Friendly teals and warm corals on a soft white background"
  };
}

function generateLaunchKitPrompt(idea: Idea, profile: UserProfile): string {
  const ventureType = profile.ventureType || "project";
  const locationContext = profile.location
    ? `\n**Location:** ${profile.location.city}, ${profile.location.state} (include local references where appropriate)`
    : "";

  // Get cause-appropriate color scheme
  const colorScheme = getColorScheme(idea.causeAreas || []);

  return `Create a complete Launch Kit for this social impact venture.

## The Venture

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}
**Impact:** ${idea.impact}
**Sustainability Model:** ${idea.revenueModel || "Volunteer-driven community project"}
**Cause Areas:** ${idea.causeAreas?.join(", ") || "community"}

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

**IMPORTANT - Color Scheme:** Use a ${colorScheme.description}.
Specific colors: ${colorScheme.colors}
DO NOT use dark backgrounds or the default amber/charcoal SparkLocal brand colors. The landing page should feel appropriate for a ${idea.causeAreas?.[0] || "community"}-focused venture.

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

    // ========================================================================
    // CREDIT/ACCESS CHECK: Verify user has paid for this Launch Kit
    // ========================================================================
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<LaunchKit>>({
        success: false,
        error: "Authentication required",
      }, { status: 401 });
    }

    // Get user's credits and purchases
    const { data: credits } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Check access using the stripe helper functions
    const tier = (credits?.subscription_tier || "free") as SubscriptionTier;
    const isActive = credits?.subscription_status === "active";
    const deepDiveCredits = credits?.deep_dive_credits_remaining || 0;
    const launchKitCredits = credits?.launch_kit_credits_remaining || 0;
    const purchases = credits?.one_time_purchases || [];

    // For subscriptions, must be active
    const effectiveTier = isActive ? tier : "free";

    // First check if they have deep dive access (required for launch kit)
    const canAccessDeepDive = hasDeepDiveAccess(
      effectiveTier,
      deepDiveCredits,
      purchases,
      idea.id
    );

    // Then check launch kit access
    const canAccessLaunchKit = hasLaunchKitAccess(
      effectiveTier,
      launchKitCredits,
      purchases,
      idea.id,
      canAccessDeepDive
    );

    if (!canAccessLaunchKit) {
      return NextResponse.json<ApiResponse<LaunchKit>>({
        success: false,
        error: "Payment required. Please purchase the Launch Kit add-on or subscribe to access.",
      }, { status: 403 });
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
  // Get colors based on cause area
  const colorScheme = getColorScheme(idea.causeAreas || []);
  const colors = colorScheme.colors;

  // Parse some basic colors from the scheme (simple extraction)
  const primaryMatch = colors.match(/Primary: [^(]+\(([^)]+)\)/);
  const accentMatch = colors.match(/Accent: [^(]+\(([^)]+)\)/);
  const bgMatch = colors.match(/Background: [^(]+\(([^)]+)\)/);
  const textMatch = colors.match(/Text: [^(]+\(([^)]+)\)/);

  const primary = primaryMatch?.[1] || "#26A69A";
  const accent = accentMatch?.[1] || "#FF8A65";
  const bg = bgMatch?.[1] || "#FAFAFA";
  const text = textMatch?.[1] || "#424242";

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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${bg}; color: ${text}; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .hero { text-align: center; padding: 4rem 0; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; color: ${primary}; }
    .subtitle { font-size: 1.25rem; color: ${text}; opacity: 0.8; margin-bottom: 2rem; }
    .cta { display: inline-block; background: ${primary}; color: white; padding: 1rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
    .cta:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
    .section { padding: 3rem 0; border-top: 1px solid rgba(0,0,0,0.1); }
    .section h2 { font-size: 1.5rem; margin-bottom: 1rem; color: ${primary}; }
    ul { list-style: none; }
    li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
    li::before { content: "✓"; position: absolute; left: 0; color: ${accent}; font-weight: bold; }
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
    elevatorPitch: `We help ${idea.audience.toLowerCase()} by ${idea.tagline.toLowerCase()}. ${idea.problem.split('.')[0]}. ${idea.name} changes that by ${idea.impact ? `creating ${idea.impact.toLowerCase()}` : idea.valueProposition || 'delivering real value'}. Join us and be part of the solution.`,
  };
}
