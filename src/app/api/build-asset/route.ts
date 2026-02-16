// API route for "Build This For Me" asset generation
// Takes a task description and generates the actual asset using Claude

import { NextRequest, NextResponse } from "next/server";
import { sendMessageForJSON } from "@/lib/claude";
import { generateAssetPrompt, ASSET_SYSTEM_PROMPT } from "@/prompts/build-asset";
import type { BuildAssetRequest, GeneratedAsset, AssetType } from "@/types/assets";
import { detectAssetType } from "@/types/assets";
import type { ApiResponse } from "@/types";

interface RequestBody {
  taskDescription: string;
  assetType?: AssetType;
  idea: {
    name: string;
    tagline: string;
    problem: string;
    audience: string;
    impact: string;
    revenueModel?: string;
    causeAreas?: string[];
  };
  profile: {
    ventureType?: string;
    format?: string;
    experience?: string;
    budget?: string;
    commitment?: string;
  };
  platform?: string;
}

export async function POST(request: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    const body: RequestBody = await request.json();
    const { taskDescription, idea, profile, platform } = body;

    // Validate required fields
    if (!taskDescription || !idea || !idea.name) {
      return NextResponse.json<ApiResponse<GeneratedAsset>>({
        success: false,
        error: "Missing required fields: taskDescription or idea",
      });
    }

    // Detect asset type if not provided
    const assetType = body.assetType || detectAssetType(taskDescription);

    if (!assetType) {
      return NextResponse.json<ApiResponse<GeneratedAsset>>({
        success: false,
        error: "Could not determine asset type from task description",
      });
    }

    // Check for API key
    if (!anthropicKey) {
      console.warn("No ANTHROPIC_API_KEY set, returning mock asset");
      return NextResponse.json<ApiResponse<GeneratedAsset>>({
        success: true,
        data: getMockAsset(assetType, idea.name, taskDescription),
      });
    }

    // Build the request
    const assetRequest: BuildAssetRequest = {
      taskDescription,
      assetType,
      idea: {
        name: idea.name,
        tagline: idea.tagline || "",
        problem: idea.problem || "",
        audience: idea.audience || "",
        impact: idea.impact || "",
        revenueModel: idea.revenueModel,
        causeAreas: idea.causeAreas || [],
      },
      profile: {
        ventureType: profile.ventureType || "project",
        format: profile.format || "both",
        experience: profile.experience || "beginner",
        budget: profile.budget || "zero",
        commitment: profile.commitment || "steady",
      },
      platform,
    };

    // Generate the prompt
    const prompt = generateAssetPrompt(assetRequest);

    // Call Claude
    const asset = await sendMessageForJSON<GeneratedAsset>(prompt, {
      systemPrompt: ASSET_SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: assetType === "landing_page" ? 8000 : 4000,
    });

    return NextResponse.json<ApiResponse<GeneratedAsset>>({
      success: true,
      data: asset,
    });

  } catch (error) {
    console.error("Error generating asset:", error);
    return NextResponse.json<ApiResponse<GeneratedAsset>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate asset",
      },
      { status: 500 }
    );
  }
}

