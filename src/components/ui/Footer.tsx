// Site Footer Component
// Used across all pages for consistent navigation and legal links

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-warmwhite/10 bg-charcoal-dark">
      <div className="max-w-6xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center">
                <span className="text-sm">✦</span>
              </div>
              <span className="font-display text-warmwhite font-semibold">
                SparkGood
              </span>
            </Link>
            <p className="text-warmwhite-dim text-sm">
              Turning good intentions into real impact.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-warmwhite font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/builder"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  Idea Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  My Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-warmwhite font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/resources"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  Business Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/grant"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  Grants
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/accelerator"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  Accelerators
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/sba"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  SBA Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-warmwhite font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-warmwhite-muted hover:text-spark transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-warmwhite/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-warmwhite-dim text-sm">
            © {new Date().getFullYear()} SparkGood. All rights reserved.
          </p>
          <p className="text-warmwhite-dim text-xs">
            Made with purpose in the USA
          </p>
        </div>
      </div>
    </footer>
  );
}
