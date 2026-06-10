"use client";

import { useState, useTransition } from "react";

import { getUserStories } from "@/actions/story.actions";
import { Button } from "@/components/ui/button";
import { BeginStoryButton } from "@/components/user/BeginStoryButton";
import { StoryCard } from "@/components/user/StoryCard";
import type { UserStoryListItem } from "@/features/album/album.types";

function ChevronButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
      className="border-[#5c4037] text-[#f0d6cd]"
    >
      {direction === "prev" ? "<" : ">"}
    </Button>
  );
}

export function UserStoriesBrowser({
  userId,
  initialStories,
  totalStories,
  isOwnProfile,
}: {
  userId: string;
  initialStories: UserStoryListItem[];
  totalStories: number;
  isOwnProfile: boolean;
}) {
  const [stories, setStories] = useState(initialStories);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(totalStories / 5));

  const loadPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const nextStories = await getUserStories(userId, nextPage);
        setStories(nextStories);
        setPage(nextPage);
      } catch {
        setError("Could not load stories right now.");
      }
    });
  };

  return (
    <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.12),_transparent_35%),#1c1b1b] p-5 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
            Stories
          </p>
          <h1 className="mt-2 text-4xl font-serif leading-none text-[#f5ebe8] sm:text-5xl">
            User stories
          </h1>
          <p className="mt-3 text-sm text-[#a68f87]">
            {totalStories} total stories
          </p>
        </div>

        {isOwnProfile ? (
          <BeginStoryButton />
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        {stories.length === 0 ? (
          <div className="rounded-2xl bg-[#2a2a2a] px-4 py-5 text-sm text-[#d7b8ad]">
            No stories to show yet.
          </div>
        ) : (
          stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              href={`/user/${userId}/stories/${story.id}`}
            />
          ))
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-[#a68f87]">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <ChevronButton
            direction="prev"
            disabled={page <= 1 || isPending}
            onClick={() => loadPage(page - 1)}
          />
          <ChevronButton
            direction="next"
            disabled={page >= totalPages || isPending}
            onClick={() => loadPage(page + 1)}
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-[#ffb59e]">{error}</p> : null}
    </section>
  );
}
