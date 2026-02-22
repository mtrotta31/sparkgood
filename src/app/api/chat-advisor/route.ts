// API Route: AI Advisor Chat
// POST - Send message and get streaming response

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type {
  UserProfile,
  Idea,
  LaunchChecklistData,
  BusinessFoundationData,
  GrowthPlanData,
  FinancialModelData,
  LocalResourcesData,
  AdvisorMessage,
} from "@/types";

const MAX_MESSAGES_PER_PROJECT = 20;

interface ChatRequest {
  projectId: string;
  message: string;
  conversationHistory: AdvisorMessage[];
}

function formatProfile(profile: UserProfile): string {
  const parts: string[] = [];

  if (profile.businessCategory) {
    parts.push(`Business Category: ${profile.businessCategory.replace(/_/g, " ")}`);
  }
  if (profile.location) {
    parts.push(`Location: ${profile.location.city}, ${profile.location.state}`);
  }
  if (profile.budget) {
    const budgetMap: Record<string, string> = {
      zero: "$0 (bootstrapping)",
      low: "$100-500",
      medium: "$500-2,000",
      high: "$2,000+",
    };
    parts.push(`Budget: ${budgetMap[profile.budget] || profile.budget}`);
  }
  if (profile.experience) {
    const expMap: Record<string, string> = {
      beginner: "Beginner (first business)",
      some: "Some experience",
      experienced: "Experienced entrepreneur",
    };
    parts.push(`Experience Level: ${expMap[profile.experience] || profile.experience}`);
  }
  if (profile.keySkills && profile.keySkills.length > 0) {
    parts.push(`Key Skills: ${profile.keySkills.map(s => s.replace(/_/g, " ")).join(", ")}`);
  }
  if (profile.commitment) {
    const commitMap: Record<string, string> = {
      weekend: "Weekend warrior (5-10 hrs/week)",
      steady: "Steady effort (10-20 hrs/week)",
      all_in: "All in (full-time)",
    };
    parts.push(`Time Commitment: ${commitMap[profile.commitment] || profile.commitment}`);
  }
  if (profile.targetCustomer) {
    const targetMap: Record<string, string> = {
      b2b: "B2B (selling to businesses)",
      b2c: "B2C (selling to consumers)",
      b2g: "B2G (selling to government)",
      other: "Other",
    };
    parts.push(`Target Customer: ${targetMap[profile.targetCustomer] || profile.targetCustomer}`);
  }
  if (profile.businessModelPreference) {
    parts.push(`Business Model: ${profile.businessModelPreference}`);
  }

  return parts.join("\n");
}

function formatChecklist(checklist: LaunchChecklistData): string {
  return checklist.weeks
    .map(
      (week) =>
        `Week ${week.weekNumber}: ${week.title}\n${week.items
          .map(
            (item) =>
              `  - ${item.title} (${item.priority}, ${item.estimatedTime}, ${item.estimatedCost})`
          )
          .join("\n")}`
    )
    .join("\n\n");
}

