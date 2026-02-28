// Layout for State Business Guides
// Inherits from parent resources layout (light theme)

import DirectoryNav from "@/components/resources/DirectoryNav";
import DirectoryFooter from "@/components/resources/DirectoryFooter";

export default function StartBusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <DirectoryNav />
      <div className="flex-1">{children}</div>
      <DirectoryFooter />
    </div>
  );
}
