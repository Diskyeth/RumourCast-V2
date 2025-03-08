"use client";

import { usePathname, useRouter } from "next/navigation";
import AnimatedTabs from "./post-feed/animated-tabs";

export function NavTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AnimatedTabs
      tabs={[
        { id: "anoncast", label: "Anoncast", href: "/anoncast" },
        { id: "news", label: "News", href: "/news" }
      ]}
      activeTab={pathname}
      onTabChange={(tab) => router.push(tab)}
      layoutId="main-tabs"
    />
  );
}
