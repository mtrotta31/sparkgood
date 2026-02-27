// Blog Layout - Light Theme (matches directory)
import DirectoryNav from "@/components/resources/DirectoryNav";
import DirectoryFooter from "@/components/resources/DirectoryFooter";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <DirectoryNav />
      {children}
      <DirectoryFooter />
    </div>
  );
}
