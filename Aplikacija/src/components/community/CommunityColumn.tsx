"use client";

import { CommunityUserCard } from "@/components/community/CommunityUserCard";
import type { CommunityUserCardItem } from "@/features/community/community.types";

export function CommunityColumn({
  eyebrow,
  title,
  description,
  items,
  emptyText,
  isAuthenticated,
  redirectUrl,
  viewerId,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: CommunityUserCardItem[];
  emptyText: string;
  isAuthenticated: boolean;
  redirectUrl: string;
  viewerId: string | null;
}) {
  return (
    <section className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-serif text-[#f5ebe8]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#d7b8ad]">{description}</p>
      </div>

      <div className="mt-6 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <CommunityUserCard
              key={item.id}
              item={item}
              isAuthenticated={isAuthenticated}
              redirectUrl={redirectUrl}
              viewerId={viewerId}
            />
          ))
        ) : (
          <div className="rounded-[22px] bg-[#2a2a2a] px-4 py-5 text-sm text-[#d7b8ad]">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}
