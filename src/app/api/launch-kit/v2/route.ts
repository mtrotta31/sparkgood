// Launch Kit V2 API Route
// Generates professional assets: pitch deck (PPTX), social graphics (PNG), and text content
// Phase 1: Pitch Deck + Social Graphics + Text Content
// Future: Landing Page + One-Pager PDF

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasDeepDiveAccess, hasLaunchKitAccess, type SubscriptionTier } from "@/lib/stripe";
import { sendMessageForJSON } from "@/lib/claude";
import {
  generatePitchDeck,
  generateSocialGraphics,
  type DeepDiveData,
  type LaunchKitAssets,
} from "@/lib/launch-kit";
import type {
  UserProfile,
  Idea,
  LaunchKit,
  ApiResponse,
  BusinessFoundationData,
  GrowthPlanData,
  FinancialModelData,
  LaunchChecklistData,
  LocalResourcesData,
} from "@/types";

// Extended response type for V2
interface LaunchKitV2Response {
  textContent: LaunchKit; // Original text content (social posts, emails, elevator pitch)
  assets: LaunchKitAssets; // New file-based assets
  downloadUrls: {
    pitchDeck?: string;
    socialGraphics?: {
      instagramPost?: string;
      instagramStory?: string;
      linkedinPost?: string;
      facebookCover?: string;
    };
  };
}

interface LaunchKitV2Request {
  idea: Idea;
  profile: UserProfile;
  savedIdeaId: string; // Required to fetch deep dive data
  // Optional: pass deep dive data directly to avoid extra fetch
  foundation?: BusinessFoundationData;
  growth?: GrowthPlanData;
  financial?: FinancialModelData;
  checklist?: LaunchChecklistData;
  matchedResources?: LocalResourcesData;
}

const STORAGE_BUCKET = "launch-kit-assets";

const LAUNCH_KIT_SYSTEM_PROMPT = `You are SparkLocal's launch kit generator — a marketing expert who creates complete launch packages for businesses.

Your copy is:
- Action-oriented and specific
- Professional yet approachable
- Tailored to the business type and audience

CRITICAL: You must respond with ONLY a valid JSON object. No explanation text before or after. No markdown code blocks. Just the raw JSON object starting with { and ending with }.`;

