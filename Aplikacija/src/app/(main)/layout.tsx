import { headers } from "next/headers";

import Navbar, { type NavbarViewer } from "@/components/Navbar";
import { auth } from "@/lib/auth";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const viewer: NavbarViewer | null = session
    ? {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image ?? null,
      }
    : null;

  return (
    <div className="relative">
      <Navbar viewer={viewer} />
      <main className="pt-20 sm:pt-24">{children}</main>
    </div>
  );
}
