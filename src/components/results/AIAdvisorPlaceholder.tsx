"use client";

interface AIAdvisorPlaceholderProps {
  ideaName?: string;
}

export default function AIAdvisorPlaceholder({ ideaName }: AIAdvisorPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-spark/20 to-accent/20 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="font-display text-2xl font-bold text-warmwhite text-center mb-2">
        AI Business Advisor
      </h2>
      <span className="text-spark text-sm font-medium px-3 py-1 bg-spark/10 rounded-full mb-6">
        Coming Soon
      </span>

      {/* Description */}
      <p className="text-warmwhite-muted text-center max-w-md mb-8">
        Get personalized guidance from an AI advisor who knows everything about your business plan,
        local resources, and market research.
      </p>

      {/* Feature Preview */}
      <div className="w-full max-w-lg space-y-4">
        <h3 className="text-sm font-medium text-warmwhite-dim uppercase tracking-wider text-center">
          What you&apos;ll be able to ask
        </h3>

        <div className="grid gap-3">
          {[
            {
              question: "Walk me through registering my LLC",
              description: "Step-by-step guidance with links for your state",
            },
            {
              question: "Help me write a cold email to potential customers",
              description: "Personalized templates based on your target audience",
            },
            {
              question: "What permits do I need for my business?",
              description: "Location and business-specific requirements",
            },
            {
              question: "How should I price my product?",
              description: "Analysis based on your competitors and costs",
            },
            {
              question: "Help me prepare for my first sales call",
              description: "Scripts and talking points tailored to your pitch",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-charcoal-light rounded-xl p-4 flex items-start gap-3 opacity-75"
            >
              <div className="w-8 h-8 rounded-full bg-spark/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-spark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-warmwhite text-sm font-medium">&ldquo;{item.question}&rdquo;</p>
                <p className="text-warmwhite-dim text-xs mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Context note */}
      <div className="mt-8 bg-spark/10 border border-spark/20 rounded-xl p-4 max-w-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-spark flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-warmwhite text-sm font-medium">Full Context Awareness</p>
            <p className="text-warmwhite-muted text-xs mt-1">
              Unlike generic AI, this advisor will know your specific business plan, your local
              resources in your city, your financial projections, and your target customers.
              Every answer is tailored to {ideaName ? `"${ideaName}"` : "your idea"}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