function formatFoundation(foundation: BusinessFoundationData): string {
  const parts: string[] = [];

  parts.push(`MARKET VIABILITY SCORE: ${foundation.marketViability.overallScore}/100`);
  parts.push(
    `Score Breakdown:\n${foundation.marketViability.scoreBreakdown
      .map((s) => `  - ${s.factor}: ${s.score}/100 - ${s.assessment}`)
      .join("\n")}`
  );

  if (foundation.marketViability.marketResearch) {
    const mr = foundation.marketViability.marketResearch;
    parts.push(`\nMARKET RESEARCH:`);
    parts.push(`  TAM: ${mr.tam}`);
    parts.push(`  SAM: ${mr.sam}`);
    parts.push(`  SOM: ${mr.som}`);
    parts.push(`  Growth Rate: ${mr.growthRate}`);
    if (mr.trends?.length) parts.push(`  Trends: ${mr.trends.join(", ")}`);
    if (mr.risks?.length) parts.push(`  Risks: ${mr.risks.join(", ")}`);
  }

  if (foundation.marketViability.competitorAnalysis?.length) {
    parts.push(`\nCOMPETITORS:`);
    foundation.marketViability.competitorAnalysis.forEach((c) => {
      parts.push(`  - ${c.name} (${c.url})`);
      parts.push(`    Pricing: ${c.pricing}, Positioning: ${c.positioning}`);
      parts.push(`    Weakness: ${c.weakness}`);
    });
  }

  if (foundation.legalStructure) {
    parts.push(`\nLEGAL STRUCTURE:`);
    parts.push(`  Recommended: ${foundation.legalStructure.recommendedStructure}`);
    parts.push(`  Cost: ${foundation.legalStructure.estimatedCost}`);
    if (foundation.legalStructure.licensesRequired?.length) {
      parts.push(`  Licenses: ${foundation.legalStructure.licensesRequired.join(", ")}`);
    }
  }

  if (foundation.startupCosts?.length) {
    parts.push(`\nSTARTUP COSTS:`);
    foundation.startupCosts.forEach((c) => {
      parts.push(`  - ${c.item}: ${c.cost} (${c.priority}) - ${c.notes}`);
    });
  }

  if (foundation.techStack) {
    parts.push(`\nTECH STACK:`);
    parts.push(`  ${foundation.techStack.recommendation}`);
    foundation.techStack.tools?.forEach((t) => {
      parts.push(`  - ${t.name}: ${t.purpose} (${t.cost})`);
    });
  }

  return parts.join("\n");
}

function formatGrowthPlan(growth: GrowthPlanData): string {
  const parts: string[] = [];

  parts.push(`ELEVATOR PITCH:\n${growth.elevatorPitch}`);

  if (growth.landingPageCopy) {
    parts.push(`\nLANDING PAGE COPY:`);
    parts.push(`  Headline: ${growth.landingPageCopy.headline}`);
    parts.push(`  Subheadline: ${growth.landingPageCopy.subheadline}`);
    parts.push(`  CTA: ${growth.landingPageCopy.ctaButtonText}`);
  }

  if (growth.socialMediaPosts?.length) {
    parts.push(`\nSOCIAL MEDIA POSTS:`);
    growth.socialMediaPosts.forEach((p) => {
      parts.push(`  - ${p.platform}: ${p.caption.substring(0, 100)}...`);
    });
  }

  if (growth.emailTemplates?.length) {
    parts.push(`\nEMAIL TEMPLATES:`);
    growth.emailTemplates.forEach((e) => {
      parts.push(`  - ${e.type}: "${e.subject}"`);
    });
  }

  if (growth.localMarketing?.length) {
    parts.push(`\nLOCAL MARKETING:`);
    growth.localMarketing.forEach((m) => {
      parts.push(`  - ${m.tactic}: ${m.details}`);
    });
  }

  return parts.join("\n");
}

