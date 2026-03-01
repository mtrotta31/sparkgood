import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Projects",
  description:
    "View and manage your saved business ideas, deep dives, and launch kits. Continue where you left off or start a new project.",
  robots: {
    index: false, // User-specific content should not be indexed
    follow: false,
  },
  openGraph: {
    title: "My Projects | SparkLocal",
    description: "Manage your saved business ideas and deep dive results.",
    url: "https://sparklocal.co/projects",
  },
  alternates: {
    canonical: "https://sparklocal.co/projects",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
