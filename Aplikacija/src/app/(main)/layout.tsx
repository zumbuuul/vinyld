import { Suspense } from "react";

import Navbar from "@/components/Navbar";

function NavbarFallback() {
  return (
    <div className="fixed top-0 right-0 left-0 z-50 bg-[rgba(19,19,19,0.7)] px-6 py-4 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="h-7 w-28 rounded-md bg-white/10" aria-hidden="true" />
        <div className="h-10 w-10 rounded-full bg-white/10" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative">
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="pt-20 sm:pt-24">{children}</main>
    </div>
  );
}
