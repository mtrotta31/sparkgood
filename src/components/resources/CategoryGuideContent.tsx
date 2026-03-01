// Category Guide Content Component
// Displays SEO guide content and FAQs for category landing pages
// Includes FAQPage JSON-LD structured data

import Script from "next/script";
import type { ResourceCategory } from "@/types/resources";

interface FAQ {
  question: string;
  answer: string;
}

interface CategoryGuide {
  heading: string;
  content: string[]; // Array of paragraphs
  faqs: FAQ[];
}

// Hardcoded content map for 4 main categories
const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  grant: {
    heading: "Your Guide to Small Business Grants",
    content: [
      "Small business grants represent one of the most attractive funding options for entrepreneurs because they don't need to be repaid. Unlike loans, grants provide free capital that helps founders launch, grow, or pivot their ventures without taking on debt or giving up equity. However, grants are competitive—understanding the landscape is essential to maximize your chances of success.",
      "Grants come in several forms. Federal grants from agencies like the SBA, USDA, and NIH target specific industries such as agriculture, technology research, and healthcare innovation. State and local grants often focus on economic development, job creation, or supporting underserved communities. Private grants from corporations and foundations may prioritize social impact, diversity, or specific business models. Many entrepreneurs overlook niche grants tied to their industry, location, or background—these often have less competition than well-known programs.",
      "Eligibility requirements vary widely. Some grants target women-owned, minority-owned, or veteran-owned businesses. Others require you to be in a specific geographic area, industry vertical, or stage of business. Read eligibility criteria carefully before investing time in an application. Most grants require a registered business entity, though some support pre-launch planning or feasibility studies.",
      "The application process typically involves a detailed business plan, financial projections, and a clear explanation of how funds will be used. Strong applications demonstrate measurable impact—jobs created, revenue generated, or community benefits. Timeline expectations matter: federal grants can take 6-12 months from application to disbursement, while local grants may move faster. Apply early, as many programs have limited funding windows.",
      "Common mistakes include submitting incomplete applications, ignoring formatting requirements, and failing to follow up. Start with smaller, local grants to build a track record before pursuing larger federal programs. Track deadlines religiously and maintain organized records—many grants require post-award reporting on how funds were spent."
    ],
    faqs: [
      {
        question: "Do I have to pay back a small business grant?",
        answer: "No, grants do not need to be repaid. Unlike loans, grants are essentially free money awarded to businesses that meet specific criteria. However, most grants come with reporting requirements—you'll need to document how funds were used and demonstrate measurable outcomes. Misusing grant funds can result in penalties or being required to return the money."
      },
      {
        question: "What are the most common eligibility requirements for business grants?",
        answer: "Common eligibility requirements include having a registered business entity (LLC, corporation, etc.), operating in a specific geographic area, belonging to an underserved demographic (women-owned, minority-owned, veteran-owned), working in a target industry (agriculture, technology, healthcare), and demonstrating financial need or growth potential. Some grants also require a minimum time in business or revenue thresholds."
      },
      {
        question: "How long does the grant application process take?",
        answer: "Timeline varies significantly by grant type. Local and state grants may take 1-3 months from application to funding. Federal grants typically take 6-12 months and involve multiple review stages. Private foundation grants fall somewhere in between. Plan ahead and apply well before you need the funds—grant cycles are often annual, and missing a deadline means waiting another year."
      },
      {
        question: "What makes a grant application stand out?",
        answer: "Winning applications demonstrate clear, measurable impact—specific jobs to be created, revenue projections, or community benefits. Include a detailed budget showing exactly how funds will be used. Tailor each application to the grant's stated goals rather than submitting generic proposals. Strong supporting documents (business plan, financial statements, letters of support) significantly improve your chances."
      }
    ]
  },
  coworking: {
    heading: "Finding the Right Coworking Space",
    content: [
      "Coworking spaces have transformed how entrepreneurs and small businesses approach workspace. Rather than committing to expensive long-term office leases, founders can access professional environments with flexible terms, built-in amenities, and networking opportunities. Whether you're a solo freelancer or a growing startup team, understanding coworking options helps you find the right fit.",
      "Coworking spaces come in several formats. Hot desks offer the most flexibility—you get access to a shared workspace without a dedicated seat, ideal for those who work remotely most days but want occasional office access. Dedicated desks provide your own permanent workspace in an open environment, offering consistency while maintaining community. Private offices within coworking facilities give teams their own enclosed space with access to shared amenities like conference rooms, kitchens, and events.",
      "Cost varies dramatically based on location, amenities, and desk type. Hot desks in smaller cities might run $100-200/month, while dedicated desks in major metros like New York or San Francisco can exceed $500-800/month. Private offices scale based on team size. Look beyond the base price—consider what's included. Some spaces bundle high-speed internet, printing, mail handling, phone booths, and conference room hours. Others charge separately for these services.",
      "When evaluating spaces, consider your work style and growth trajectory. Do you need quiet focus time or do you thrive in bustling environments? Will you be taking client calls that require privacy? How often will you actually use the space—daily members get more value than occasional visitors. Location matters for both commute convenience and client impressions. Some spaces specialize in specific industries (tech, creative, healthcare) and curate members accordingly.",
      "Beyond desk space, coworking shines for community and networking. Many spaces host events, workshops, and social gatherings that help entrepreneurs connect, learn, and find collaborators or customers. A day pass or short-term trial membership lets you experience the culture before committing. The best coworking space is one where you'll actually show up and do your best work."
    ],
    faqs: [
      {
        question: "What's the difference between a hot desk and a dedicated desk?",
        answer: "A hot desk means you have access to the coworking space but no assigned seat—you sit wherever is available each day. It's the most affordable and flexible option, ideal for people who don't need to work from the space daily. A dedicated desk is your own permanent workspace that no one else uses. You can leave your equipment set up and personalize your area while still being part of the open coworking community."
      },
      {
        question: "How much does coworking typically cost?",
        answer: "Coworking costs vary by location and membership type. Hot desks typically range from $100-300/month, dedicated desks from $250-600/month, and private offices from $500-2,000+/month depending on size and market. Major cities command premium prices. Many spaces offer day passes ($20-50) or part-time memberships for those who don't need daily access. Always ask what's included—some prices cover conference rooms, printing, and coffee while others charge extra."
      },
      {
        question: "What amenities should I look for in a coworking space?",
        answer: "Essential amenities include reliable high-speed WiFi, comfortable seating, adequate power outlets, and good lighting. Beyond basics, valuable amenities include conference room access, phone booths or quiet rooms for calls, printing and scanning, mail handling, kitchen facilities, and lockers. Some spaces offer perks like free coffee, beer taps, gym access, or childcare. Prioritize amenities you'll actually use over flashy extras."
      },
      {
        question: "Can I use a coworking space as my business address?",
        answer: "Yes, most coworking spaces offer virtual mailbox services that let you use their address as your official business address. This provides a professional presence without needing a full membership. Packages typically include mail handling, notification when items arrive, and optional forwarding. Some spaces also offer virtual office plans that add meeting room hours and phone answering services. Check with individual spaces about their business address policies."
      }
    ]
  },
  accelerator: {
    heading: "Understanding Startup Accelerators",
    content: [
      "Startup accelerators are intensive programs designed to fast-track early-stage company growth through mentorship, education, and funding. Unlike incubators which may support companies indefinitely, accelerators run for fixed periods—typically 3-6 months—culminating in a demo day where founders pitch to investors. For the right companies, accelerators can compress years of learning into weeks and open doors that would otherwise take years to access.",
      "Accelerators typically provide a combination of seed funding, mentorship, workspace, and curriculum. Investment amounts range from $25,000 to $500,000+, usually in exchange for 5-10% equity. Beyond capital, the real value often comes from the mentor network—successful founders, industry experts, and potential investors who can help navigate challenges and make introductions. Top programs like Y Combinator, Techstars, and 500 Startups have extensive alumni networks that continue to support founders long after demo day.",
      "Not all accelerators are equal. Industry-specific accelerators (fintech, healthcare, cleantech) offer specialized knowledge and connections that generalist programs can't match. Corporate accelerators provide access to potential customers and distribution channels but may come with strategic strings attached. Local and regional accelerators often have less competition and may focus on companies serving specific geographic markets. Research graduation outcomes—what percentage of companies raise follow-on funding, are still operating, or have been acquired?",
      "The application process is competitive, with acceptance rates at top programs often below 3%. Strong applications demonstrate traction (users, revenue, or meaningful product development), a capable team with relevant experience, a large addressable market, and clarity on how the accelerator specifically will help. Generic applications rarely succeed—articulate why this program, at this time, with these mentors makes sense for your company.",
      "Accelerators demand intense commitment. Expect to relocate (or attend virtually) full-time for the program duration. The cohort model means you'll learn alongside peer companies facing similar challenges—these relationships often prove as valuable as mentor guidance. Before applying, honestly assess whether your company is at the right stage and whether you're prepared to make the program your sole focus for several months."
    ],
    faqs: [
      {
        question: "How much equity do accelerators take?",
        answer: "Most accelerators take between 5-10% equity in exchange for their investment and program participation. Top-tier programs like Y Combinator standardized at 7% for $500,000 (as of recent batches). Some accelerators are non-dilutive, meaning they provide support without taking equity—these are often run by governments, universities, or corporations with strategic rather than financial motivations. Always compare the equity cost against the concrete value you expect to receive."
      },
      {
        question: "What's the difference between an accelerator and an incubator?",
        answer: "Accelerators are time-bound, intensive programs (typically 3-6 months) focused on rapid growth and investor preparation, ending with a demo day. Incubators provide ongoing support without fixed timelines, often focusing on earlier-stage idea development and offering subsidized workspace. Accelerators usually invest capital for equity while incubators may not. Think of accelerators as boot camps and incubators as nurturing environments—both valuable at different company stages."
      },
      {
        question: "When is the right time to apply to an accelerator?",
        answer: "The ideal stage varies by program, but most accelerators look for companies with a working product or prototype, some early traction (users, customers, or revenue), a committed founding team, and a scalable business model. Too early (just an idea) and you won't be competitive. Too late (already raised significant funding) and you won't benefit enough to justify the equity. Research each program's typical portfolio companies to gauge fit."
      },
      {
        question: "Do I have to relocate for an accelerator program?",
        answer: "Traditional accelerators required relocation to their hub city for the full program duration. Post-2020, many programs now offer hybrid or fully remote options. However, in-person programs often provide stronger networking, more serendipitous connections, and deeper mentor relationships. If relocation is required, consider whether your business can be run remotely for 3-6 months. Some programs offer stipends to help cover living expenses during the program."
      }
    ]
  },
  sba: {
    heading: "SBA Resources for Small Businesses",
    content: [
      "The U.S. Small Business Administration (SBA) offers a vast network of free and low-cost resources that many entrepreneurs overlook. While the SBA is best known for guaranteeing small business loans, its resource centers, mentorship programs, and training initiatives provide tremendous value for businesses at every stage. Understanding what's available helps you tap into support that's already funded by your tax dollars.",
      "SBA Resource Partners form the backbone of the agency's support network. Small Business Development Centers (SBDCs) operate in nearly 1,000 locations nationwide, providing free one-on-one consulting, training workshops, and assistance with business plans, funding applications, and market research. SCORE (Service Corps of Retired Executives) matches entrepreneurs with volunteer mentors—experienced business professionals who provide ongoing guidance. Women's Business Centers (WBCs) offer programs specifically designed for women entrepreneurs, addressing unique challenges and opportunities.",
      "The SBA doesn't directly lend money, but its loan guarantee programs make financing accessible to businesses that might not qualify for conventional bank loans. SBA 7(a) loans support general business purposes including working capital, equipment, and real estate. 504 loans focus on major fixed assets like real estate and machinery. Microloans provide smaller amounts (up to $50,000) for startups and early-stage businesses. Lenders are more willing to approve these loans because the SBA guarantees a portion of the amount.",
      "Disaster loans represent another critical SBA function, providing low-interest loans to businesses affected by declared disasters—natural events, pandemics, or economic emergencies. The Economic Injury Disaster Loan (EIDL) program became widely known during recent crises. Contracting opportunities through the SBA help small businesses compete for federal government contracts, with programs specifically supporting disadvantaged businesses, women-owned firms, and service-disabled veteran businesses.",
      "Accessing SBA resources starts with finding your local resource partners. Every state has multiple SBDCs, SCORE chapters, and in many areas, Women's Business Centers. Most services are free—funded by federal and state governments. Walk-in consultations are often available, and appointments can typically be scheduled online. The SBA website (sba.gov) provides program information, lender matching tools, and links to local offices. Don't wait until you need a loan to engage—resource partners can help with early planning and ongoing business challenges."
    ],
    faqs: [
      {
        question: "Is SBA assistance really free?",
        answer: "Yes, most SBA resource center services are completely free. SBDC consulting, SCORE mentorship, and WBC programs are funded by federal and state governments. You'll never be charged for one-on-one consulting, business plan review, or training workshops at these centers. Some specialized programs or certification courses may have nominal fees, but core advisory services are free for any small business owner or aspiring entrepreneur."
      },
      {
        question: "How do SBA loans work if the SBA doesn't lend directly?",
        answer: "The SBA partners with approved lenders (banks, credit unions, community development organizations) and guarantees a portion of the loan—typically 75-85%. This guarantee reduces the lender's risk, making them more willing to approve loans for businesses that might not qualify for conventional financing. You apply through the lender, not the SBA directly. The SBA also sets maximum interest rates and fee structures, protecting borrowers from predatory terms."
      },
      {
        question: "What's the difference between an SBDC and SCORE?",
        answer: "SBDCs (Small Business Development Centers) are staffed by professional consultants, often housed at universities or economic development organizations. They provide comprehensive services including business plan development, financial analysis, and market research. SCORE matches you with volunteer mentors—retired or current executives who share expertise from their careers. Both are free; SBDCs may feel more formal and structured while SCORE offers relationship-based mentorship. Many entrepreneurs use both."
      },
      {
        question: "Who qualifies for SBA resources and loans?",
        answer: "SBA resource centers (SBDCs, SCORE, WBCs) serve anyone interested in starting or growing a small business—no eligibility requirements beyond showing up. For SBA loans, businesses must meet size standards (varying by industry), operate for profit, do business in the U.S., have reasonable owner equity, and demonstrate need for financing. Some programs specifically target underserved groups including minorities, women, veterans, and rural businesses."
      }
    ]
  },
  "business-attorney": {
    heading: "Finding the Right Business Attorney",
    content: [
      "A business attorney is one of the most valuable professional relationships an entrepreneur can establish. While many founders delay hiring legal counsel to save money, early legal guidance often prevents costly mistakes—from choosing the wrong business structure to signing problematic contracts. The right attorney becomes a strategic partner who protects your interests as you grow.",
      "Business attorneys handle a range of critical functions. Entity formation—deciding between LLC, S-Corp, C-Corp, or other structures—has significant tax and liability implications that depend on your specific situation. Contract drafting and review ensures agreements with co-founders, employees, vendors, and customers protect your interests. Intellectual property protection covers trademarks, patents, and copyrights that may be central to your competitive advantage.",
      "When to engage an attorney matters. Before incorporating, get advice on entity structure and state of incorporation. Before signing any significant contract—lease, vendor agreement, partnership deal—have an attorney review it. When bringing on co-founders or key employees, proper agreements prevent disputes later. When raising investment, legal counsel is essential for navigating securities laws and investment documents.",
      "Finding the right attorney involves several factors. Look for experience with businesses similar to yours in industry and stage. Many attorneys offer free initial consultations—use these to assess fit and get preliminary guidance. Ask about billing structure: hourly rates, flat fees for specific services, or retainer arrangements. Small business attorneys often charge $200-500/hour, but flat-fee packages for common services like LLC formation can be more predictable.",
      "Local attorneys offer advantages for businesses operating in specific jurisdictions—they understand state-specific regulations, have relationships with local courts and agencies, and can meet face-to-face. However, for specialized needs like patent law or securities, you may need to look beyond your city. Many successful businesses maintain relationships with both a general business attorney and specialists for specific needs."
    ],
    faqs: [
      {
        question: "When should a startup hire a business attorney?",
        answer: "Ideally, consult an attorney before incorporating to ensure you choose the right business structure for your situation. At minimum, engage an attorney before signing any significant contracts (leases, partnerships, vendor agreements), bringing on co-founders or investors, or dealing with intellectual property. Many founders regret not getting legal advice earlier—fixing poorly structured agreements or entities is more expensive than getting it right initially."
      },
      {
        question: "How much does a business attorney cost?",
        answer: "Business attorneys typically charge $200-500/hour depending on location and experience. Many offer flat-fee packages for common services: LLC formation ($500-1,500), contract review ($300-1,000), trademark registration ($1,000-2,000). Some attorneys offer monthly retainer arrangements for ongoing advice. Many provide free initial consultations. For early-stage startups, some attorneys defer payment until funding or offer reduced rates in exchange for equity."
      },
      {
        question: "What's the difference between a business attorney and a corporate attorney?",
        answer: "Business attorney is a general term for lawyers who work with businesses of all sizes. Corporate attorneys specifically focus on corporations and often work with larger companies on complex transactions, mergers, securities, and governance. For most small businesses and startups, a business attorney who handles entity formation, contracts, and general business law is the right fit. As you grow or raise significant investment, you may need more specialized corporate counsel."
      },
      {
        question: "Should I use an online legal service instead of an attorney?",
        answer: "Online legal services (LegalZoom, Rocket Lawyer, etc.) can be cost-effective for simple, standard documents like basic LLC formation or standard contracts. However, they don't provide customized legal advice for your specific situation. For anything non-standard—partnership agreements, investor documents, intellectual property strategy, or complex contracts—working with an attorney who understands your business provides much better protection. Many businesses use a hybrid approach: online services for simple documents, attorney for complex or high-stakes matters."
      }
    ]
  },
  "accountant": {
    heading: "Working with Accountants & CPAs",
    content: [
      "A good accountant does far more than file taxes—they become a financial advisor who helps you understand your numbers, plan for growth, and make smarter business decisions. For most small business owners, hiring an accountant is one of the best investments you can make, saving time, avoiding costly mistakes, and often paying for themselves through tax savings and better financial management.",
      "Understanding the difference between accountants and CPAs matters. Certified Public Accountants (CPAs) have passed rigorous exams, met experience requirements, and maintain ongoing education. They can represent you before the IRS, perform audits, and provide attested financial statements. Regular accountants and bookkeepers handle day-to-day financial record keeping but may not have the same credentials. Many businesses use bookkeepers for routine work and CPAs for tax planning and compliance.",
      "Key services accountants provide include bookkeeping (recording transactions, reconciling accounts, managing payables/receivables), tax planning and preparation (minimizing tax liability within the law), financial statement preparation (income statements, balance sheets, cash flow), payroll processing, and strategic financial advice. Some specialize in specific industries or business types, bringing valuable knowledge about industry-specific deductions, benchmarks, and best practices.",
      "When choosing an accountant, look for experience with businesses similar to yours. Ask about their technology stack—cloud accounting software like QuickBooks Online or Xero enables real-time collaboration and better visibility into your finances. Understand their communication style and availability—you want someone responsive when questions arise, not just at tax time. Discuss fees upfront: expect $75-200/hour for bookkeepers, $150-400/hour for CPAs, or monthly retainer packages.",
      "The right time to engage an accountant is ideally before you launch—they can help set up proper accounting systems and advise on business structure decisions. At minimum, get professional help before your first tax filing. As your business grows, the value of good financial counsel compounds. Regular financial reviews help you understand trends, identify problems early, and make data-driven decisions."
    ],
    faqs: [
      {
        question: "What's the difference between a CPA and a regular accountant?",
        answer: "CPAs (Certified Public Accountants) have passed a rigorous exam, met state experience requirements, and maintain continuing education. They can represent you before the IRS, perform audits, and issue attested financial statements. Regular accountants or bookkeepers may be skilled professionals but lack these credentials. For tax planning, IRS issues, or audited financials, you need a CPA. For routine bookkeeping, a non-CPA accountant or bookkeeper may be sufficient and more cost-effective."
      },
      {
        question: "How much should I expect to pay for accounting services?",
        answer: "Costs vary by service type and location. Bookkeeping services typically run $200-500/month for small businesses. Tax preparation for a simple business return might cost $500-2,000; complex returns can be several thousand dollars. CPA hourly rates range from $150-400. Monthly accounting packages that include bookkeeping, payroll, and tax planning often provide the best value for growing businesses, typically $500-2,000/month depending on complexity."
      },
      {
        question: "Can I handle my own bookkeeping with software?",
        answer: "Many small business owners successfully use accounting software like QuickBooks, Xero, or FreshBooks for basic bookkeeping. However, DIY bookkeeping has risks: categorization errors, missed deductions, and compliance issues. A common approach is handling day-to-day transactions yourself while having an accountant review your books quarterly and handle tax preparation. This balances cost savings with professional oversight. As your business grows, professional bookkeeping becomes more valuable."
      },
      {
        question: "When should I switch from DIY accounting to hiring a professional?",
        answer: "Consider hiring an accountant when: your revenue exceeds $50,000-100,000, you're spending more than 5 hours/month on bookkeeping, you have employees or contractors, you're making inventory or significant equipment purchases, you're raising investment, or you simply don't understand your financial statements. The cost of professional help is usually offset by time savings, tax optimization, and better financial decisions."
      }
    ]
  },
  "marketing-agency": {
    heading: "Partnering with Marketing Agencies",
    content: [
      "Marketing agencies help businesses reach customers and grow revenue through strategic promotional activities. For small business owners who lack marketing expertise or time, the right agency partnership can accelerate growth significantly. However, the marketing agency landscape is crowded with varying quality—understanding what to look for and how to work effectively with agencies is essential.",
      "Marketing agencies specialize in different areas. Full-service agencies handle everything from strategy to execution across multiple channels. Digital marketing agencies focus on online channels: SEO, paid ads, social media, email, and content marketing. Creative agencies emphasize branding, design, and advertising creative. PR agencies manage media relations and public perception. Many small businesses start with specialists in one or two channels before expanding.",
      "Choosing the right agency starts with clarity on your goals. Are you trying to generate leads, build brand awareness, launch a product, or enter a new market? Different objectives require different capabilities. Ask potential agencies about their experience with businesses similar to yours—same industry, similar size, comparable budgets. Request case studies with specific results and references you can contact.",
      "Understanding agency pricing models matters. Retainer arrangements provide ongoing services for a monthly fee, typically $2,000-10,000+ for small businesses. Project-based pricing covers specific deliverables like a website redesign or campaign launch. Performance-based models tie compensation to results, though these come with trade-offs. Be wary of agencies that won't explain how they'll spend your budget or can't articulate expected outcomes.",
      "Successful agency relationships require clear communication and realistic expectations. Define success metrics upfront. Establish regular check-ins and reporting cadences. Understand that marketing results rarely happen overnight—most channels require 3-6 months to show meaningful results. The best agencies will be honest about what's achievable with your budget and timeline rather than over-promising. Start with a smaller engagement to test the relationship before committing to long-term contracts."
    ],
    faqs: [
      {
        question: "How much should a small business budget for marketing?",
        answer: "A common guideline is 5-10% of revenue for established businesses maintaining their position, or 10-20% for businesses actively growing or launching new products. For early-stage businesses without significant revenue, budget what you can sustainably invest while testing channels. Agency retainers for small businesses typically start around $2,000-5,000/month. Factor in ad spend separately—agencies manage the strategy, but paid advertising requires additional budget for the platforms themselves."
      },
      {
        question: "What results should I expect from a marketing agency?",
        answer: "Realistic expectations depend on your goals and channels. SEO typically takes 6-12 months to show significant results. Paid advertising can generate immediate traffic, but optimization takes 2-3 months. Content marketing and social media build over time. Any agency promising guaranteed results or overnight success is a red flag. Good agencies will establish baseline metrics, set realistic targets, and provide regular reporting on progress. Ask about typical results for clients similar to you."
      },
      {
        question: "Should I hire a marketing agency or build an in-house team?",
        answer: "For most small businesses, agencies offer advantages: immediate access to expertise across multiple disciplines, no hiring/training overhead, and easier scalability. In-house makes more sense when marketing is central to your business model, when you have enough work to justify full-time staff, or when deep institutional knowledge matters. Many businesses use a hybrid approach: in-house for strategy and day-to-day execution, agencies for specialized services or campaigns."
      },
      {
        question: "What should I look for in a marketing agency contract?",
        answer: "Key contract elements include: clear scope of work and deliverables, pricing and payment terms, reporting and communication expectations, intellectual property ownership (you should own creative work product), minimum commitment period (avoid long lock-ins initially), termination clauses (30-60 day notice is reasonable), and confidentiality provisions. Avoid contracts with automatic renewals without your approval or unclear ownership of ad accounts and creative assets."
      }
    ]
  },
  "print-shop": {
    heading: "Working with Print Shops",
    content: [
      "Print shops provide essential services for businesses that need physical marketing materials, signage, packaging, and promotional items. While digital marketing dominates many conversations, printed materials remain powerful tools for local businesses, events, trade shows, and brand building. Understanding print shop capabilities helps you get quality results at fair prices.",
      "Print shops vary in their specializations. Commercial printers handle high-volume jobs like brochures, catalogs, and direct mail. Quick print shops focus on fast turnaround for business cards, flyers, and small runs. Large format printers produce banners, signage, vehicle wraps, and trade show displays. Specialty printers offer unique services like embossing, foil stamping, or custom packaging. Some shops are full-service while others specialize in specific products.",
      "Understanding print terminology helps you communicate effectively. Resolution (DPI/PPI) affects image quality—300 DPI is standard for print. CMYK color mode is used for printing, while RGB is for screens. Bleeds extend artwork past the trim line to avoid white edges. Paper stock varies by weight (measured in pounds or GSM) and finish (matte, gloss, uncoated). Proofs are test prints to verify colors and layout before the full run.",
      "Getting accurate quotes requires providing complete specifications. Quantity affects pricing significantly—per-unit costs drop with larger runs. Paper stock, size, number of colors, and finishing (folding, binding, coating) all impact price. Turnaround time matters—rush jobs cost more. Request quotes from multiple shops for comparison, but don't choose solely on price—quality and reliability matter. Ask to see samples of similar work.",
      "Building a relationship with a reliable print shop pays dividends. They'll learn your brand standards, catch errors before printing, and may offer better pricing for repeat customers. Provide print-ready files when possible to avoid setup charges. Allow adequate time—rushed timelines lead to mistakes and premium pricing. Review proofs carefully before approving—once printed, errors are expensive to fix."
    ],
    faqs: [
      {
        question: "How do I prepare files for printing?",
        answer: "For best results: use CMYK color mode (not RGB), set resolution to 300 DPI minimum, include bleeds (usually 0.125 inches) for edge-to-edge printing, convert fonts to outlines or embed them, and save in PDF format. Most print shops provide file specifications and templates. If you're using design software like Canva, use their print-ready export options. When in doubt, ask your print shop for their specific requirements—they'd rather help upfront than fix problems later."
      },
      {
        question: "What's the difference between digital and offset printing?",
        answer: "Digital printing prints directly from files with no setup, making it cost-effective for small runs (under 500-1,000 pieces) and variable data printing. Offset printing uses plates and is more economical for large runs with lower per-unit costs at high volumes. Offset traditionally offered better color accuracy, though digital quality has improved significantly. For most small business needs—business cards, brochures, flyers—digital printing works well and offers faster turnaround."
      },
      {
        question: "How much do common print materials cost?",
        answer: "Costs vary by quantity, quality, and location. Rough estimates: business cards ($30-100 for 500), brochures ($200-500 for 1,000 tri-fold), flyers ($150-300 for 1,000), banners ($50-150 for a standard size), postcards ($100-250 for 1,000). Large format and specialty printing costs more. Get quotes for your specific needs—quantity discounts can be significant. Compare total cost including shipping rather than just per-unit price."
      },
      {
        question: "How far in advance should I order print materials?",
        answer: "Standard turnaround for simple jobs is 3-7 business days. Complex jobs, large runs, or specialty printing may take 2-3 weeks. Add shipping time if materials are being delivered. For important events or launches, order at least 2-3 weeks ahead to allow for proofing, revisions, and unexpected delays. Rush services are available but cost significantly more. Building a relationship with a local printer can help when you need faster turnaround."
      }
    ]
  },
  "commercial-real-estate": {
    heading: "Finding Commercial Real Estate",
    content: [
      "Finding the right commercial space—whether retail storefront, office, warehouse, or industrial—is one of the most significant decisions a business will make. Location affects customer access, operational efficiency, employee recruitment, and brand perception. Understanding commercial real estate basics helps you navigate this complex market and find space that supports your business goals.",
      "Commercial real estate comes in several categories. Office space ranges from traditional buildings to modern flex spaces and executive suites. Retail includes storefronts, shopping centers, and pop-up locations. Industrial encompasses warehouses, distribution centers, and manufacturing facilities. Mixed-use properties combine residential and commercial space. Each type has different lease structures, zoning considerations, and cost factors.",
      "Commercial leases differ significantly from residential. Terms typically run 3-10 years, though shorter terms may be available at premium rates. Understand the lease structure: gross leases include most expenses in the base rent; net leases (NNN) add property taxes, insurance, and maintenance on top of base rent. Common Area Maintenance (CAM) charges cover shared space upkeep. Build-out allowances (Tenant Improvement or TI) may be negotiated for customization.",
      "Working with a commercial real estate agent costs you nothing as a tenant—landlords pay the commission. A good agent knows the market, has access to off-market listings, and can negotiate favorable terms. Look for agents who specialize in your property type and understand your business needs. They can help you compare true occupancy costs, understand lease terms, and avoid common pitfalls.",
      "Before committing to space, consider growth projections—can you expand in the building if successful? Understand zoning and use restrictions—can you legally operate your business there? Assess parking, accessibility, and visibility. Review the landlord's reputation with current or former tenants. Factor in all costs: rent, utilities, buildout, signage, parking. Getting the right space at the right terms sets your business up for success; the wrong space can drain resources and limit your potential."
    ],
    faqs: [
      {
        question: "How much should a small business budget for commercial rent?",
        answer: "A common guideline is that rent should not exceed 5-10% of gross revenue for most businesses. However, this varies significantly by industry—retail businesses with high foot traffic may justify higher rent percentages. Consider total occupancy cost, not just base rent: add utilities, CAM charges, insurance, and maintenance. In addition to monthly costs, budget for security deposits (often 2-3 months rent), first and last month's rent, and any build-out costs."
      },
      {
        question: "What's the difference between a gross lease and a triple net (NNN) lease?",
        answer: "In a gross lease, the landlord includes most operating expenses (taxes, insurance, maintenance) in the base rent—you pay one predictable amount. In a triple net (NNN) lease, you pay base rent plus your share of property taxes, building insurance, and common area maintenance separately. NNN leases appear cheaper but total costs can be comparable or higher. Modified gross leases fall in between. Always calculate total occupancy cost to compare options fairly."
      },
      {
        question: "Should I use a commercial real estate agent?",
        answer: "Yes, for most businesses. Tenant representation costs you nothing—landlords pay the commission. A good commercial agent knows the market, has access to listings you won't find online, understands lease terms, and negotiates on your behalf. They can help you compare true costs across different properties and lease structures. Look for agents specializing in your property type (retail, office, industrial) who understand your business needs."
      },
      {
        question: "What should I negotiate in a commercial lease?",
        answer: "Key negotiation points include: rent rate and escalation clauses (how much rent increases annually), lease term and renewal options, tenant improvement allowance for build-out, rent abatement periods (free rent during build-out or ramping up), personal guarantee limitations (especially important for LLCs), subleasing rights, signage rights, parking allocations, exclusive use clauses (preventing competing tenants), and termination or exit clauses. Everything is negotiable—don't accept the first offer."
      }
    ]
  },
  "business-insurance": {
    heading: "Understanding Business Insurance",
    content: [
      "Business insurance protects your company from financial losses due to accidents, lawsuits, property damage, and other risks. While it might seem like an expense you can defer, operating without proper coverage puts everything you've built at risk. Understanding the types of coverage available helps you make informed decisions about protecting your business.",
      "Several types of business insurance are commonly needed. General liability insurance covers third-party claims for bodily injury or property damage—essential for any business with customers, clients, or public interactions. Professional liability (errors and omissions) protects service businesses against claims of negligence or inadequate work. Property insurance covers your physical assets, inventory, and equipment. Workers' compensation is required in most states if you have employees.",
      "Additional coverage types depend on your business model. Commercial auto insurance covers vehicles used for business. Cyber liability protects against data breaches and cyber attacks. Business interruption insurance replaces income if you can't operate due to a covered event. Product liability is essential if you manufacture or sell physical products. Directors and officers (D&O) insurance protects leadership from personal liability for business decisions.",
      "Insurance costs vary based on your industry, revenue, number of employees, coverage limits, and claims history. A home-based consultant might pay $500-1,500/year for basic coverage. A retail store might pay $2,000-5,000. Restaurants and contractors with higher liability risks pay more. Bundle policies (Business Owner's Policy or BOP) often provide better value than purchasing separately. Deductibles affect premiums—higher deductibles mean lower premiums but more out-of-pocket when claims occur.",
      "Work with an insurance agent who understands small business needs. Independent agents can compare policies from multiple carriers. Discuss your specific risks and operations so they can recommend appropriate coverage. Review policies annually as your business changes. Understand what's covered and what's excluded—the cheapest policy isn't always the best value if it leaves significant gaps in protection."
    ],
    faqs: [
      {
        question: "What business insurance do I legally need?",
        answer: "Requirements vary by state and business type. Workers' compensation is required in most states if you have employees. Commercial auto insurance is required for business vehicles. Some industries require professional liability insurance. Beyond legal requirements, general liability insurance is essential for most businesses—landlords often require it, and clients may require proof of coverage. Consult with an insurance agent about requirements for your specific situation."
      },
      {
        question: "How much does small business insurance cost?",
        answer: "Costs vary significantly by coverage type and business risk. General liability for a low-risk business might cost $300-600/year. Professional liability ranges from $500-3,000/year. A Business Owner's Policy (BOP) bundling property and liability typically costs $500-3,000/year for small businesses. High-risk industries (restaurants, construction, healthcare) pay considerably more. Get quotes from multiple carriers and consider working with an independent agent who can compare options."
      },
      {
        question: "What's a Business Owner's Policy (BOP)?",
        answer: "A BOP bundles general liability and commercial property insurance into a single policy, typically at a lower cost than purchasing separately. Most BOPs include business interruption coverage as well. They're designed for small to mid-sized businesses and offer convenient, cost-effective basic protection. However, BOPs have limitations—you may need additional policies for professional liability, cyber coverage, workers' comp, or industry-specific risks."
      },
      {
        question: "Do I need insurance if I work from home?",
        answer: "Yes—your homeowner's or renter's insurance typically doesn't cover business activities. If you have clients visit, use business equipment, store inventory, or conduct any business operations at home, you need coverage. At minimum, consider a home-based business endorsement to your homeowner's policy, or a separate business policy. Professional liability is especially important for consultants and service providers working from home."
      }
    ]
  },
  "chamber-of-commerce": {
    heading: "Joining Your Chamber of Commerce",
    content: [
      "Chambers of commerce are membership organizations that advocate for local businesses and provide networking, resources, and community connections. While sometimes seen as old-fashioned, chambers remain valuable for many businesses—particularly those serving local markets or seeking to build community presence. Understanding what chambers offer helps you decide if membership makes sense for your business.",
      "Chambers vary significantly in size and focus. Major metropolitan chambers may have thousands of members and substantial staffs providing sophisticated programming. Small-town chambers might operate with volunteer leadership and more limited offerings. Some chambers focus on advocacy and government relations, others on networking and events, still others on business resources and education. Research your local chamber to understand what they actually provide.",
      "Common chamber benefits include networking events (mixers, luncheons, after-hours events), member directories and referral opportunities, business education and workshops, advertising in chamber publications, use of chamber meeting facilities, group purchasing programs for insurance or office supplies, and advocacy on business-friendly policies. Some chambers offer programs specifically for small businesses, women-owned businesses, or specific industries.",
      "Membership costs vary widely—from $200/year for basic small business membership to several thousand for larger businesses or premium tiers. Many chambers offer tiered membership with additional benefits at higher levels, including sponsorship opportunities and committee leadership roles. Calculate the value by considering which benefits you'll actually use. Networking and referral benefits often deliver the most value for small businesses.",
      "Getting value from chamber membership requires active participation. Simply paying dues rarely produces results. Attend events regularly. Volunteer for committees that align with your interests. Build genuine relationships rather than just collecting business cards. Give referrals to other members. The businesses that benefit most from chambers are those that invest time and engagement, not just money."
    ],
    faqs: [
      {
        question: "Is chamber of commerce membership worth it for small businesses?",
        answer: "It depends on your business model and how actively you'll participate. Chambers provide the most value for businesses serving local markets (retail, restaurants, professional services), businesses where referrals matter, and owners who will actually attend events and build relationships. If you're an online business with national customers or unlikely to participate in networking, chamber membership may not deliver sufficient ROI. Many chambers offer trial memberships or allow you to attend events before joining."
      },
      {
        question: "How much does chamber membership cost?",
        answer: "Membership fees vary by chamber and business size. Small business memberships typically range from $200-500/year. Mid-sized businesses might pay $500-1,500. Large businesses and premium memberships can cost several thousand dollars. Most chambers offer tiered membership levels with additional benefits at higher tiers, including sponsorship opportunities, event tickets, and committee leadership roles. Compare the benefits at each level to determine the best value."
      },
      {
        question: "What's the difference between a chamber of commerce and a business association?",
        answer: "Chambers of commerce are typically geographically focused—representing businesses in a city, county, or region regardless of industry. Business associations (also called trade associations) are industry-focused—representing a specific type of business (restaurants, retailers, manufacturers) regardless of location. Some businesses join both. Chambers excel at local networking and community presence; trade associations provide industry-specific resources, advocacy, and peer connections."
      },
      {
        question: "How do I get the most value from chamber membership?",
        answer: "Active participation is key. Attend events regularly—consistency builds relationships. Volunteer for committees aligned with your interests and expertise. Use the member directory for referrals and introductions. Promote your membership (chamber logos, member listings) for credibility. Give before you ask—refer business to other members. Consider sponsoring events for visibility. Track your engagement and results to evaluate ROI. The members who benefit most treat chambers as relationship-building opportunities, not just directories."
      }
    ]
  },
  "virtual-office": {
    heading: "Using Virtual Office Services",
    content: [
      "Virtual offices provide professional business amenities—mailing addresses, phone services, meeting rooms—without the cost of traditional office space. For remote workers, home-based businesses, and companies establishing presence in new markets, virtual offices offer flexibility and professional credibility. Understanding the options helps you choose services that match your needs.",
      "Core virtual office services include professional business addresses for mail receipt, mail handling and forwarding, business phone numbers with answering services, and access to meeting rooms or day offices when needed. Some providers offer additional services like live receptionists, administrative support, and coworking access. Packages range from basic mail-only services to comprehensive solutions mimicking a full-service executive suite.",
      "A professional business address offers several benefits. It separates your business from your home address, providing privacy and professionalism. It enables business registration in locations where you don't have physical presence. It creates credibility with clients who may be wary of home-based businesses. Some addresses in prestigious locations or buildings may enhance your brand perception.",
      "Virtual office costs typically range from $50-300/month depending on location and services included. Basic mail handling might cost $50-100/month. Add phone answering services for another $50-150/month. Meeting room access often comes with limited hours included, with additional hours available for purchase. Consider the true costs: mail forwarding fees, per-minute charges for phone services, and meeting room rates can add up.",
      "When choosing a virtual office provider, consider location—is it convenient for occasional in-person meetings? How professional is the address and building? What are the specific mail handling procedures and turnaround times? How does phone answering work, and how professional are the receptionists? Are meeting rooms modern and well-equipped? Visit the facility before committing. The cheapest option isn't always the best if it undermines your professional image."
    ],
    faqs: [
      {
        question: "Can I use a virtual office address to register my business?",
        answer: "Generally yes, but with caveats. Most states allow virtual office addresses for business registration, but some states require a registered agent with a physical address in that state. Banks may require additional verification when opening accounts for businesses using virtual addresses. Some professional licenses require physical office presence. Check specific requirements for your state and industry before committing. A reputable virtual office provider can often advise on what's permissible."
      },
      {
        question: "How much does a virtual office cost?",
        answer: "Virtual office pricing varies by location and services. Basic mail handling starts around $50-75/month. Mid-tier packages with a premium address and phone services run $100-200/month. Comprehensive packages including live receptionist and meeting room hours can cost $200-400+/month. Location matters—a Manhattan address costs more than a suburban one. Watch for additional fees: mail forwarding, package handling, phone minutes, and meeting room overages."
      },
      {
        question: "What's the difference between a virtual office and a coworking membership?",
        answer: "Virtual offices provide business services (address, mail, phone) without dedicated workspace—you work elsewhere. Coworking memberships provide actual workspace (hot desk, dedicated desk, or private office) in a shared environment. Some providers offer both, or hybrid packages combining virtual office services with limited coworking access. Choose based on whether you need a place to work or just business services and occasional meeting space."
      },
      {
        question: "Will clients know I'm using a virtual office?",
        answer: "Professional virtual offices shouldn't be obviously identifiable as such. Quality providers use prestigious addresses in real office buildings, not PO boxes. Phone answering services respond with your company name professionally. Meeting rooms should be well-appointed and suitable for client meetings. However, if clients visit frequently or expect dedicated office space, a virtual office may not be appropriate. Be honest about your setup if asked directly—most clients understand and accept remote and flexible work arrangements."
      }
    ]
  },
  "business-consultant": {
    heading: "Working with Business Consultants",
    content: [
      "Business consultants help companies solve problems, improve operations, and accelerate growth by bringing outside expertise and perspective. Whether you're struggling with a specific challenge or seeking to take your business to the next level, the right consultant can provide valuable guidance. Understanding how consulting relationships work helps you get maximum value from the engagement.",
      "Consultants specialize in different areas. Strategy consultants help with business planning, market entry, and competitive positioning. Operations consultants optimize processes, supply chains, and efficiency. Marketing consultants develop customer acquisition and brand strategies. Financial consultants address cash flow, pricing, fundraising, and financial planning. HR consultants help with hiring, culture, and organizational development. Some consultants are generalists who work across multiple areas with small businesses.",
      "Consultants typically work in several formats. Project-based engagements address specific problems or initiatives with defined deliverables. Retainer arrangements provide ongoing access to expertise for a monthly fee. Advisory relationships offer periodic guidance without hands-on implementation. Some consultants offer intensive workshops or assessments. Choose a format that matches your needs—complex transformations need sustained engagement; specific questions might need just a few hours.",
      "Consultant costs vary widely based on expertise and engagement type. Independent consultants working with small businesses might charge $100-300/hour or $1,000-5,000 for short projects. Established firms charge $200-500/hour or more. Retainer arrangements provide predictable monthly costs, typically $1,000-5,000 for small business engagements. Always discuss fees upfront and understand what's included. The cheapest option isn't always the best value if they lack relevant experience.",
      "Getting value from consulting relationships requires clarity and collaboration. Define your goals and expected outcomes before engaging. Choose consultants with relevant experience in your industry or problem area. Be honest about your situation—consultants can't help if they don't understand the real challenges. Implement recommendations—the best advice is worthless without action. Maintain communication and provide feedback throughout the engagement. The most successful consulting relationships are partnerships where both sides are invested in results."
    ],
    faqs: [
      {
        question: "When should a small business hire a consultant?",
        answer: "Consider hiring a consultant when: you face a specific challenge outside your expertise (entering new markets, improving operations, raising capital), you need objective outside perspective on your business, you're stuck and need to break through a growth plateau, you have a one-time need that doesn't justify a full-time hire, or you want to accelerate results by leveraging proven expertise. Consultants make less sense for ongoing operational needs better suited to employees or when you can't clearly articulate the problem you need help solving."
      },
      {
        question: "How much do business consultants charge?",
        answer: "Consultant fees vary significantly. Independent consultants working with small businesses typically charge $100-300/hour. Established consulting firms may charge $200-500/hour or more. Project-based fees depend on scope—expect $2,000-10,000+ for defined projects. Monthly retainer arrangements for ongoing advisory typically run $1,000-5,000 for small businesses. Always discuss fees upfront, understand what's included, and get agreements in writing. Consider value relative to results rather than just comparing hourly rates."
      },
      {
        question: "How do I choose the right business consultant?",
        answer: "Look for: relevant experience with similar businesses or problems (ask for specific examples and references), clear explanation of their approach and methodology, chemistry and communication style that works for you, transparent pricing and clear agreements, and realistic expectations about what they can deliver. Avoid consultants who promise guaranteed results, won't provide references, or can't clearly explain how they'll help. A good fit matters as much as credentials—you'll be sharing sensitive business information."
      },
      {
        question: "What should I expect from a consulting engagement?",
        answer: "Expect an initial discovery phase where the consultant learns about your business and clarifies goals. They should provide clear recommendations or deliverables based on analysis. For implementation engagements, expect regular check-ins, progress tracking, and adjustments as needed. Good consultants are responsive, meet commitments, and proactively communicate. You should see measurable progress toward defined goals. If you're not getting value, address it directly—reputable consultants want successful outcomes and will adjust their approach."
      }
    ]
  }
};

