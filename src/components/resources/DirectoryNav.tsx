// Directory Navigation Component (Light Theme)
// Warm, friendly navigation for the resource directory

import Link from "next/link";

export default function DirectoryNav() {
  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-spark to-accent flex items-center justify-center shadow-warm">
            <span className="text-white text-sm font-medium">S</span>
          </div>
          <span className="font-display text-xl text-slate-800 font-semibold group-hover:text-spark transition-colors">
            SparkLocal
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/resources"
            className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Directory
          </Link>
          <Link
            href="/builder"
            className="px-5 py-2.5 bg-spark hover:bg-spark-600 text-white font-semibold rounded-full transition-all shadow-warm hover:shadow-warm-md"
          >
            Start Building
          </Link>
        </div>
      </div>
    </nav>
  );
}