function formatFinancial(financial: FinancialModelData): string {
  const parts: string[] = [];

  if (financial.startupCostsSummary?.length) {
    parts.push(`STARTUP COSTS SUMMARY:`);
    financial.startupCostsSummary.forEach((c) => {
      parts.push(`  - ${c.item}: ${c.cost || c.monthlyCost} - ${c.notes}`);
    });
  }

  if (financial.monthlyOperatingCosts?.length) {
    parts.push(`\nMONTHLY OPERATING COSTS:`);
    financial.monthlyOperatingCosts.forEach((c) => {
      parts.push(`  - ${c.item}: ${c.monthlyCost}/month - ${c.notes}`);
    });
  }

  if (financial.revenueProjections) {
    parts.push(`\nREVENUE PROJECTIONS:`);
    const { conservative, moderate, aggressive } = financial.revenueProjections;
    parts.push(
      `  Conservative: ${conservative.monthlyCustomers} customers @ $${conservative.averageOrder} = $${conservative.monthlyRevenue}/month, profit: $${conservative.monthlyProfit}, break-even: ${conservative.breakEvenMonth}`
    );
    parts.push(
      `  Moderate: ${moderate.monthlyCustomers} customers @ $${moderate.averageOrder} = $${moderate.monthlyRevenue}/month, profit: $${moderate.monthlyProfit}, break-even: ${moderate.breakEvenMonth}`
    );
    parts.push(
      `  Aggressive: ${aggressive.monthlyCustomers} customers @ $${aggressive.averageOrder} = $${aggressive.monthlyRevenue}/month, profit: $${aggressive.monthlyProfit}, break-even: ${aggressive.breakEvenMonth}`
    );
  }

  if (financial.breakEvenAnalysis) {
    parts.push(`\nBREAK-EVEN ANALYSIS:`);
    parts.push(`  Units needed: ${financial.breakEvenAnalysis.unitsNeeded}`);
    parts.push(`  ${financial.breakEvenAnalysis.description}`);
  }

  if (financial.pricingStrategy) {
    parts.push(`\nPRICING STRATEGY:`);
    parts.push(`  Recommended: ${financial.pricingStrategy.recommendedPrice}`);
    parts.push(`  Reasoning: ${financial.pricingStrategy.reasoning}`);
  }

  return parts.join("\n");
}

function formatResources(resources: LocalResourcesData): string {
  const parts: string[] = [];

  parts.push(`MATCHED LOCAL RESOURCES (${resources.cityName}, ${resources.state}):`);
  parts.push(`Total: ${resources.totalMatched} resources matched`);

  if (resources.grants?.length) {
    parts.push(`\nGRANTS:`);
    resources.grants.forEach((r) => {
      parts.push(`  - ${r.name}${r.amountRange ? ` (${r.amountRange})` : ""}`);
      parts.push(`    ${r.relevanceNote}`);
      if (r.deadline) parts.push(`    Deadline: ${r.deadline}`);
    });
  }

  if (resources.accelerators?.length) {
    parts.push(`\nACCELERATORS:`);
    resources.accelerators.forEach((r) => {
      parts.push(`  - ${r.name}${r.fundingAmount ? ` (${r.fundingAmount})` : ""}`);
      parts.push(`    ${r.relevanceNote}`);
    });
  }

  if (resources.coworking?.length) {
    parts.push(`\nCOWORKING SPACES:`);
    resources.coworking.forEach((r) => {
      parts.push(
        `  - ${r.name}${r.priceRange ? ` (${r.priceRange})` : ""}${r.rating ? ` - ${r.rating}★` : ""}`
      );
      parts.push(`    ${r.relevanceNote}`);
    });
  }

  if (resources.sba?.length) {
    parts.push(`\nSBA RESOURCES:`);
    resources.sba.forEach((r) => {
      parts.push(`  - ${r.name}${r.isFree ? " (Free)" : ""}`);
      parts.push(`    ${r.relevanceNote}`);
      if (r.services?.length) parts.push(`    Services: ${r.services.join(", ")}`);
    });
  }

  return parts.join("\n");
}