export async function POST(request: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    const body = await request.json();
    const {
      idea,
      profile,
      savedIdeaId,
      foundation: providedFoundation,
      growth: providedGrowth,
      financial: providedFinancial,
      checklist: providedChecklist,
      matchedResources: providedResources,
    } = body as LaunchKitV2Request;

    // Validate required fields
    if (!idea || !profile || !savedIdeaId) {
      return NextResponse.json<ApiResponse<LaunchKitV2Response>>({
        success: false,
        error: "Missing required fields: idea, profile, or savedIdeaId",
      });
    }

    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<LaunchKitV2Response>>({
        success: false,
        error: "Authentication required",
      }, { status: 401 });
    }

    // Credit/access check
    const { data: credits } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const tier = (credits?.subscription_tier || "free") as SubscriptionTier;
    const isActive = credits?.subscription_status === "active";
    const deepDiveCredits = credits?.deep_dive_credits_remaining || 0;
    const launchKitCredits = credits?.launch_kit_credits_remaining || 0;
    const purchases = credits?.one_time_purchases || [];
    const effectiveTier = isActive ? tier : "free";

    const canAccessDeepDive = hasDeepDiveAccess(
      effectiveTier,
      deepDiveCredits,
      purchases,
      idea.id
    );

    const canAccessLaunchKit = hasLaunchKitAccess(
      effectiveTier,
      launchKitCredits,
      purchases,
      idea.id,
      canAccessDeepDive
    );

    if (!canAccessLaunchKit) {
      return NextResponse.json<ApiResponse<LaunchKitV2Response>>({
        success: false,
        error: "Payment required. Please purchase the Launch Kit or subscribe to access.",
      }, { status: 403 });
    }

    // Fetch deep dive data if not provided
    let foundation = providedFoundation;
    let growth = providedGrowth;
    let financial = providedFinancial;
    let checklist = providedChecklist;
    let matchedResources = providedResources;

    if (!foundation || !growth || !financial) {
      const { data: deepDiveData } = await supabase
        .from("deep_dive_results")
        .select("foundation, growth, financial, checklist, matched_resources")
        .eq("idea_id", savedIdeaId)
        .single();

      if (deepDiveData) {
        foundation = foundation || deepDiveData.foundation;
        growth = growth || deepDiveData.growth;
        financial = financial || deepDiveData.financial;
        checklist = checklist || deepDiveData.checklist;
        matchedResources = matchedResources || deepDiveData.matched_resources;
      }
    }

    // Prepare deep dive data for generators
    const deepDiveData: DeepDiveData = {
      idea,
      profile,
      foundation: foundation || null,
      growth: growth || null,
      financial: financial || null,
      checklist: checklist || null,
      matchedResources: matchedResources || null,
    };

    // Generate all assets in parallel
    const [textContent, pitchDeckBuffer, socialGraphics] = await Promise.all([
      // Generate text content (social posts, emails, elevator pitch)
      anthropicKey
        ? generateTextContent(idea, profile)
        : getMockTextContent(idea),
      // Generate pitch deck PPTX
      generatePitchDeck(deepDiveData),
      // Generate social media graphics
      generateSocialGraphics(deepDiveData),
    ]);

    // Upload assets to Supabase Storage
    const storagePath = `${savedIdeaId}`;

    // Initialize assets record
    const assets: LaunchKitAssets = {
      generatedAt: new Date().toISOString(),
    };

    const downloadUrls: LaunchKitV2Response["downloadUrls"] = {};

    // Upload pitch deck
    const pitchDeckPath = `${storagePath}/pitch-deck.pptx`;
    const { error: pitchDeckError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(pitchDeckPath, pitchDeckBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        upsert: true,
      });

    if (!pitchDeckError) {
      assets.pitchDeck = { storagePath: pitchDeckPath };
      const { data: pitchDeckUrl } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(pitchDeckPath);
      downloadUrls.pitchDeck = pitchDeckUrl.publicUrl;
    } else {
      console.error("Error uploading pitch deck:", pitchDeckError);
    }

    // Upload social graphics
    assets.socialGraphics = {};
    downloadUrls.socialGraphics = {};

    for (const graphic of socialGraphics) {
      const graphicPath = `${storagePath}/${graphic.name}`;
      const { error: graphicError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(graphicPath, graphic.buffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (!graphicError) {
        // Map platform names to asset keys
        const keyMap: Record<string, keyof NonNullable<LaunchKitAssets["socialGraphics"]>> = {
          "instagram-post": "instagramPost",
          "instagram-story": "instagramStory",
          "linkedin-post": "linkedinPost",
          "facebook-cover": "facebookCover",
        };

        const assetKey = keyMap[graphic.platform];
        if (assetKey) {
          assets.socialGraphics[assetKey] = { storagePath: graphicPath };

          const { data: graphicUrl } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(graphicPath);
          downloadUrls.socialGraphics![assetKey] = graphicUrl.publicUrl;
        }
      } else {
        console.error(`Error uploading ${graphic.name}:`, graphicError);
      }
    }

    // Save asset references to database
    await supabase
      .from("deep_dive_results")
      .update({ launch_kit_assets: assets })
      .eq("idea_id", savedIdeaId);

    return NextResponse.json<ApiResponse<LaunchKitV2Response>>({
      success: true,
      data: {
        textContent,
        assets,
        downloadUrls,
      },
    });
  } catch (error) {
    console.error("Error generating launch kit v2:", error);
    return NextResponse.json<ApiResponse<LaunchKitV2Response>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate launch kit",
      },
      { status: 500 }
    );
  }
}

