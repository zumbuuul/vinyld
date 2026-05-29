"use client";

import { useState, useTransition } from "react";

import { addSongToStory, getUserStories } from "@/actions/story.actions";

import { ProtectedAction } from "./ProtectedAction";

type AddToPlaylistPopoverProps = {
  songSpotifyId: string;
  userId: string | null;
  isAuthenticated: boolean;
  redirectUrl: string;
};

export function AddToPlaylistPopover({
  songSpotifyId,
  userId,
  isAuthenticated,
  redirectUrl,
}: AddToPlaylistPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stories, setStories] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpen = (
    runProtectedAction: <T>(action: () => Promise<T>) => Promise<T | null>,
  ) => {
    if (isPending) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const loadedStories = await runProtectedAction(async () => {
          if (!userId) {
            throw new Error("Missing active user session.");
          }

          return getUserStories(userId, 1);
        });

        if (!loadedStories) {
          return;
        }

        setStories(loadedStories);
        setIsOpen((currentState) => !currentState);
      } catch {
        setError("Failed to load playlists.");
      }
    });
  };

  const handleAddSong = (
    storyId: string,
    runProtectedAction: <T>(action: () => Promise<T>) => Promise<T | null>,
  ) => {
    if (isPending) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await runProtectedAction(() =>
          addSongToStory(storyId, songSpotifyId),
        );

        if (!result) {
          return;
        }

        if (!result.success) {
          setError(result.error);
          return;
        }

        setMessage("Song added to playlist.");
        setIsOpen(false);
      } catch {
        setError("Failed to add song to playlist.");
      }
    });
  };

  return (
    <ProtectedAction isAuthenticated={isAuthenticated} redirectUrl={redirectUrl}>
      {(runProtectedAction) => (
        <div className="relative">
          <button
            type="button"
            onClick={() => handleOpen(runProtectedAction)}
            disabled={isPending}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-[#e6beb2] transition hover:border-[#ff8f6b]/60 hover:text-[#ffb59e] disabled:opacity-60"
          >
            + Playlist
          </button>

          {isOpen ? (
            <div className="absolute top-10 right-0 z-20 w-56 rounded-xl border border-white/10 bg-[#1c1b1b] p-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]">
              {stories.length === 0 ? (
                <p className="text-xs text-[#e6beb2]">No playlists available.</p>
              ) : (
                <div className="space-y-2">
                  {stories.map((story) => (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => handleAddSong(story.id, runProtectedAction)}
                      disabled={isPending}
                      className="block w-full rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-[#f6edea] transition hover:border-[#ff8f6b]/50 hover:bg-[#242323]"
                    >
                      {story.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {error ? <p className="mt-1 text-xs text-[#ffb59e]">{error}</p> : null}
          {message ? <p className="mt-1 text-xs text-[#9ed8c6]">{message}</p> : null}
        </div>
      )}
    </ProtectedAction>
  );
}