// Get category-specific icon color
function getIconColorClass(category: string): string {
  switch (category) {
    case "grant":
      return "from-green-400 to-green-600";
    case "coworking":
      return "from-blue-400 to-blue-600";
    case "accelerator":
      return "from-orange-400 to-orange-600";
    case "sba":
      return "from-red-400 to-red-600";
    case "business-attorney":
      return "from-violet-400 to-violet-600";
    case "accountant":
      return "from-teal-400 to-teal-600";
    case "marketing-agency":
      return "from-pink-400 to-pink-600";
    case "print-shop":
      return "from-amber-400 to-amber-600";
    case "commercial-real-estate":
      return "from-sky-400 to-sky-600";
    case "business-insurance":
      return "from-lime-400 to-lime-600";
    case "chamber-of-commerce":
      return "from-rose-400 to-rose-600";
    case "virtual-office":
      return "from-fuchsia-400 to-fuchsia-600";
    case "business-consultant":
      return "from-indigo-400 to-indigo-600";
    default:
      return "from-gray-400 to-gray-600";
  }
}

// Get category-specific border/shadow color
function getCategoryAccentClasses(category: string): string {
  switch (category) {
    case "grant":
      return "border-green-100/50 shadow-[0_4px_20px_-4px_rgba(22,163,74,0.15)]";
    case "coworking":
      return "border-blue-100/50 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.15)]";
    case "accelerator":
      return "border-orange-100/50 shadow-[0_4px_20px_-4px_rgba(234,88,12,0.15)]";
    case "sba":
      return "border-red-100/50 shadow-[0_4px_20px_-4px_rgba(220,38,38,0.15)]";
    case "business-attorney":
      return "border-violet-100/50 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.15)]";
    case "accountant":
      return "border-teal-100/50 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.15)]";
    case "marketing-agency":
      return "border-pink-100/50 shadow-[0_4px_20px_-4px_rgba(236,72,153,0.15)]";
    case "print-shop":
      return "border-amber-100/50 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.15)]";
    case "commercial-real-estate":
      return "border-sky-100/50 shadow-[0_4px_20px_-4px_rgba(14,165,233,0.15)]";
    case "business-insurance":
      return "border-lime-100/50 shadow-[0_4px_20px_-4px_rgba(132,204,22,0.15)]";
    case "chamber-of-commerce":
      return "border-rose-100/50 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.15)]";
    case "virtual-office":
      return "border-fuchsia-100/50 shadow-[0_4px_20px_-4px_rgba(217,70,239,0.15)]";
    case "business-consultant":
      return "border-indigo-100/50 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)]";
    default:
      return "border-gray-100/50 shadow-[0_4px_20px_-4px_rgba(107,114,128,0.15)]";
  }
}

interface CategoryGuideContentProps {
  category: ResourceCategory;
}

export default function CategoryGuideContent({ category }: CategoryGuideContentProps) {
  const guide = CATEGORY_GUIDES[category];

  // If no guide content for this category, don't render anything
  if (!guide) {
    return null;
  }

  // Build FAQ JSON-LD structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": guide.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* FAQ Schema Structured Data */}
      <Script
        id={`faq-schema-${category}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Guide Content Section */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`bg-white/80 rounded-xl p-6 md:p-8 border ${getCategoryAccentClasses(category)}`}>
            {/* Heading with icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getIconColorClass(category)} flex items-center justify-center flex-shrink-0`}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-gray-900">
                {guide.heading}
              </h2>
            </div>

            {/* Guide paragraphs */}
            <div className="space-y-4 mb-8">
              {guide.content.map((paragraph, index) => (
                <p key={index} className="text-[15px] text-slate-600 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm uppercase tracking-wide text-slate-500 font-medium mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {guide.faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-gray-50 rounded-lg"
                  >
                    <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="pr-4">{faq.question}</span>
                      <svg
                        className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-4 pb-4 text-[15px] text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