// Mock asset for development
function getMockAsset(assetType: AssetType, ideaName: string, taskDescription: string): GeneratedAsset {
  switch (assetType) {
    case "landing_page":
      return {
        type: "landing_page",
        title: `Landing Page for ${ideaName}`,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ideaName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1C1412;
      color: #FAF5F0;
      line-height: 1.6;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .hero {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #1C1412 0%, #2D1F1A 100%);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #F59E0B;
    }
    .tagline {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }
    .cta-button {
      display: inline-block;
      background: #F59E0B;
      color: #1C1412;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
    }
    .cta-button:hover { background: #D97706; }
    .section {
      padding: 3rem 2rem;
      border-bottom: 1px solid rgba(250, 245, 240, 0.1);
    }
    h2 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
      color: #F59E0B;
    }
    .features {
      display: grid;
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .feature {
      background: rgba(250, 245, 240, 0.05);
      padding: 1.5rem;
      border-radius: 0.5rem;
    }
    .feature h3 { color: #F59E0B; margin-bottom: 0.5rem; }
    footer {
      text-align: center;
      padding: 2rem;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="container">
      <h1>${ideaName}</h1>
      <p class="tagline">Making a difference in our community, one step at a time.</p>
      <a href="mailto:hello@example.com?subject=I want to get involved" class="cta-button">Get Involved</a>
    </div>
  </div>

  <div class="section">
    <div class="container">
      <h2>The Problem</h2>
      <p>Too many people in our community face challenges alone. We're changing that by connecting neighbors who want to help with neighbors who need support.</p>
    </div>
  </div>

  <div class="section">
    <div class="container">
      <h2>How It Works</h2>
      <div class="features">
        <div class="feature">
          <h3>1. Sign Up</h3>
          <p>Join our community in less than 2 minutes.</p>
        </div>
        <div class="feature">
          <h3>2. Connect</h3>
          <p>Get matched with neighbors who share your goals.</p>
        </div>
        <div class="feature">
          <h3>3. Take Action</h3>
          <p>Make a real difference in your community.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="container" style="text-align: center;">
      <h2>Ready to Join Us?</h2>
      <p style="margin-bottom: 1.5rem;">Be part of something bigger than yourself.</p>
      <a href="mailto:hello@example.com?subject=I want to get involved" class="cta-button">Get Started Today</a>
    </div>
  </div>

  <footer>
    <p>&copy; 2024 ${ideaName}. All rights reserved.</p>
  </footer>
</body>
</html>`,
        metadata: {
          filename: `${ideaName.toLowerCase().replace(/\s+/g, '-')}-landing-page.html`,
          wordCount: 150,
        },
      };

    case "social_post":
    case "volunteer_post":
      return {
        type: assetType,
        title: `Social Post for ${ideaName}`,
        content: `🌟 Exciting news from ${ideaName}!

We're looking for passionate neighbors who want to make a real difference in our community.

No experience needed — just a willingness to show up and help.

📅 First meetup: This Saturday, 10am
📍 Location: Community Center

Comment "I'm in!" below or DM me for details.

Let's do something amazing together. ✨`,
        metadata: {
          platform: "nextdoor",
          hashtags: ["community", "volunteer", "neighbors", "makeadifference"],
          wordCount: 60,
        },
      };

    case "email":
    case "partnership_email":
      return {
        type: assetType,
        title: `Email for ${ideaName}`,
        content: `Subject: Quick question about partnering on ${ideaName}

Hi [Name],

I hope this finds you well! I'm reaching out because I'm launching ${ideaName}, a community initiative focused on making a real difference in our neighborhood.

I've been following your work and think there could be a great opportunity for us to collaborate. Specifically, I'm wondering if you'd be open to:

• [Specific partnership opportunity]
• [Another way to work together]

Would you have 15 minutes for a quick call next week? I'd love to share more about what we're building and explore how we might work together.

No pressure either way — I know everyone's busy.

Best,
[Your name]

P.S. — You can learn more about ${ideaName} at [website/link].`,
        metadata: {
          subject: `Quick question about partnering on ${ideaName}`,
          wordCount: 130,
        },
      };

    case "flyer":
      return {
        type: "flyer",
        title: `Flyer for ${ideaName}`,
        content: `HEADLINE
${ideaName.toUpperCase()}

SUBHEADLINE
Join your neighbors in making a difference

KEY POINTS
• No experience needed — just show up
• Free to participate
• Meet amazing people in your community
• Make a real, visible impact

CALL TO ACTION
Join us this Saturday at 10am!

LOCATION
[Your location here]

CONTACT
Email: hello@example.com
Phone: (555) 123-4567

[QR code or signup link here]`,
        metadata: {
          filename: `${ideaName.toLowerCase().replace(/\s+/g, '-')}-flyer.txt`,
          wordCount: 75,
        },
      };

    case "pitch_script":
      return {
        type: "pitch_script",
        title: `Pitch Script for ${ideaName}`,
        content: `You know how [problem statement]?

Well, that's exactly why I started ${ideaName}.

We [simple explanation of what you do] so that [who you help] can [benefit they get].

In just [timeframe], we've already [early traction or planned milestone].

What makes us different is [unique approach].

Right now, I'm looking for [specific ask — volunteers, partners, supporters].

Would you be interested in [specific next step]?`,
        metadata: {
          wordCount: 80,
        },
      };

    case "press_release":
      return {
        type: "press_release",
        title: `Press Release for ${ideaName}`,
        content: `FOR IMMEDIATE RELEASE

${ideaName.toUpperCase()} LAUNCHES TO ADDRESS [PROBLEM] IN [LOCATION]

[City, State] — [Date] — ${ideaName}, a new community initiative, officially launches today with a mission to [mission statement].

"[Quote from founder about why this matters]," said [Your Name], founder of ${ideaName}. "[Additional quote about the vision]."

The initiative addresses a growing need in the community. [Statistics or context about the problem].

${ideaName} works by [brief explanation of how it works]. The organization is currently [current status and immediate plans].

Community members interested in getting involved can [how to participate] or visit [website].

###

About ${ideaName}
${ideaName} is a [type of organization] dedicated to [mission]. Founded in [year], the organization [brief background].

Media Contact:
[Your Name]
[Email]
[Phone]`,
        metadata: {
          filename: `${ideaName.toLowerCase().replace(/\s+/g, '-')}-press-release.txt`,
          wordCount: 200,
        },
      };

    case "grant_intro":
      return {
        type: "grant_intro",
        title: `Grant Introduction for ${ideaName}`,
        content: `Dear [Foundation Name],

I am writing to introduce ${ideaName} and explore potential funding opportunities that align with your foundation's commitment to [foundation's focus area].

THE PROBLEM
[Description of the problem your project addresses, with local context and statistics if available.]

OUR SOLUTION
${ideaName} addresses this challenge by [explanation of your approach]. Our model is unique because [differentiator].

IMPACT TO DATE
Since [launch date], we have [metrics and achievements]. Our goal for the coming year is to [specific, measurable objectives].

FUNDING REQUEST
We are seeking [amount] to support [specific use of funds]. This investment will enable us to [expected outcomes].

We would welcome the opportunity to discuss how ${ideaName} aligns with [Foundation Name]'s mission. I am available at your convenience for a call or meeting.

Thank you for your consideration.

Sincerely,

[Your Name]
[Your Title]
${ideaName}
[Contact Information]`,
        metadata: {
          filename: `${ideaName.toLowerCase().replace(/\s+/g, '-')}-grant-intro.txt`,
          wordCount: 200,
        },
      };

    default:
      return {
        type: assetType,
        title: `Content for ${ideaName}`,
        content: `Content for task: ${taskDescription}\n\nThis is placeholder content for ${ideaName}. In production, this would be generated by Claude with full context about your project.`,
        metadata: {
          wordCount: 30,
        },
      };
  }
}
