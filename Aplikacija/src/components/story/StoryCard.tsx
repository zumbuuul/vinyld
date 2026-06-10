"use client";

import Link from "next/link";

import type { UserStoryListItem } from "@/features/album/album.types";

export function StoryCard({
  story,
  href,
}: {
  story: UserStoryListItem;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl bg-[#2a2a2a] p-3 transition hover:bg-[#302f2f]"
    >
      <div className="flex gap-4">
        <img
          src={story.imageUrl}
          alt={story.name}
          className="h-20 w-20 shrink-0 rounded-md object-cover"
        />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-serif text-[#f5ebe8]">
            {story.name}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
            <span>{story.songCount} songs</span>
            <span>{story.likeCount} likes</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
