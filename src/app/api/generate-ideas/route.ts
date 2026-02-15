// API route for idea generation
// Takes user profile and generates 4 social impact ideas using Claude

import { NextRequest, NextResponse } from "next/server";
import { sendMessageForJSON } from "@/lib/claude";
import { generateIdeaPrompt, SYSTEM_PROMPT } from "@/prompts/idea-generation";
import type { UserProfile, Idea, ApiResponse } from "@/types";

// Raw idea format from Claude (before we add IDs)
interface RawIdea {
  id?: string;
  name: string;
  tagline: string;
  problem: string;
  audience: string;
  mechanism: string;
  sustainability: string;
  impact: string;
  whyNow: string;
  firstStep: string;
}

// Transform raw ideas into our Idea type
function transformIdeas(rawIdeas: RawIdea[], profile: UserProfile): Idea[] {
  return rawIdeas.map((raw, index) => ({
    id: raw.id || `idea-${Date.now()}-${index}`,
    name: raw.name,
    tagline: raw.tagline,
    problem: raw.problem,
    audience: raw.audience,
    // Map the raw fields to our Idea type
    revenueModel:
      profile.ventureType === "project" ? null : raw.sustainability,
    impact: raw.impact,
    causeAreas: profile.causes,
    // Store additional fields as part of the idea for later use
    mechanism: raw.mechanism,
    whyNow: raw.whyNow,
    firstStep: raw.firstStep,
  })) as (Idea & { mechanism: string; whyNow: string; firstStep: string })[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse the user profile from the request body
    const body = await request.json();
    const profile = body.profile as UserProfile;

    // Validate required fields
    if (!profile || !profile.ventureType || profile.causes.length === 0) {
      return NextResponse.json<ApiResponse<Idea[]>>({
        success: false,
        error: "Missing required profile fields",
      });
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return mock data for development if no API key
      console.warn("No ANTHROPIC_API_KEY set, returning mock ideas");
      return NextResponse.json<ApiResponse<Idea[]>>({
        success: true,
        data: getMockIdeas(profile),
      });
    }

    // Generate the prompt
    const prompt = generateIdeaPrompt(profile);

    // Call Claude API
    const rawIdeas = await sendMessageForJSON<RawIdea[]>(prompt, {
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.8, // Slightly higher for creativity
      maxTokens: 4096,
    });

    // Validate we got 4 ideas
    if (!Array.isArray(rawIdeas) || rawIdeas.length < 1) {
      throw new Error("Invalid response format from Claude");
    }

    // Transform to our Idea type
    const ideas = transformIdeas(rawIdeas.slice(0, 4), profile);

    return NextResponse.json<ApiResponse<typeof ideas>>({
      success: true,
      data: ideas,
    });
  } catch (error) {
    console.error("Error generating ideas:", error);
    return NextResponse.json<ApiResponse<Idea[]>>(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate ideas",
      },
      { status: 500 }
    );
  }
}

// Mock ideas for development when API key is not set
function getMockIdeas(profile: UserProfile): (Idea & { mechanism: string; whyNow: string; firstStep: string })[] {
  // Return different ideas based on commitment level
  if (profile.commitment === "weekend") {
    return getWeekendWarriorIdeas(profile);
  } else if (profile.commitment === "steady") {
    return getSteadyBuilderIdeas(profile);
  } else {
    return getAllInIdeas(profile);
  }
}

