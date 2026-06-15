"use client";

import { useState, useTransition } from "react";

import {
  addSongToStory,
  getOwnStoriesForSelection,
} from "@/actions/story.actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserStoryListItem } from "@/features/album/album.types";

export function AddToPlaylistPopover({
  songId,
  triggerLabel = "Add to story",
  triggerVariant = "outline",
  triggerSize = "default",
  className,
}: {
  songId: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "icon";
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [stories, setStories] = useState<UserStoryListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStories, startLoadingStories] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();

  const loadStories = () => {
    startLoadingStories(async () => {
      try {
        const result = await getOwnStoriesForSelection();
        setStories(result);
      } catch {
        setError("Could not load your stories right now.");
      }
    });
  };

  const handleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    setError(null);

    if (nextOpen && stories.length === 0) {
      loadStories();
    }
  };

  const handleSelectStory = (storyId: string) => {
    setError(null);

    startSubmitting(async () => {
      try {
        await addSongToStory(storyId, songId);
        setIsOpen(false);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not add this song to your story.",
        );
      }
    });
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <Button variant={triggerVariant} size={triggerSize} onClick={handleOpen}>
        {triggerLabel}
      </Button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-[#3b2b26] bg-[#1c1b1b] p-3 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.75)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
              Add to story
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#a68f87] transition hover:text-white"
            >
              Close
            </button>
          </div>

          {isLoadingStories ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-[#2a2a2a] px-3 py-3"
                >
                  <Skeleton className="h-4 w-32 bg-[#3a3737]" />
                  <Skeleton className="mt-2 h-3 w-20 bg-[#3a3737]" />
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <p className="mt-4 text-sm text-[#d7b8ad]">
              You do not have any stories yet.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {stories.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSelectStory(story.id)}
                  className="flex w-full items-center justify-between rounded-xl bg-[#2a2a2a] px-3 py-3 text-left transition hover:bg-[#312f2f] disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#f5ebe8]">
                      {story.name}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#8f7b74]">
                      {story.songCount} songs
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 text-xs text-[#ffb59e]">
                    Add
                  </span>
                </button>
              ))}
            </div>
          )}

          {error ? <p className="mt-4 text-sm text-[#ffb59e]">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
