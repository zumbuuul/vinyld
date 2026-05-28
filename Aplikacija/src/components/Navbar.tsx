"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Explore", href: "/search" },
  { label: "Community", href: "/community" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(19,19,19,0.7)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-2xl font-serif font-bold italic tracking-tight text-[#ffb59e]"
          >
            vinyld
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-serif tracking-[-0.02em] transition ${
                  pathname === "/" && link.href === "#hero"
                    ? "text-[#ffb59e]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70"
            aria-label="Search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.65" y1="16.65" x2="21" y2="21" />
            </svg>
          </button>
          <Link
            href="/register"
            className="rounded-md bg-linear-to-r from-[#ffb59e] to-[#ff5717] px-4 py-2 text-sm font-serif font-semibold text-[#521300]"
          >
            Join the Club
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 border-t border-white/5 px-6 py-3 text-xs text-white/60 md:hidden">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
