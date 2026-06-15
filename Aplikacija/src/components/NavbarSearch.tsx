"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { searchCatalog } from "@/actions/catalog.actions";
import type { CatalogSearchResult } from "@/features/catalog/catalog.types";

export function NavbarSearch({
  onMobileExpandedChange,
}: {
  onMobileExpandedChange?: (expanded: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CatalogSearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const searchRequestId = useRef(0);

  useEffect(() => {
    onMobileExpandedChange?.(mobileExpanded);
  }, [mobileExpanded, onMobileExpandedChange]);

  useEffect(() => {
    if (!searchOpen) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
        setMobileExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      setSearchOpen(false);
      return undefined;
    }

    const currentRequestId = searchRequestId.current + 1;
    searchRequestId.current = currentRequestId;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError(null);
        const results = await searchCatalog(trimmedQuery);

        if (searchRequestId.current !== currentRequestId) {
          return;
        }

        setSearchResults(results);
        setSearchOpen(true);
      } catch {
        if (searchRequestId.current !== currentRequestId) {
          return;
        }

        setSearchResults([]);
        setSearchError("Not available");
        setSearchOpen(true);
      } finally {
        if (searchRequestId.current === currentRequestId) {
          setIsSearching(false);
        }
      }
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div
      className={`relative ${mobileExpanded ? "w-full sm:w-auto" : ""}`}
      ref={searchRef}
    >
      <div
        className={`flex h-9 items-center gap-2 rounded-full bg-white/5 px-3 text-white/70 transition-all ${
          mobileExpanded ? "w-full sm:w-40" : "w-auto sm:w-auto"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setMobileExpanded(true);
            if (
              searchResults.length > 0 ||
              isSearching ||
              searchError ||
              searchQuery.trim()
            ) {
              setSearchOpen(true);
            }
          }}
          className="shrink-0"
          aria-label="Open search"
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
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onFocus={() => {
            setMobileExpanded(true);
            if (
              searchResults.length > 0 ||
              isSearching ||
              searchError ||
              searchQuery.trim()
            ) {
              setSearchOpen(true);
            }
          }}
          placeholder="Search albums and songs"
          className={`bg-transparent text-xs text-white/80 placeholder:text-white/40 focus:outline-none ${
            mobileExpanded ? "block w-full sm:w-40" : "hidden sm:block sm:w-40"
          }`}
        />
        {mobileExpanded ? (
          <button
            type="button"
            onClick={() => {
              setMobileExpanded(false);
              setSearchOpen(false);
            }}
            className="text-[10px] uppercase tracking-[0.18em] text-white/40 sm:hidden"
          >
            Close
          </button>
        ) : null}
      </div>
      {searchOpen ? (
        <div className="absolute right-0 mt-3 w-[26rem] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#1c1b1b] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] sm:right-0">
          <div className="border-b border-white/5 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#e6beb2]">
            Search results
          </div>
          <div className="max-h-[24rem] overflow-y-auto p-2">
            {isSearching ? (
              <div className="px-3 py-4 text-sm text-white/70">
                Searching Spotify...
              </div>
            ) : searchError ? (
              <div className="px-3 py-4 text-sm text-[#ffb59e]">
                {searchError}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-3 py-4 text-sm text-white/60">
                No albums or songs found.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.type}:${result.spotifyId}`}
                    href={result.href}
                    prefetch={false}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                      setSearchResults([]);
                      setSearchError(null);
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-white/80 transition hover:bg-[#2a2a2a] hover:text-white"
                  >
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#2a2a2a] text-[10px] uppercase tracking-[0.2em] text-[#e6beb2]">
                        {result.type === "album" ? "LP" : "TRK"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {result.name}
                        </p>
                        <span className="rounded-full bg-[#241d1a] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ffb59e]">
                          {result.type === "album" ? "Album" : "Song"}
                        </span>
                      </div>
                      <p className="truncate text-xs text-white/55">
                        {result.subtitle}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
