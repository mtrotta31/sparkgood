// Terms of Service Page
// Basic template for legal compliance

import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | SparkLocal",
  description: "SparkLocal terms of service - the rules and guidelines for using our platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-warmwhite-dim text-sm mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Agreement to Terms
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                By accessing or using SparkLocal (&ldquo;the Service&rdquo;), you agree to be bound
                by these Terms of Service. If you do not agree to these terms, please do not
                use our Service.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Description of Service
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                SparkLocal is a platform that helps users start businesses by providing
                AI-powered planning tools and a directory of local business resources
                including coworking spaces, grants, accelerators, and mentorship programs.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                User Accounts
              </h2>
              <p className="text-warmwhite-muted leading-relaxed mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-warmwhite-muted space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activity under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Acceptable Use
              </h2>
              <p className="text-warmwhite-muted leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-warmwhite-muted space-y-2 ml-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Submit false or misleading information</li>
                <li>Distribute spam, malware, or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use the Service for any illegal or fraudulent purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Intellectual Property
              </h2>
              <p className="text-warmwhite-muted leading-relaxed mb-4">
                <strong>Our Content:</strong> The Service and its original content, features,
                and functionality are owned by SparkLocal and are protected by international
                copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-warmwhite-muted leading-relaxed">
                <strong>Your Content:</strong> You retain ownership of ideas, plans, and other
                content you create using our Service. By using the Service, you grant us a
                license to store and process your content as necessary to provide the Service.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                AI-Generated Content
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                Our Service uses artificial intelligence to generate ideas, plans, and other
                content. While we strive for accuracy, AI-generated content is provided
                &ldquo;as is&rdquo; without warranties of any kind. You are responsible for
                reviewing and verifying any information before relying on it for business
                or legal decisions.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Payment Terms
              </h2>
              <p className="text-warmwhite-muted leading-relaxed mb-4">
                For paid features:
              </p>
              <ul className="list-disc list-inside text-warmwhite-muted space-y-2 ml-4">
                <li>Payments are processed securely through Stripe</li>
                <li>Subscription fees are billed in advance on a recurring basis</li>
                <li>One-time purchases are non-refundable except as required by law</li>
                <li>You may cancel your subscription at any time</li>
                <li>We reserve the right to change pricing with reasonable notice</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Resource Directory
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                Our business resource directory is provided for informational purposes only.
                We do not endorse, guarantee, or verify the accuracy of any listings. You
                should independently verify any information before making business decisions.
                Inclusion in our directory does not constitute a recommendation.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Disclaimer of Warranties
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT
                WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
                ERROR-FREE, OR SECURE.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Limitation of Liability
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPARKGOOD SHALL NOT BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF
                THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US
                IN THE PAST 12 MONTHS.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Indemnification
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                You agree to indemnify and hold harmless SparkLocal and its officers, directors,
                employees, and agents from any claims, damages, losses, or expenses arising
                from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Termination
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                We may terminate or suspend your access to the Service at any time, with or
                without cause, with or without notice. Upon termination, your right to use
                the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Governing Law
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws
                of the State of Delaware, United States, without regard to its conflict of
                law provisions.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Changes to Terms
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users
                of any material changes by posting the updated Terms on this page. Your
                continued use of the Service after changes constitutes acceptance of the
                new Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-warmwhite mb-4">
                Contact Us
              </h2>
              <p className="text-warmwhite-muted leading-relaxed">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-warmwhite mt-4">
                legal@sparklocal.co
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
