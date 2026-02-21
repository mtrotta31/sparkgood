// Directory Footer (Light Theme)
// Warm, friendly footer for the resource directory

import Link from "next/link";

export default function DirectoryFooter() {
  return (
    <footer className="py-16 px-4 border-t border-slate-200 bg-cream-dark">
      <div className="max-w-6xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center shadow-warm">
                <span className="text-white text-sm font-medium">S</span>
              </div>
              <span className="font-display text-xl text-slate-800 font-semibold">
                SparkLocal
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed">
              Everything you need to start a business in your city.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-slate-800 font-semibold mb-4 text-sm uppercase tracking-wide">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/builder"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  Business Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  My Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-slate-800 font-semibold mb-4 text-sm uppercase tracking-wide">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/resources"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  All Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/grant"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  Grants
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/coworking"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  Coworking Spaces
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/accelerator"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  Accelerators
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/sba"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  SBA Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-slate-800 font-semibold mb-4 text-sm uppercase tracking-wide">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 hover:text-spark transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} SparkLocal. All rights reserved.
          </p>
          <p className="text-slate-400 text-xs">
            Helping entrepreneurs start something local
          </p>
        </div>
      </div>
    </footer>
  );
}
