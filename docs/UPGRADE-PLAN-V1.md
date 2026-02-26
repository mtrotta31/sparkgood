# SparkLocal — Product Upgrade Plan v1

Five upgrades to improve core product quality, fix scoring accuracy, drive Launch Kit conversions, and add subscription-gated engagement.

---

## Upgrade 1: Launch Checklist — Validate First, Formalize Later

### Problem
The current launch checklist starts with administrative tasks (register LLC, get EIN, etc.) before the user has validated that anyone wants their product. This is bad advice — a user shouldn't spend $300 on an LLC for an idea nobody will pay for.

### Solution
Restructure the checklist prompt so that **Weeks 1-2 focus on market validation** and **Weeks 3-4 shift to formalization and launch** only after the user has evidence of demand.

### New Checklist Structure

**Week 1: Validate Your Idea**
Tasks should be contextual to the business type. Examples:
- Product business (e.g., CincyBite Box): "Talk to 10 friends/family — would they pay $X/month for this? Record their honest reactions." / "Identify 3 local businesses who could supply product. Visit or call them this week to gauge interest and pricing."
- Service business (e.g., mobile cocktail bar): "Post in 2 local Facebook groups describing your service and asking if anyone would book it. Track responses." / "Call 3 event venues and ask if they'd refer clients to a mobile bar service."
- Digital business: "Create a simple landing page describing the product and run a $20 Facebook ad to test click-through rates." / "Post in 3 relevant online communities and measure interest."

**Week 2: Refine Based on Feedback**
- "Based on your conversations, refine your offering. What did people love? What concerned them?"
- "Set a pre-sale or waitlist goal: get 5 people to commit (deposit, signup, or verbal yes) before moving forward."
- "Research your top 3 competitors more deeply — what do their customers complain about? That's your opportunity."

**Week 3: Formalize Your Business** (only after validation)
- Register LLC / business structure
- Get EIN from IRS
- Open business bank account
- Set up basic bookkeeping
- The checklist should include a note: "You've validated interest — now it's time to make it official."

**Week 4: Build and Launch**
- Create your product/service offering
- Set up online presence (using Growth Plan content)
- Soft launch to your validated audience
- Apply to matched resources from Local Resources tab

### Implementation
This is a **prompt rewrite** in the launch checklist generation logic. The prompt needs to:
1. Receive the business type/category to generate appropriate validation tasks
2. Explicitly structure weeks as: Validate → Refine → Formalize → Launch
3. Make validation tasks specific and measurable (not "do some market research" but "talk to 10 people and record their responses")
4. Include a transition message between validation and formalization phases
5. Reference the user's specific business details, location, and budget throughout

### Files to modify
- The deep dive prompt that generates the launch checklist (likely in `src/prompts/deep-dive.ts` or similar)
- No frontend changes needed — the checklist UI component stays the same

---

## Upgrade 2: Fix Viability Score Clustering at 72-74

### Problem
Nearly every business idea gets a viability score of 72-74/100 regardless of actual quality. This makes the score meaningless — users can't tell if their idea is genuinely strong or weak. The model is anchoring to a "safe" middle-high range.

### Solution
Rewrite the scoring prompt with sharper rubrics, explicit score anchors, and calibration examples so the model produces a meaningful distribution.

### New Scoring Rubric

Each of the 5 scoring dimensions should have explicit criteria for different score ranges:

**Market Demand (0-100)**
- 90-100: Proven demand, people actively searching for this, clear willingness to pay, large addressable market
- 70-89: Strong signals of demand, growing market, some competition validates the space
- 50-69: Moderate demand, niche market, unclear if people will pay or just express interest
- 30-49: Weak demand signals, very small market, likely hard to find paying customers
- 0-29: No evidence of demand, solution looking for a problem

**Competition (0-100)** *(higher = better competitive position)*
- 90-100: Clear gap in market, no direct competitors doing this specific thing in this location
- 70-89: Few competitors, clear differentiation opportunity, incumbents are weak or generic
- 50-69: Moderate competition, differentiation possible but requires strong execution
- 30-49: Crowded market, hard to stand out, would need significant innovation or capital
- 0-29: Dominated by established players with strong brand loyalty and resources

