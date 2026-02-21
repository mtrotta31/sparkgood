# SparkLocal Deep Dive Rewrite — Implementation Spec

## Philosophy

Every piece of content we generate must answer: **"What does the user DO with this?"**

We don't hand people documents and say "good luck." We produce state-of-the-art content AND walk them through exactly how to implement it, step by step. The deep dive isn't a report — it's a launch system with a built-in AI advisor.

---

## New Tab Structure

Replace the current 4-tab deep dive with 5 tabs:

### Tab 1: Launch Checklist (Start Here)
### Tab 2: Business Foundation  
### Tab 3: Growth Plan
### Tab 4: Financial Model
### Tab 5: AI Assistant (SparkLocal Advisor)

---

## Tab 1: Launch Checklist (Start Here)

**What it is:** An ordered, interactive checklist that says "do these things in this order and you will launch your business." Each item is checkable (persisted to Supabase) and expandable with a mini-guide.

**Structure:**
```
Week 1: Foundation
  ☐ Register your business
    → Expandable: "For a [business type] in [state], we recommend an LLC. Here's why: [reasoning]. To register: 1) Go to [state secretary of state URL] 2) File Articles of Organization ($[cost]) 3) Get your EIN at irs.gov/ein (free, takes 5 minutes)..."
  ☐ Open a business bank account
    → Expandable: "We recommend [Relay/Mercury/local credit union] because [reason]. What you'll need: EIN, Articles of Organization, government ID. Walk in or apply online at [link]."
  ☐ Get your EIN (Employer Identification Number)
    → Expandable: step-by-step with actual IRS link

Week 2: Setup
  ☐ Secure your workspace (if applicable)
    → Expandable: "Based on your budget of $[X]/month in [city], here are your best options:" + matched directory resources with links
  ☐ Get business insurance
    → Expandable: "[Business type] businesses in [state] typically need: General liability ($[range]/month), [any specific insurance]. Get quotes at [Next Insurance / Hiscox / local agent]. Here's what to ask for..."
  ☐ Set up your tools
    → Expandable: Contextual tech stack. E-commerce → Shopify setup guide. Service business → booking system. Food → POS system. Each with "here's how to set it up in 30 minutes."

Week 3: Build
  ☐ [Contextual to business type]
    → Product business: Source inventory/materials. "For a [product type], here are wholesale platforms: [Faire, Alibaba, local suppliers]. How to evaluate a supplier: [checklist]"
    → Service business: Create your service packages. "Based on competitors in [city], here's how to price: [specific pricing analysis]"
    → Tech business: Build your MVP. "For a [app type], we recommend: [no-code tools or dev approach]. Here's how to get a basic version live in a weekend..."
  ☐ Create your online presence
    → "We've generated your landing page copy, social media bios, and email templates below in the Growth Plan tab. Here's how to put them live: 1) Sign up for [Carrd $19/yr or Squarespace]. 2) Paste in the copy we generated. 3) Connect your domain..."

Week 4: Launch
  ☐ Soft launch to friends/family
    → "Send this exact message to 20 people: [generated text]. Ask them to try it and give honest feedback."
  ☐ Launch marketing push
    → "Post the social content from your Growth Plan tab. Here's the optimal posting schedule for [their platform]..."
  ☐ Apply to resources
    → "You matched [X] resources in [city]. Here's the priority order to apply: 1) [Grant name] — deadline [date], here's how to apply. 2) [Accelerator] — next cohort [date]..."
```

**Key implementation details:**
- Checklist state persisted to Supabase (new `checklist_items` table or JSONB on the project)
- Each item expandable/collapsible
- Items are generated contextually based on: business_category, location (city/state), budget, business_model, and the AI-generated plan
- Directory resources injected where relevant (coworking, grants, accelerators, SBA)
- External links open in new tabs
- Progress indicator: "4 of 12 steps complete"

**Prompt engineering approach:**
The launch checklist prompt receives: user profile (category, location, budget, skills, experience), the generated business idea, and matched directory resources. It outputs structured JSON:

```json
{
  "weeks": [
    {
      "week_number": 1,
      "title": "Foundation",
      "items": [
        {
          "id": "register-business",
          "title": "Register your LLC in Texas",
          "priority": "critical",
          "estimated_time": "1-2 hours",
          "estimated_cost": "$300",
          "guide": "Detailed step-by-step markdown with links...",
          "resources": ["matched-resource-id-1"],
          "links": [
            {"label": "Texas Secretary of State", "url": "https://..."}
          ]
        }
      ]
    }
  ]
}
```

---

## Tab 2: Business Foundation

**What it is:** Market viability (research-backed) + the practical "how to build this business" section. This tab answers two questions: "Is this a good idea?" and "How do I actually build it?"

**Sections:**

### Market Viability (Research-Backed — CRITICAL DIFFERENTIATOR)

This is powered by the existing Perplexity + Firecrawl research pipeline and is one of SparkLocal's biggest moats. ChatGPT cannot do this. Every deep dive must include real-time market research, not LLM knowledge.

**Viability Score:**
A clear score (e.g., 78/100) with a breakdown:
```
Overall Viability: 78/100 — Strong Opportunity

| Factor              | Score | Assessment                                      |
|--------------------|-------|-------------------------------------------------|
| Market Demand       | 85    | Growing 12% YoY, strong local interest          |
| Competition         | 65    | 4 direct competitors, but none in Austin         |
| Startup Feasibility | 80    | Achievable within your $2K budget               |
| Revenue Potential   | 75    | $3K-8K/month realistic within 6 months          |
| Timing              | 82    | Market trend favors this, no regulatory barriers |
```

**Market Research (Perplexity-powered):**
- Market size (TAM, SAM, SOM) with actual numbers and sources
- Industry growth rate and trends
- Target customer demographics and psychographics
- Demand signals (search volume, social media interest, industry reports)
- Risks and challenges specific to this market
- Source citations for all data points

**Competitor Analysis (Firecrawl-powered):**
A table with REAL competitors scraped from the web:
```
| Competitor          | URL                    | Pricing      | Positioning           | Weakness You Can Exploit  |
|--------------------|------------------------|--------------|----------------------|---------------------------|
| [Real Company 1]    | realcompany1.com       | $29-49/month | Premium, enterprise  | Too expensive for locals  |
| [Real Company 2]    | realcompany2.com       | $15/month    | Budget, basic         | Poor reviews, limited     |
| [Local Competitor]  | localcompetitor.com    | $25/month    | General audience     | No [differentiator]       |
```
- Each competitor with: what they do well, what they do poorly, and how the user's idea is different
- Competitive positioning summary: "Your advantage is [X]. No competitor in [city] is doing [Y]."

**Local Market Sizing:**
- "There are approximately [X] potential customers for this in [city] based on [population data, demographics, industry presence]"
- Local demand signals (are people searching for this? are there related businesses thriving?)
- Any local advantages or challenges (regulations, culture, economic conditions)

**Prompt engineering approach:**
This section uses TWO API calls before the Claude prompt:
1. Perplexity API: Market research query tailored to the specific business idea + location
2. Firecrawl API: Scrape top 3-5 competitors identified by Perplexity

The results from both are injected into the Claude prompt, which synthesizes them into the structured output above. This is the EXISTING pipeline — preserve and enhance it, don't replace it.

### Legal & Structure
- Recommended business structure (LLC, sole prop, nonprofit, etc.) with reasoning specific to their situation
- State-specific registration steps and costs
- Licenses and permits required for their business type + city + state
- When they'll need a lawyer vs. can DIY

### Startup Costs Breakdown
A TABLE, not paragraphs:
```
| Item                    | Estimated Cost | Priority | Notes                          |
|------------------------|---------------|----------|--------------------------------|
| LLC Registration (TX)   | $300          | Week 1   | File at sos.texas.gov          |
| Business Insurance      | $50/month     | Week 1   | General liability minimum      |
| Website (Squarespace)   | $16/month     | Week 2   | Or Carrd at $19/year           |
| Initial Inventory       | $500-1,000    | Week 3   | Start with 50 units minimum    |
| Packaging               | $200          | Week 3   | From noissue.co or Packlane    |
| Marketing Budget        | $200          | Week 4   | Instagram/Facebook ads          |
| TOTAL (Month 1)         | $1,316-1,816  |          | Within your $2K budget         |
```