// Simple, actionable ideas for Weekend Warriors
function getWeekendWarriorIdeas(profile: UserProfile): (Idea & { mechanism: string; whyNow: string; firstStep: string })[] {
  return [
    {
      id: "mock-1",
      name: "Monthly Park Cleanup",
      tagline: "One Saturday a month, one cleaner park",
      problem:
        "Local parks accumulate litter and debris, but most people feel too busy or isolated to do anything about it.",
      audience:
        "Neighbors who walk through the park and wish it looked better — families, dog walkers, joggers.",
      revenueModel: null,
      impact:
        "A visibly cleaner park, stronger neighbor connections, and kids seeing adults take action for their community.",
      causeAreas: profile.causes,
      mechanism: "Pick a park, pick a Saturday (first Saturday of each month). Show up with trash bags and gloves. Others join. Coffee after.",
      whyNow: "People are craving simple, tangible ways to help. No apps needed, no organization required — just show up.",
      firstStep: "Pick your local park and post in your neighborhood Facebook group or Nextdoor inviting others to join you this Saturday.",
    },
    {
      id: "mock-2",
      name: "Free Tutoring Circle",
      tagline: "One hour a week, one kid at a time",
      problem:
        "Many kids fall behind in school because their families can't afford tutoring, while adults with knowledge sit at home.",
      audience:
        "Elementary and middle school students in your neighborhood who need homework help.",
      revenueModel: null,
      impact:
        "Kids get personalized attention, build confidence, and see that adults in their community care about their success.",
      causeAreas: profile.causes,
      mechanism: "Pick a subject you know (math, reading, science). Meet at the library once a week. Word spreads. Other tutors join.",
      whyNow: "Learning loss from the pandemic is real. Libraries are free. Parents are desperate for help.",
      firstStep: "Call your local library this week and ask if you can host free tutoring sessions in their community room.",
    },
    {
      id: "mock-3",
      name: "Community Meal Night",
      tagline: "Cook once, feed many, connect everyone",
      problem:
        "Loneliness is epidemic. Many people eat alone every night while craving connection but lacking a way in.",
      audience:
        "Your neighbors — especially seniors, single people, and new residents who don't know anyone yet.",
      revenueModel: null,
      impact:
        "Neighbors become friends. Isolated people find community. A monthly tradition that becomes the highlight of the month.",
      causeAreas: profile.causes,
      mechanism: "Host a potluck dinner once a month. Rotate homes or use a church hall. Everyone brings something. Magic happens.",
      whyNow: "Social isolation is a crisis. People miss the dinner parties that used to be normal. Someone just needs to start.",
      firstStep: "Text 5 neighbors tonight and ask if they'd come to a potluck at your place next week.",
    },
    {
      id: "mock-4",
      name: "Little Free Library",
      tagline: "Take a book, leave a book, find a friend",
      problem:
        "Books are expensive. Many neighborhoods lack easy access to reading materials, especially for kids.",
      audience:
        "Families, kids, and book lovers in your immediate neighborhood who pass by daily.",
      revenueModel: null,
      impact:
        "More reading, more literacy, and a charming neighborhood landmark that sparks conversations.",
      causeAreas: profile.causes,
      mechanism: "Build or buy a small weatherproof box. Mount it in your yard or a public spot. Stock it with books. Neighbors do the rest.",
      whyNow: "Little Free Libraries are a proven model with over 150,000 worldwide. People donate books constantly.",
      firstStep: "Search 'Little Free Library' this weekend and order a kit, or build one from free plans online.",
    },
  ];
}

// Manageable, buildable ideas for Steady Builders
function getSteadyBuilderIdeas(profile: UserProfile): (Idea & { mechanism: string; whyNow: string; firstStep: string })[] {
  return [
    {
      id: "mock-1",
      name: "The Local Good Newsletter",
      tagline: "Weekly stories of people making a difference nearby",
      problem:
        "News is overwhelmingly negative. Good things happen in our communities every day, but nobody hears about them.",
      audience:
        "Residents who want to feel good about where they live and discover ways to get involved.",
      revenueModel:
        profile.ventureType === "project"
          ? null
          : "Sponsored by local businesses who want to be associated with community good.",
      impact:
        "Changes the local narrative, connects volunteers with opportunities, and inspires others to act.",
      causeAreas: profile.causes,
      mechanism: "Interview one local changemaker per week. Write up their story. Send via Substack. Share on local Facebook groups.",
      whyNow: "Email newsletters are thriving. Local news is dying. People are hungry for positive, hyperlocal content.",
      firstStep: "Sign up for Substack today and interview your first local hero this week.",
    },
    {
      id: "mock-2",
      name: "Skill Swap Meetups",
      tagline: "Teach what you know, learn what you don't",
      problem:
        "Classes are expensive. YouTube is impersonal. Meanwhile, everyone has skills they could teach and skills they want to learn.",
      audience:
        "Adults who want to learn practical skills — cooking, repairs, crafts, tech — in a social setting.",
      revenueModel:
        profile.ventureType === "project"
          ? null
          : "Venue partnerships with coffee shops, pay-what-you-can donations.",
      impact:
        "People gain new skills, make friends, and discover that everyone has something valuable to offer.",
      causeAreas: profile.causes,
      mechanism: "Monthly meetups where 3 people each teach a 20-minute skill. Rotate teachers. Host at cafes, libraries, or homes.",
      whyNow: "People crave in-person learning experiences. The maker movement has normalized casual skill-sharing.",
      firstStep: "Text 10 friends asking what skill they could teach in 20 minutes. Pick 3 for your first event.",
    },
    {
      id: "mock-3",
      name: "Community Resource Directory",
      tagline: "Every local helper in one place",
      problem:
        "People in crisis don't know where to turn. Resources exist but are scattered across outdated websites and word of mouth.",
      audience:
        "Anyone facing a challenge — job loss, housing insecurity, mental health struggles — and the helpers trying to connect them.",
      revenueModel:
        profile.ventureType === "project"
          ? null
          : "Grants from community foundations, sponsorship from service organizations.",
      impact:
        "People find help faster. Organizations get more clients. The safety net becomes visible and accessible.",
      causeAreas: profile.causes,
      mechanism: "Google Sheet → Simple website. Categorize by need. Update monthly. Share widely. Let community members suggest additions.",
      whyNow: "Post-pandemic, more people need help. Simple tech (Notion, Airtable) makes this doable without coding.",
      firstStep: "Create a Google Sheet this week with categories (food, housing, jobs, health) and add 5 resources to each.",
    },
    {
      id: "mock-4",
      name: "Peer Support Circle",
      tagline: "You don't have to face it alone",
      problem:
        "Therapy is expensive and waitlisted. Many people just need a consistent, safe space to be heard and supported.",
      audience:
        "People going through transitions or challenges — new parents, caregivers, job seekers, grief.",
      revenueModel:
        profile.ventureType === "project"
          ? null
          : "Partner with mental health orgs, sliding scale donations, corporate wellness partnerships.",
      impact:
        "Participants feel less alone, develop coping strategies together, and often form lasting friendships.",
      causeAreas: profile.causes,
      mechanism: "Weekly 90-minute meetings. Simple format: check-in, topic, sharing, check-out. Facilitate, don't fix.",
      whyNow: "Mental health awareness is mainstream. Peer support is evidence-based. People want community, not just treatment.",
      firstStep: "Research peer support facilitation basics this week and identify 3 people who might join a pilot group.",
    },
  ];
}

