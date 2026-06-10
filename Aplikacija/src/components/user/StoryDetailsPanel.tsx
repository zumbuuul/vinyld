"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateStory } from "@/actions/story.actions";
import { Button } from "@/components/ui/button";

export function StoryDetailsPanel({
  isOwner,
  userId,
  storyId,
  story,
  ownerName,
}: {
  isOwner: boolean;
  userId: string;
  storyId: string;
  story: {
    name: string;
    imageUrl: string;
    description: string | null;
    songCount: number;
    likeCount: number;
  };
  ownerName: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(story.name);
  const [description, setDescription] = useState(story.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOwner) {
    return (
      <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.12),_transparent_35%),#1c1b1b] p-5 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <img
            src={story.imageUrl}
            alt={story.name}
            className="aspect-square w-full rounded-2xl object-cover"
          />

          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
              Story
            </p>
            <h1 className="mt-2 text-4xl font-serif leading-none text-[#f5ebe8] sm:text-5xl">
              {story.name}
            </h1>
            <p className="mt-3 text-sm text-[#a68f87]">by {ownerName}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
              <span>{story.songCount} songs</span>
              <span>{story.likeCount} likes</span>
            </div>
            <p className="mt-6 text-sm leading-7 text-[#d7b8ad]">
              {story.description?.trim() ||
                "This story does not have a description yet."}
            </p>

            <div className="mt-8 rounded-2xl bg-[#2a2a2a] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
                Viewer mode
              </p>
              <p className="mt-2 text-sm leading-6 text-[#d7b8ad]">
                You can browse this story, but only the owner can edit it.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const handleUpdateStory = () => {
    setError(null);

    startTransition(async () => {
      try {
        await updateStory({
          userId,
          storyId,
          name: title,
          description,
        });
        router.refresh();
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not update the story right now.",
        );
      }
    });
  };

  return (
    <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.12),_transparent_35%),#1c1b1b] p-5 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-4">
          <img
            src={story.imageUrl}
            alt={story.name}
            className="aspect-square w-full rounded-2xl object-cover"
          />
          <div className="rounded-2xl bg-[#2a2a2a] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
              Story image
            </p>
            <p className="mt-2 text-sm leading-6 text-[#d7b8ad]">
              Image replacement will be enabled once Vercel Blob is wired in.
            </p>
            <Button
              variant="outline"
              disabled
              className="mt-4 w-full border-[#5c4037] text-[#f0d6cd]"
            >
              Change cover image
            </Button>
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
            Story editor
          </p>

          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
                Title
              </span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#3b2b26] bg-[#2a2a2a] px-4 py-3 text-lg font-serif text-[#f5ebe8] outline-none transition focus:border-[#ffb59e]"
              />
            </label>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
              <span>{story.songCount} songs</span>
              <span>{story.likeCount} likes</span>
              <span>by {ownerName}</span>
            </div>

            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
                Bio
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={8}
                placeholder="Give this story a point of view..."
                className="mt-2 w-full resize-none rounded-2xl border border-[#3b2b26] bg-[#2a2a2a] px-4 py-4 text-sm leading-7 text-[#ecd2c8] outline-none transition focus:border-[#ffb59e]"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {error ? (
                <p className="text-sm text-[#ffb59e]">{error}</p>
              ) : (
                <p className="text-sm text-[#8f7b74]">
                  Changes will update the story title and bio.
                </p>
              )}
              <Button
                onClick={handleUpdateStory}
                disabled={isPending}
                className="w-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95 sm:w-auto"
              >
                {isPending ? "Updating..." : "Update Story"}
              </Button>
            </div>

            <div className="rounded-2xl bg-[#2a2a2a] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
                Owner mode
              </p>
              <p className="mt-2 text-sm leading-6 text-[#d7b8ad]">
                Title and bio are now editable and persisted here. Cover image
                changes stay disabled until Blob storage is set up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
