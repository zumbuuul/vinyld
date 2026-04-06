"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Navbar() {
  const pathname = usePathname();

  const links = [
    { label: "Police", href: "/library" },
    { label: "Ljudi", href: "/members" },
    { label: "Priče", href: "/playlists" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[rgba(19,19,19,0.7)] flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-3xl font-serif font-bold italic text-[#ffb59e] tracking-tight"
        >
          vinyld
        </Link>
        <div className="flex gap-6">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-serif transition ${
                  isActive
                    ? "text-[#ffb59e] border-b-2 border-[#ffb59e]"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/register"
          className="px-6 py-2 rounded bg-linear-to-r from-[#ffb59e] to-[#ff5717] text-[#521300] font-serif font-bold text-sm hover:from-[#ffb59e] hover:to-[#ff6b2d] transition"
        >
          Pridruzi se
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