**Startup Feasibility (0-100)**
- 90-100: Can launch within budget with existing skills, minimal regulatory hurdles, low complexity
- 70-89: Achievable with some learning/investment, manageable complexity
- 50-69: Stretches budget or skills, moderate regulatory/licensing requirements, some technical challenges
- 30-49: Significant capital, expertise, or time beyond what user has indicated
- 0-29: Unrealistic given stated budget/experience, heavy regulatory burden, requires specialized infrastructure

**Revenue Potential (0-100)**
- 90-100: High margins (60%+), clear path to $10K+/month, recurring revenue model, scalable
- 70-89: Good margins, realistic path to $5K+/month, some recurring revenue potential
- 50-69: Moderate margins, income possible but may stay as side income, limited scalability
- 30-49: Low margins, hard to scale, likely hobby-level income unless significant investment
- 0-29: Very difficult to monetize, unclear business model, likely to lose money

**Timing (0-100)**
- 90-100: Perfect timing — trend is accelerating, seasonal advantage, regulatory tailwind, cultural moment
- 70-89: Good timing, market is growing, no major headwinds
- 50-69: Neutral timing, no particular advantage or disadvantage
- 30-49: Challenging timing — market is contracting, seasonal disadvantage, regulatory headwinds
- 0-29: Terrible timing — market is saturated or declining, major obstacles ahead

### Calibration Examples in the Prompt

Include 2-3 examples in the prompt to anchor the model:

**Example: Strong idea (Score: 87)**
"Mobile dog grooming in a fast-growing suburb with only 1 competitor, owner has grooming experience, $3K startup budget covers a used van and supplies, recurring revenue from repeat customers."

**Example: Mediocre idea (Score: 58)**
"Artisanal candle business in a city with 12 existing candle makers on Etsy, no particular differentiation, owner has never made candles before, moderate demand but very crowded market."

**Example: Weak idea (Score: 34)**
"Opening a full-service restaurant with $2K budget and no restaurant experience in a location with dozens of established competitors."

### Implementation
- Rewrite the Business Foundation / viability scoring prompt
- Include the rubric and calibration examples directly in the prompt
- Instruct the model: "Scores should reflect genuine differentiation. A mediocre idea in a crowded market should score in the 40s-50s, not the 70s. Only score above 80 if the idea has clear, specific advantages."
- Consider adding a line: "Before scoring, list 2 reasons the score should be LOWER and 2 reasons it should be HIGHER, then arrive at your final score." This forces the model to consider both directions instead of defaulting to the middle.

### Files to modify
- The Business Foundation / viability scoring prompt
- No frontend changes needed

---

## Upgrade 3: Post-Generation Launch Kit Upsell

### Problem
After generating all 5 deep dive tabs, there's no prompt to purchase the Launch Kit. The user has to discover the button in the header on their own. This is a missed conversion moment — the user just spent 1-2 minutes watching their business plan generate, they're maximally engaged, and there's no CTA.

### Solution
After the last tab finishes generating, display a contextual upsell component that explains what the Launch Kit is and drives purchase.

### UX Design

**Trigger:** Appears after all 5 tabs have completed generation (or after the user has viewed at least 3 tabs — whichever feels more natural). Should NOT appear if the user already has a Launch Kit.

**Component: LaunchKitUpsell**

Placement: Either as a banner that slides in at the bottom of the deep dive area, or as an inline section that appears below the active tab content after all tabs are done. Should feel like a natural next step, not an aggressive popup.

Content:
```
🚀 Your business plan is ready. Now get the tools to launch it.

The Launch Kit generates professional assets you can use immediately:

🌐 Landing Page — A live, hosted website for your business (instantly shareable)
📊 Pitch Deck — 7-slide presentation for investors, partners, or lenders  
📱 Social Graphics — Ready-to-post images for Instagram, LinkedIn, and Facebook
📄 One-Pager — Professional PDF summary to hand out or email

[Get Launch Kit — $2.99]     [See example →]

Want unlimited Launch Kits? Subscribe starting at $14.99/month →
```

**Behavior:**
- "Get Launch Kit" opens the existing purchase modal
- "See example" links to the example deep dive page
- "Subscribe" links to the subscription page
- Dismissible — user can close it and it doesn't reappear for this project
- Does NOT appear if `launch_kit_purchased` is already true for this project

### Implementation
- New component: `src/components/deep-dive/LaunchKitUpsell.tsx`
- Integrate into `DeepDiveSectionV2.tsx` — render conditionally based on tab completion state and launch kit purchase status
- Track dismissal in local state (doesn't need to persist — if they reload the page and haven't bought it, showing it again is fine)

