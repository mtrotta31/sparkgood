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