function buildSystemPrompt(
  idea: Idea,
  profile: UserProfile,
  checklist: LaunchChecklistData | null,
  foundation: BusinessFoundationData | null,
  growth: GrowthPlanData | null,
  financial: FinancialModelData | null,
  resources: LocalResourcesData | null
): string {
  const parts: string[] = [];

  parts.push(`You are the SparkLocal Business Advisor — a practical, knowledgeable business consultant helping a user launch their specific business. You have full context on their plan and should reference it naturally in conversation.

PERSONA:
- Be practical and specific, not generic
- Reference their actual plan, city, budget, and resources by name
- Help with implementation: draft emails, explain legal steps, troubleshoot problems
- Keep responses concise and actionable (2-4 paragraphs max unless they ask for detail)
- Use their business name and details naturally
- When they ask "how do I do X", give step-by-step instructions they can follow right now
- If something is outside your knowledge, be honest and suggest where to find the answer

==============================
THEIR BUSINESS
==============================
Name: ${idea.name}
Tagline: ${idea.tagline}
Problem: ${idea.problem}
Audience: ${idea.audience}
Revenue Model: ${idea.revenueModel || "Not specified"}
${idea.valueProposition ? `Value Proposition: ${idea.valueProposition}` : ""}
${idea.competitiveAdvantage ? `Competitive Advantage: ${idea.competitiveAdvantage}` : ""}

==============================
USER PROFILE
==============================
${formatProfile(profile)}
`);

  if (checklist) {
    parts.push(`
==============================
THEIR LAUNCH CHECKLIST
==============================
${formatChecklist(checklist)}
`);
  }

  if (foundation) {
    parts.push(`
==============================
THEIR BUSINESS FOUNDATION
==============================
${formatFoundation(foundation)}
`);
  }

  if (growth) {
    parts.push(`
==============================
THEIR GROWTH PLAN
==============================
${formatGrowthPlan(growth)}
`);
  }

  if (financial) {
    parts.push(`
==============================
THEIR FINANCIAL MODEL
==============================
${formatFinancial(financial)}
`);
  }

  if (resources) {
    parts.push(`
==============================
${formatResources(resources)}
`);
  }

  parts.push(`
==============================
INSTRUCTIONS
==============================
- Always give specific, actionable advice tailored to their situation
- Reference their plan, location, budget, and matched resources when relevant
- When they ask "how do I do X", give step-by-step instructions they can follow right now
- You can help them: draft emails, refine their pitch, prepare for meetings, understand legal requirements, troubleshoot business problems, write copy, and plan next steps
- Keep responses practical and concise — they're trying to launch a business, not read an essay
- Use their business name "${idea.name}" and details naturally in conversation
- If they ask about applying for a specific grant or resource, use the matched resources information
- For legal questions specific to their state (${profile.location?.state || "their state"}), remind them to verify with official sources but give them practical starting points`);

  return parts.join("\n");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { projectId, message, conversationHistory } = (await request.json()) as ChatRequest;

    if (!projectId || !message) {
      return NextResponse.json(
        { success: false, error: "Project ID and message are required" },
        { status: 400 }
      );
    }

    // Get the project (saved idea) and verify ownership
    const { data: project, error: projectError } = await supabase
      .from("saved_ideas")
      .select("id, idea_data, profile_id, user_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Get deep dive results for this project
    const { data: deepDive } = await supabase
      .from("deep_dive_results")
      .select("*")
      .eq("idea_id", projectId)
      .single();

    // Check user subscription status
    const { data: userCredits } = await supabase
      .from("user_credits")
      .select("subscription_tier, subscription_status")
      .eq("user_id", user.id)
      .single();

    // Subscribers with active Spark or Ignite plans get unlimited messages
    const hasUnlimitedAccess =
      userCredits?.subscription_status === "active" &&
      (userCredits?.subscription_tier === "spark" || userCredits?.subscription_tier === "ignite");

    // Check message limit (bypass for subscribers)
    const currentCount = deepDive?.advisor_message_count || 0;
    if (!hasUnlimitedAccess && currentCount >= MAX_MESSAGES_PER_PROJECT) {
      return NextResponse.json(
        {
          success: false,
          error: "Message limit reached",
          limitReached: true,
          messageCount: currentCount,
          maxMessages: MAX_MESSAGES_PER_PROJECT,
          hasUnlimitedAccess: false,
        },
        { status: 403 }
      );
    }

    // Get user profile
    let profile: UserProfile | null = null;
    if (project.profile_id) {
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", project.profile_id)
        .single();

      if (profileData) {
        profile = {
          businessCategory: profileData.business_category,
          targetCustomer: profileData.target_customer,
          businessModelPreference: profileData.business_model_preference,
          keySkills: profileData.key_skills || [],
          ventureType: profileData.venture_type,
          causes: profileData.causes || [],
          format: profileData.format,
          location: profileData.location
            ? { city: profileData.location.city, state: profileData.location.state }
            : null,
          experience: profileData.experience,
          budget: profileData.budget,
          commitment: profileData.commitment,
          depth: profileData.depth,
          hasIdea: profileData.has_idea,
          ownIdea: profileData.own_idea || "",
        };
      }
    }

    // Default profile if none found
    if (!profile) {
      profile = {
        businessCategory: null,
        targetCustomer: null,
        businessModelPreference: null,
        keySkills: [],
        ventureType: null,
        causes: [],
        format: null,
        location: null,
        experience: null,
        budget: null,
        commitment: null,
        depth: null,
        hasIdea: null,
        ownIdea: "",
      };
    }

    const idea = project.idea_data as Idea;

    // Build system prompt with all context
    const systemPrompt = buildSystemPrompt(
      idea,
      profile,
      deepDive?.checklist || null,
      deepDive?.foundation || null,
      deepDive?.growth || null,
      deepDive?.financial || null,
      deepDive?.matched_resources || null
    );

    // Build messages array for Claude
    const messages: { role: "user" | "assistant"; content: string }[] = [];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add the new user message
    messages.push({
      role: "user",
      content: message,
    });

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });

    // Create streaming response
    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
      stream: true,
    });

    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Save messages to database after completion
          const { error: userMsgError } = await supabase.from("advisor_messages").insert({
            project_id: projectId,
            user_id: user.id,
            role: "user",
            content: message,
          });

          if (userMsgError) {
            console.error("Error saving user message:", userMsgError);
          }

          const { error: assistantMsgError } = await supabase
            .from("advisor_messages")
            .insert({
              project_id: projectId,
              user_id: user.id,
              role: "assistant",
              content: fullResponse,
            });

          if (assistantMsgError) {
            console.error("Error saving assistant message:", assistantMsgError);
          }

          // Increment message count
          if (deepDive) {
            await supabase
              .from("deep_dive_results")
              .update({ advisor_message_count: currentCount + 1 })
              .eq("id", deepDive.id);
          } else {
            // Create deep dive record if it doesn't exist
            await supabase.from("deep_dive_results").insert({
              user_id: user.id,
              idea_id: projectId,
              advisor_message_count: 1,
            });
          }

          // Send done signal with message count
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                messageCount: currentCount + 1,
                maxMessages: MAX_MESSAGES_PER_PROJECT,
                hasUnlimitedAccess,
              })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Streaming error" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat advisor error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Load previous messages for a project
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID required" },
        { status: 400 }
      );
    }

    // Get messages for this project
    const { data: messages, error: messagesError } = await supabase
      .from("advisor_messages")
      .select("id, role, content, created_at")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error loading messages:", messagesError);
      return NextResponse.json(
        { success: false, error: "Failed to load messages" },
        { status: 500 }
      );
    }

    // Get message count from deep dive results
    const { data: deepDive } = await supabase
      .from("deep_dive_results")
      .select("advisor_message_count")
      .eq("idea_id", projectId)
      .single();

    // Check user subscription status
    const { data: userCredits } = await supabase
      .from("user_credits")
      .select("subscription_tier, subscription_status")
      .eq("user_id", user.id)
      .single();

    // Subscribers with active Spark or Ignite plans get unlimited messages
    const hasUnlimitedAccess =
      userCredits?.subscription_status === "active" &&
      (userCredits?.subscription_tier === "spark" || userCredits?.subscription_tier === "ignite");

    const messageCount = deepDive?.advisor_message_count || 0;

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        messageCount,
        maxMessages: MAX_MESSAGES_PER_PROJECT,
        hasUnlimitedAccess,
        limitReached: !hasUnlimitedAccess && messageCount >= MAX_MESSAGES_PER_PROJECT,
      },
    });
  } catch (error) {
    console.error("Load messages error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
