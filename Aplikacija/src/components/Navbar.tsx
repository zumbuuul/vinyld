"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { signOut } from "@/lib/auth-client";
import { NavbarSearch } from "@/components/NavbarSearch";

const navLinks = [
  { label: "Explore", href: "/search" },
  { label: "Community", href: "/community" },
];

export type NavbarViewer = {
  id: string;
  name: string;
  image: string | null;
};

type NavbarProps = {
  viewer: NavbarViewer | null;
};

export default function Navbar({ viewer }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const userId = viewer?.id;
  const userName = viewer?.name ?? "";
  const userImage = viewer?.image ?? null;
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
        <div
          className={`flex items-center gap-3 ${
            searchExpanded ? "w-full sm:w-auto" : ""
          }`}
        >
          <NavbarSearch onMobileExpandedChange={setSearchExpanded} />
          {viewer ? (
            <div
              className={`relative ${searchExpanded ? "hidden sm:block" : ""}`}
              ref={menuRef}
            >
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Open user menu"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#2a2a2a] text-xs font-semibold text-[#ffb59e]"
              >
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName || "User profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials || "U"
                )}
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-3 w-48 rounded-xl bg-[#1c1b1b] p-2 text-sm shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
                  <Link
                    href={userId ? `/user/${userId}` : "/login"}
                    className="block rounded-lg px-3 py-2 text-white/80 hover:bg-[#2a2a2a] hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block rounded-lg px-3 py-2 text-white/80 hover:bg-[#2a2a2a] hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                      location.reload();
                    }}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-white/80 hover:bg-[#2a2a2a] hover:text-white"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/register"
              className={`rounded-md bg-linear-to-r from-[#ffb59e] to-[#ff5717] px-4 py-2 text-sm font-serif font-semibold text-[#521300] ${
                searchExpanded ? "hidden sm:inline-flex" : ""
              }`}
            >
              Join the Club
            </Link>
          )}
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
