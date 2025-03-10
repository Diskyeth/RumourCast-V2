"use client";

import { usePathname, useRouter } from "next/navigation";
import AnimatedTabs from "./post-feed/animated-tabs";

export function Tabs() {
  const router = useRouter();
  const pathname = usePathname();

  // Extract tab ID from path (e.g., "/anoncast" → "anoncast")
  const activeTab = pathname.split("/").filter(Boolean)[0] || "anoncast";

  return (
    <div className="fixed bottom-6 left-6 w-auto bg-black/80 shadow-md rounded-lg gradient-border-wrapper">
    <AnimatedTabs
      tabs={[
        { id: "anoncast", label: "Cast", href: "/anoncast" },
        { id: "news", label: "News", href: "/news" }
      ]}
      activeTab={activeTab} // Only "anoncast" or "news", not the full path
      onTabChange={(tab) => router.push(`/${tab}`)}
      layoutId="main-tabs"
    />
    </div>
  );
  
}
