import { Suspense } from "react";

import Navbar, { type NavbarViewer } from "@/components/Navbar";
import { NavbarSkeleton } from "@/components/feed/FeedSkeletons";
import { getCurrentSession } from "@/lib/session";

async function NavbarSlot() {
  const session = await getCurrentSession();
  const viewer: NavbarViewer | null = session
    ? {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image ?? null,
      }
    : null;

  return <Navbar viewer={viewer} />;
}

function NavbarFallback() {
  return (
    <div className="fixed top-0 right-0 left-0 z-50 bg-[rgba(19,19,19,0.7)] px-6 py-4 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="h-7 w-28 rounded-md bg-white/10" aria-hidden="true" />
        <div
          className="h-10 w-10 rounded-full bg-white/10"
          aria-hidden="true"
        />
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
      <Suspense fallback={<NavbarSkeleton />}>
        <NavbarSlot />
      </Suspense>
      <main className="pt-20 sm:pt-24">{children}</main>
    </div>
  );
}
