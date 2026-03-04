// Directory Navigation Component (Light Theme)
// Warm, friendly navigation for the resource directory

import Link from "next/link";
import Image from "next/image";

export default function DirectoryNav() {
  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Image
            src="/sparklocal-logo-dark.svg"
            alt="SparkLocal"
            width={150}
            height={40}
            className="h-9 w-auto transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/resources"
            className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Directory
          </Link>
          <Link
            href="/blog"
            className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Blog
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