### Suppliers & Vendors
Specific to their business type:
- Where to source products/materials (actual platform names and links)
- How to evaluate suppliers (checklist)
- Minimum order quantities to expect
- Payment terms (net 30, COD, etc.)

### Technology & Tools
Contextual tech stack recommendation:
- E-commerce: "Use Shopify ($29/month). Here's why it beats WooCommerce for your situation: [reasons]. Setup takes 2 hours. Key apps to install: [list]"
- Service business: "Use Square Appointments (free for 1 person). Here's how to set it up: [steps]"
- Food business: "Use Square POS (free hardware). Pair with DoorDash + UberEats for delivery."
- Tech: "Build your MVP with [Cursor/Replit/no-code tool]. Here's the fastest path to a working prototype..."

### Insurance & Compliance
- Required insurance types for their business type and state
- Estimated costs with links to quote
- Compliance requirements (health department for food, HIPAA for health, etc.)
- Tax obligations overview

**Prompt engineering approach:**
This prompt needs to be heavily contextual. Inputs: business_category, specific idea, location, budget, business_model. The prompt should instruct Claude to:
- Give SPECIFIC costs (not ranges when possible)
- Name ACTUAL tools and platforms (not "consider an e-commerce platform")
- Provide LINKS where possible
- Format as tables and structured lists, not prose
- Tailor to their budget (don't recommend Shopify Plus to someone with a $500 budget)

---

## Tab 3: Growth Plan

**What it is:** Marketing and customer acquisition — but with READY-TO-USE deliverables, not advice.

**Sections:**

### Elevator Pitch
A single, memorizable paragraph (under 30 seconds spoken). Written in first person so they can practice saying it.

Example: "I'm launching [business name], a [one-line description]. We help [target customer] solve [problem] by [solution]. What makes us different is [differentiator]. We're launching in [city] in [timeframe] and I'm looking for [what they need — customers, partners, feedback]."

### Landing Page Copy
Complete, paste-ready copy blocks:
- Headline
- Subheadline
- 3 benefit blocks
- Social proof placeholder text
- CTA button text
- About section
- FAQ (3-5 questions)

Include a note: "Paste this into Carrd ($19/year) or Squarespace. Here's how: [brief setup guide]"

### Social Media Content
5 ready-to-post pieces with:
- Platform (Instagram/LinkedIn/TikTok)
- Caption (full text, including hashtags)
- Visual suggestion (what image/video to create)
- Best time to post
- CTA in each post

Not "consider posting about your launch." Actual posts they copy-paste.

### Email Templates
3 emails:
1. Launch announcement (to friends/family/network)
2. Cold outreach to potential first customers
3. Follow-up/ask for referrals

Each fully written with subject line, body, and CTA.

### Local Marketing Tactics
Specific to their city and business:
- "Post in [specific subreddit or Facebook group] — here are 3 relevant ones for [city]"
- "Partner with [complementary local business type]. Here's a partnership pitch email:"
- "Attend [type of local event]. Check [meetup.com/eventbrite] for upcoming ones in [city]"

**Prompt engineering approach:**
This prompt gets: business idea, target customer profile, location, business model, user's key skills. Output must be structured as actual deliverables (complete copy), not suggestions. Each deliverable includes implementation instructions.

---

## Tab 4: Financial Model

**What it is:** Numbers that make the business real. Tables and projections, not paragraphs.

**Sections:**

### Startup Costs Summary
(Pulled from Business Foundation tab but formatted as a clean table)

### Monthly Operating Costs
```
| Expense              | Monthly Cost | Annual Cost | Notes                    |
|---------------------|-------------|-------------|--------------------------|
| Rent/Coworking       | $200        | $2,400      | [Matched resource name]  |
| Software/Tools       | $45         | $540        | Shopify + email          |
| Insurance            | $50         | $600        | General liability        |
| Marketing            | $150        | $1,800      | Social ads + content     |
| Supplies/Inventory   | $400        | $4,800      | Reorder monthly          |
| TOTAL                | $845        | $10,140     |                          |
```

### Revenue Projections
Three scenarios (table format):
```
|                    | Conservative | Moderate | Aggressive |
|-------------------|-------------|----------|------------|
| Monthly customers  | 20          | 50       | 100        |
| Average order      | $35         | $35      | $35        |
| Monthly revenue    | $700        | $1,750   | $3,500     |
| Monthly costs      | $845        | $945     | $1,145     |
| Monthly profit     | -$145       | $805     | $2,355     |
| Break-even month   | Month 8     | Month 3  | Month 1    |
```

### Break-Even Analysis
- Units/customers needed per month to break even
- What that looks like practically ("You need ~25 customers per month, which means about 1 new customer per day")

### Pricing Strategy
- Recommended price point with competitive reasoning
- Pricing psychology tips specific to their business type
- How to test pricing

**Prompt engineering approach:**
This prompt receives: budget, business type, location (affects costs), business model. Must produce ACTUAL NUMBERS in structured table format. Numbers should be realistic and sourced from industry averages. Include assumptions explicitly.

---

## Tab 5: AI Assistant (SparkLocal Advisor)

**What it is:** A chat interface inside the deep dive where users can ask questions and get help implementing their plan. The AI knows everything about their specific business, plan, and location.

### Technical Implementation

**Frontend:**
- Chat UI component at `src/components/results/AIChatAdvisor.tsx`
- Appears as a tab in the deep dive, OR as a persistent floating chat button
- Message history stored in React state + persisted to Supabase
- Typing indicator while generating
- Suggested prompts to help users get started:
  - "Walk me through registering my LLC"
  - "Help me write a cold email to [resource name]"
  - "What permits do I need for my food business?"
  - "How should I price my product?"
  - "Help me prepare for my first sales call"

**Backend:**
- New API route: `src/app/api/chat-advisor/route.ts`
- Uses Anthropic API (Claude Sonnet) with streaming
- System prompt includes:
  1. The user's full profile (business category, location, budget, skills, experience)
  2. The generated business idea (full description)
  3. ALL deep dive content (checklist, business foundation, growth plan, financial model)
  4. Matched directory resources
  5. SparkLocal advisor persona instructions

**System Prompt Structure:**
```
You are the SparkLocal Business Advisor — a practical, knowledgeable business consultant 
helping a user launch their specific business. You have full context on their plan:

BUSINESS: [idea title and description]
CATEGORY: [business category]
LOCATION: [city, state]
BUDGET: [budget range]
EXPERIENCE: [experience level]
SKILLS: [key skills]

THEIR LAUNCH PLAN:
[Full checklist content]

THEIR BUSINESS FOUNDATION:
[Full business foundation content]

THEIR GROWTH PLAN:
[Full growth plan content]

THEIR FINANCIAL MODEL:
[Full financial model content]

MATCHED LOCAL RESOURCES:
[List of matched directory resources with details]

INSTRUCTIONS:
- Always give specific, actionable advice tailored to their situation
- Reference their plan, location, budget, and matched resources when relevant
- When they ask "how do I do X", give step-by-step instructions they can follow right now
- If they ask about something outside your knowledge, be honest and suggest where to find the answer
- You can help them: draft emails, refine their pitch, prepare for meetings, understand legal requirements, troubleshoot business problems, write copy, and plan next steps
- Keep responses practical and concise — they're trying to launch a business, not read an essay
- Use their business name and details naturally in conversation
```

**Usage limits:**
- Free users: 0 messages (preview showing "Unlock the AI Advisor with Deep Dive")
- Deep Dive purchasers ($4.99): 20 messages per project
- Subscription users: Unlimited messages

**Supabase schema:**
```sql
CREATE TABLE advisor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES user_projects(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track usage
ALTER TABLE user_projects ADD COLUMN advisor_message_count INTEGER DEFAULT 0;
```

---

## Directory Integration

**Critical feature:** The deep dive must inject REAL resources from the SparkLocal directory based on the user's location and business type.

### Matching Logic (src/lib/match-resources.ts)

```typescript
async function matchResources(profile: UserProfile, idea: Idea) {
  const { city, state, businessCategory, budget } = profile;
  
  // 1. Local coworking spaces (sorted by rating, filtered by budget)
  const coworking = await supabase
    .from('resource_listings')
    .select('*')
    .eq('category', 'coworking')
    .eq('city', city)
    .eq('state', state)
    .order('rating', { ascending: false })
    .limit(3);
  
  // 2. Relevant grants (nationwide + local)
  const grants = await supabase
    .from('resource_listings')
    .select('*')
    .eq('category', 'grant')
    .or(`city.eq.${city},is_nationwide.eq.true`)
    .limit(5);
  
  // 3. Accelerators (matching focus areas)
  const accelerators = await supabase
    .from('resource_listings')
    .select('*')
    .eq('category', 'accelerator')
    .or(`city.eq.${city},is_nationwide.eq.true`)
    .limit(3);
  
  // 4. SBA resources (local offices)
  const sba = await supabase
    .from('resource_listings')
    .select('*')
    .eq('category', 'sba')
    .eq('state', state)
    .limit(3);
  
  return { coworking, grants, accelerators, sba };
}
```

### How Resources Appear in Deep Dive

In the Launch Checklist:
- "☐ Apply for funding: You matched 3 grants → [Grant Name] ($5K-$25K, Rolling deadline) [Apply →]"

In Business Foundation:
- "Workspace options in Austin: [CoSpace] (4.5★, $200/month) | [Capital Factory] (4.8★, $300/month) | [WeWork] (4.2★, $250/month)"

In the AI Assistant:
- Context includes all matched resources so the advisor can say "You should apply to [specific grant] because [specific reason based on their business]"

---

## Prompt Rewrites Summary

All prompts at `src/prompts/deep-dive.ts` need to be rewritten with these principles:

1. **Output JSON, not prose** — Every prompt returns structured JSON that the frontend renders. This gives us control over formatting, tables, interactivity.

2. **Be specific** — Name tools, platforms, costs, links. Never say "consider using an e-commerce platform." Say "Use Shopify ($29/month) because [reason]."

3. **Be contextual** — Every output is tailored to: business type, city, state, budget, experience level, skills, and matched resources.

4. **Be actionable** — Every section answers "what do I do with this?" Include implementation steps, not just information.

5. **Include real data** — Inject Perplexity research results, directory matches, and state-specific information.

---

## Implementation Order

### Sprint 1 (Claude Code Prompt — Terminal 1):
1. Rewrite deep-dive.ts prompts for all 4 content tabs (checklist, foundation, growth, financial)
2. Build matchResources() function 
3. Update the deep dive API route to pass matched resources into prompts
4. Update the deep dive generation to output structured JSON

### Sprint 2 (Claude Code Prompt — Terminal 2):
1. Build the Launch Checklist UI component (interactive, expandable, checkable)
2. Redesign the deep dive tab layout for the new 5-tab structure
3. Build the Business Foundation, Growth Plan, and Financial Model renderers
4. Add checklist persistence to Supabase

### Sprint 3 (Claude Code Prompt — Either Terminal):
1. Build the AI Chat Advisor component
2. Create the /api/chat-advisor route with streaming
3. Build the system prompt assembler (injects plan + resources + profile)
4. Add message persistence and usage tracking
5. Add suggested prompts and starter messages

### Sprint 4 (Claude Code Prompt — Either Terminal):
1. Rewrite the PDF export to match the new structure
2. Professional cover page with business name
3. Tables, checklists, and structured layouts
4. Include matched resources section

---

## Notes

- The AI Assistant is the single most differentiating feature. ChatGPT doesn't know about their specific plan, their local resources, or their financial model. This does.
- The Launch Checklist transforms the deep dive from "interesting read" to "I know exactly what to do Monday morning."
- Directory integration is the moat. No other AI business tool connects to 2,416 real local resources.
- The financial model with real numbers makes this feel worth $50, not $5. People NEED to know "how much will this cost me?"
