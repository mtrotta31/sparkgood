// Privacy Policy Page
// Basic template for legal compliance

import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | SparkLocal",
  description: "SparkLocal privacy policy - how we collect, use, and protect your data.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  const lastUpdated = "February 19, 2026";

  return (
    <main className="min-h-screen bg-charcoal-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal-dark/90 backdrop-blur-sm border-b border-warmwhite/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center">
              <span className="text-sm">✦</span>
            </div>
            <span className="font-display text-warmwhite font-semibold">
              SparkLocal
            </span>
          </Link>
          <Link
            href="/builder"
            className="px-5 py-2 bg-spark hover:bg-spark-600 text-charcoal-dark font-semibold rounded-full transition-colors text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-warmwhite mb-4">
            Privacy Policy
          </h1>
          <p className="text-warmwhite-dim text-sm mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Overview
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                SparkLocal (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your
                privacy and is committed to protecting your personal data. This privacy policy
                explains how we collect, use, and safeguard your information when you use
                our website and services at sparklocal.co.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Information We Collect
              </h2>
              <p className="text-warmwhite-muted leading-relaxed mb-4">
                We collect information you provide directly to us:
              </p>
              <ul className="list-disc list-inside text-warmwhite-muted space-y-2 ml-4">
                <li>Account information (email address) when you create an account</li>
                <li>Profile preferences you select during the idea generation process</li>
                <li>Ideas and plans you save to your account</li>
                <li>Payment information when you make a purchase (processed securely by Stripe)</li>
              </ul>
              <p className="text-warmwhite-muted leading-relaxed mt-4">
                We also automatically collect certain information:
              </p>
              <ul className="list-disc list-inside text-warmwhite-muted space-y-2 ml-4">
                <li>Usage data (pages visited, features used)</li>
                <li>Device information (browser type, operating system)</li>
                <li>Log data (IP address, access times)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                How We Use Your Information
              </h2>
              <p className="text-warmwhite-muted leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-warmwhite-muted space-y-2 ml-4">
                <li>Provide and improve our services</li>
                <li>Generate personalized social impact ideas based on your preferences</li>
                <li>Process payments and manage your subscription</li>
                <li>Send important updates about your account or our services</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Protect against fraud and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Data Sharing
              </h2>
              <p className="text-warmwhite-muted leading-relaxed mb-4">
                We do not sell your personal information. We may share your data with:
              </p>
              <ul className="list-disc list-inside text-warmwhite-muted space-y-2 ml-4">
                <li>
                  <strong>Service providers:</strong> Third parties that help us operate our
                  services (hosting, payment processing, analytics)
                </li>
                <li>
                  <strong>Legal requirements:</strong> When required by law or to protect our rights
                </li>
                <li>
                  <strong>Business transfers:</strong> In connection with a merger or acquisition
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Data Security
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                We implement industry-standard security measures to protect your data. Your
                password is encrypted, and payment information is handled securely by Stripe.
                However, no method of transmission over the internet is 100% secure, and we
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Your Rights
              </h2>
              <p className="text-warmwhite-muted leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-warmwhite-muted space-y-2 ml-4">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
              </ul>
              <p className="text-warmwhite-muted leading-relaxed mt-4">
                To exercise these rights, contact us at privacy@sparklocal.co.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Cookies
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                We use essential cookies to maintain your session and remember your preferences.
                We may also use analytics cookies to understand how you use our services. You
                can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Children&apos;s Privacy
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                Our services are not directed to children under 13. We do not knowingly collect
                personal information from children under 13. If you believe we have collected
                such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Changes to This Policy
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the &ldquo;last
                updated&rdquo; date.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Contact Us
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                If you have questions about this privacy policy or our data practices, please
                contact us at:
              </p>
              <p className="text-warmwhite mt-4">
                privacy@sparklocal.co
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
