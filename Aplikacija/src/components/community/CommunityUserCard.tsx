"use client";

import Link from "next/link";

import { FollowButton } from "@/components/user/FollowButton";
import type { CommunityUserCardItem } from "@/features/community/community.types";

export function CommunityUserCard({
  item,
  isAuthenticated,
  redirectUrl,
  viewerId,
}: {
  item: CommunityUserCardItem;
  isAuthenticated: boolean;
  redirectUrl: string;
  viewerId: string | null;
}) {
  const initials = item.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const isOwnCard = viewerId === item.id;

  return (
    <article className="rounded-[22px] bg-[#2a2a2a] p-4">
      <div className="flex items-start gap-3">
        <Link
          href={`/user/${item.id}`}
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1c1b1b] text-xs font-semibold text-[#ffb59e]">
              {initials || "U"}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="truncate text-lg font-serif text-[#f5ebe8]">
              {item.name}
            </h3>

            <p className="mt-3 text-sm text-[#d7b8ad]">{item.metricLabel}</p>
          </div>
        </Link>
      </div>

      <div className="mt-4">
        {isOwnCard ? (
          <div className="rounded-xl bg-[#1c1b1b] px-3 py-2 text-center text-sm text-[#a68f87]">
            You
          </div>
        ) : (
          <FollowButton
            userId={item.id}
            initialIsFollowed={item.isFollowed}
            isAuthenticated={isAuthenticated}
            redirectUrl={redirectUrl}
          />
        )}
      </div>
    </article>
  );
}