// Generate text content using Claude
async function generateTextContent(idea: Idea, profile: UserProfile): Promise<LaunchKit> {
  const locationContext = profile.location
    ? `${profile.location.city}, ${profile.location.state}`
    : "";

  const prompt = `Create marketing copy for this business:

**Name:** ${idea.name}
**Tagline:** ${idea.tagline}
**Problem:** ${idea.problem}
**Audience:** ${idea.audience}
**Business Category:** ${profile.businessCategory || "general"}
${locationContext ? `**Location:** ${locationContext}` : ""}

Generate:
1. A simple landing page HTML (inline styles, no dependencies)
2. Social media posts for LinkedIn, Twitter/X, Instagram, and Nextdoor
3. A 3-email welcome sequence
4. A 30-second elevator pitch

Return as JSON:
{
  "landingPage": { "html": "...", "headline": "...", "subheadline": "..." },
  "socialPosts": {
    "linkedin": { "platform": "linkedin", "content": "...", "hashtags": [] },
    "twitter": { "platform": "twitter", "content": "...", "hashtags": [] },
    "instagram": { "platform": "instagram", "content": "...", "hashtags": [] },
    "nextdoor": { "platform": "nextdoor", "content": "...", "hashtags": [] }
  },
  "emailSequence": {
    "email1": { "subject": "...", "body": "..." },
    "email2": { "subject": "...", "body": "..." },
    "email3": { "subject": "...", "body": "..." }
  },
  "elevatorPitch": "..."
}`;

  return sendMessageForJSON<LaunchKit>(prompt, {
    systemPrompt: LAUNCH_KIT_SYSTEM_PROMPT,
    temperature: 0.8,
    maxTokens: 6000,
  });
}

// Mock text content for development
function getMockTextContent(idea: Idea): LaunchKit {
  return {
    landingPage: {
      html: `<!DOCTYPE html><html><head><title>${idea.name}</title></head><body><h1>${idea.name}</h1><p>${idea.tagline}</p></body></html>`,
      headline: idea.name,
      subheadline: idea.tagline,
    },
    socialPosts: {
      linkedin: {
        platform: "linkedin",
        content: `Excited to announce ${idea.name}! ${idea.tagline}`,
        hashtags: ["Launch", "Business"],
      },
      twitter: {
        platform: "twitter",
        content: `${idea.name} is live! ${idea.tagline}`,
        hashtags: ["Launch"],
      },
      instagram: {
        platform: "instagram",
        content: `Big news! ${idea.name} is here. ${idea.tagline}`,
        hashtags: ["Launch", "NewBusiness"],
      },
      nextdoor: {
        platform: "nextdoor",
        content: `Hey neighbors! Check out ${idea.name}. ${idea.tagline}`,
        hashtags: [],
      },
    },
    emailSequence: {
      email1: {
        subject: `Welcome to ${idea.name}!`,
        body: `Thanks for joining ${idea.name}. ${idea.tagline}`,
      },
      email2: {
        subject: `Why ${idea.name} matters`,
        body: `${idea.problem} That's why we built ${idea.name}.`,
      },
      email3: {
        subject: `Take the next step with ${idea.name}`,
        body: `Ready to get started? ${idea.tagline}`,
      },
    },
    elevatorPitch: `${idea.name} helps ${idea.audience} by addressing ${idea.problem.split(".")[0]}. ${idea.tagline}`,
  };
}

// GET endpoint to fetch existing assets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const savedIdeaId = searchParams.get("savedIdeaId");

  if (!savedIdeaId) {
    return NextResponse.json({ success: false, error: "savedIdeaId required" });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("deep_dive_results")
    .select("launch_kit_assets")
    .eq("idea_id", savedIdeaId)
    .single();

  if (error || !data?.launch_kit_assets) {
    return NextResponse.json({ success: false, error: "No launch kit found" });
  }

  // Generate download URLs for existing assets
  const assets = data.launch_kit_assets as LaunchKitAssets;
  const downloadUrls: LaunchKitV2Response["downloadUrls"] = {};

  if (assets.pitchDeck?.storagePath) {
    const { data: url } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(assets.pitchDeck.storagePath);
    downloadUrls.pitchDeck = url.publicUrl;
  }

  if (assets.socialGraphics) {
    downloadUrls.socialGraphics = {};
    for (const [key, value] of Object.entries(assets.socialGraphics)) {
      if (value?.storagePath) {
        const { data: url } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(value.storagePath);
        downloadUrls.socialGraphics[key as keyof typeof downloadUrls.socialGraphics] = url.publicUrl;
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: { assets, downloadUrls },
  });
}