// Ambitious, substantial ideas for All In builders
function getAllInIdeas(profile: UserProfile): (Idea & { mechanism: string; whyNow: string; firstStep: string })[] {
  return [
    {
      id: "mock-1",
      name: "ImpactHub Local",
      tagline: "A launchpad for community changemakers",
      problem:
        "Aspiring social entrepreneurs lack the workspace, mentorship, and community to turn their ideas into reality.",
      audience:
        "Social entrepreneurs, nonprofit founders, and community organizers ready to build something serious.",
      revenueModel:
        profile.ventureType === "project"
          ? null
          : "Membership fees, corporate sponsorships, event hosting, grant funding.",
      impact:
        "Launches dozens of social ventures annually, creates a dense network of changemakers, transforms the local ecosystem.",
      causeAreas: profile.causes,
      mechanism: "Coworking space dedicated to social impact. Membership includes desk space, workshops, mentorship matching, and demo days.",
      whyNow: "Remote work has freed up commercial real estate. Impact investing is booming. Cities want to attract purpose-driven founders.",
      firstStep: "This week, reach out to 5 existing social entrepreneurs and ask what support they wish they had when starting.",
    },
    {
      id: "mock-2",
      name: "Community Capital Fund",
      tagline: "Neighbors investing in neighbors",
      problem:
        "Traditional investors ignore small local businesses and social ventures. Great ideas die for lack of a few thousand dollars.",
      audience:
        "Local entrepreneurs who need $5K-$50K to launch, and community members who want their money to do good close to home.",
      revenueModel:
        profile.ventureType === "project"
          ? null
          : "Management fees on deployed capital, success-based returns, grant funding for operations.",
      impact:
        "Launches businesses that create jobs, fill gaps in local services, and keep wealth circulating in the community.",
      causeAreas: profile.causes,
      mechanism: "Crowdfunded investment vehicle. Community members invest small amounts. Committee selects grantees/investees. Celebrate wins publicly.",
      whyNow: "Crowdfunding regulations have loosened. Community development finance is proven. People want alternatives to Wall Street.",
      firstStep: "Research community loan fund models (like Kiva or Honeycomb) this week and outline a simple pilot structure.",
    },
    {
      id: "mock-3",
      name: "Skills-to-Jobs Pipeline",
      tagline: "From training to employment in 12 weeks",
      problem:
        "Employers can't find skilled workers. Unemployed people can't access training. The gap wastes potential on both sides.",
      audience:
        "Job seekers who need skills and certifications, plus employers struggling to fill entry-level positions.",
      revenueModel:
        profile.ventureType === "project"
          ? null
          : "Employer partnerships (they pay for trained talent), workforce development grants, graduate income share.",
      impact:
        "Transforms lives by creating pathways from unemployment to careers with benefits and growth potential.",
      causeAreas: profile.causes,
      mechanism: "Recruit cohorts. Train in high-demand skills (tech, healthcare, trades). Place with employer partners. Support for 6 months post-placement.",
      whyNow: "Skills gap is a crisis. Employers are desperate. Workforce boards have funding. Remote training makes it scalable.",
      firstStep: "Interview 5 local employers this week to identify their hardest-to-fill positions and what skills they require.",
    },
    {
      id: "mock-4",
      name: "Impact Accelerator",
      tagline: "From idea to funded venture in 90 days",
      problem:
        "Most aspiring social entrepreneurs never launch because they don't know how to go from idea to execution.",
      audience:
        "People with social impact ideas who are ready to commit 10+ hours/week to build something real.",
      revenueModel:
        profile.ventureType === "project"
          ? null
          : "Program fees, sponsor partnerships, equity/revenue share in graduating ventures, grant funding.",
      impact:
        "Launches a cohort of new social ventures quarterly, each creating jobs and addressing community needs.",
      causeAreas: profile.causes,
      mechanism: "90-day program: weekly workshops, mentor matching, peer cohort, demo day with funders. Graduates leave with MVP and funding.",
      whyNow: "Accelerator model is proven. Impact investing is growing. People are leaving corporate jobs seeking meaning.",
      firstStep: "Map out a simple 12-week curriculum this week covering ideation, validation, business model, and pitch.",
    },
  ];
}
