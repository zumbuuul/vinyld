import { Suspense } from "react";

import Navbar, { type NavbarViewer } from "@/components/Navbar";
import { NavbarSkeleton } from "@/components/feed/FeedSkeletons";
import { getUserProfileRecord } from "@/db/queries/users.queries";
import { getCurrentSession } from "@/lib/session";

async function NavbarSlot() {
  const session = await getCurrentSession();
  const profile = session ? await getUserProfileRecord(session.user.id) : null;
  const viewer: NavbarViewer | null = session
    ? {
        id: session.user.id,
        name: profile?.name ?? session.user.name,
        image: profile?.imageUrl ?? session.user.image ?? null,
      }
    : null;

  return <Navbar viewer={viewer} />;
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