---

## Upgrade 4: Dynamic Week Generation (Subscription-Gated)

### Problem
The launch checklist currently generates 4 weeks of static tasks. After completing them, the user has no guided next steps. This is both a missed engagement opportunity and a missed subscription conversion opportunity.

### Solution
After completing all Week 1-4 tasks, show a "Generate Next Week's Tasks" button that creates a contextually-aware Week 5 (and beyond). This feature is **gated behind the monthly subscription** — one-time purchasers see the button but are prompted to upgrade.

### UX Flow

**For one-time purchasers:**
After completing all tasks in Weeks 1-4, show:
```
✅ You've completed your 4-week launch plan!

Your business is off the ground. Want to keep the momentum going?

Subscribers get unlimited weekly task generation — each week builds on your 
progress with new tasks tailored to where your business is right now.

[Subscribe to Continue — $14.99/month]
```

**For subscribers:**
After completing all tasks in the current set of weeks, show:
```
✅ All tasks complete! Ready for your next week?

We'll generate new tasks based on your business progress, 
focusing on growth, optimization, and next milestones.

[Generate Week 5 Tasks]
```

Clicking the button:
1. Shows a loading state: "Planning your next week..."
2. Calls the API with full project context + list of completed tasks + current week number
3. Returns a new week of 4-6 tasks in the same format as existing weeks
4. Appends the new week to the checklist (persisted to Supabase)
5. Can be repeated indefinitely (Week 6, 7, 8, etc.)

### API / Prompt Design

The generation prompt receives:
- Full project context (business idea, location, budget, category)
- All previously generated weeks and their tasks
- Which tasks are marked as complete vs. incomplete
- Current week number being generated
- Matched local resources (for continued resource recommendations)

The prompt should:
- Build on what's been accomplished, not repeat earlier tasks
- Shift focus as the business matures: validation → launch → early growth → optimization → scaling
- Reference specific outcomes from earlier tasks ("Now that you've registered your LLC and launched your landing page...")
- Include 4-6 tasks per week with the same format (title, priority, estimated time, guide, links)
- Get progressively more growth-oriented: marketing campaigns, customer retention, financial review, hiring, etc.

### Database Changes
- The existing checklist storage (likely JSONB) needs to accommodate additional weeks beyond the initial 4
- Add a field to track the highest generated week number
- Completed task state should already be persisted — verify this works for dynamically added weeks

### Subscription Check
- Use the same subscription verification logic as the AI Advisor's 20-message limit
- Check user's subscription status before allowing generation
- If not subscribed, show the upgrade prompt instead of generating

### Files to modify
- Launch checklist UI component — add the completion detection and CTA/generate button
- New or modified API route for generating additional weeks
- Launch checklist prompt — new variant for "continuation weeks" that includes prior task context
- Subscription check integration (reuse existing pattern from AI Advisor)

---

## Implementation Order

### Phase 1: Core Quality (do first — improves every new deep dive generated)
1. **Upgrade 1: Checklist restructure** — Prompt rewrite only, no frontend changes
2. **Upgrade 2: Fix viability scores** — Prompt rewrite only, no frontend changes

These two can be done together in one Claude Code session since they're both prompt-level changes. Every deep dive generated after these changes will be better.

### Phase 2: Revenue (do second — starts converting existing traffic)
3. **Upgrade 3: Launch Kit upsell** — New component + integration into DeepDiveSectionV2

Quick build, immediate revenue impact.

### Phase 3: Engagement Loop (do third — adds subscription value)
4. **Upgrade 4: Dynamic week generation** — New API route, prompt, UI component, subscription gating

Most complex upgrade but creates the strongest subscription value proposition alongside the AI Advisor's unlimited messages.

---

## Success Metrics

- **Upgrade 1:** Qualitative — checklist feels more actionable and confidence-building. Users engage with Week 1 tasks instead of bouncing.
- **Upgrade 2:** Viability scores show meaningful variance (standard deviation > 10 across generated ideas). Scores below 60 and above 85 appear regularly.
- **Upgrade 3:** Launch Kit conversion rate increases (track: upsell shown → purchase completed).
- **Upgrade 4:** Subscription conversion rate increases. Track: "Generate next week" button clicks → upgrade prompt shown → subscription purchased. For subscribers: average weeks generated per project (engagement depth).
