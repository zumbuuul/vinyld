"use client";

import { upload } from "@vercel/blob/client";
import { type ChangeEvent, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteStoryAction, updateStory } from "@/actions/story.actions";
import { StoryLikeButton } from "@/components/story/StoryLikeButton";
import { Button } from "@/components/ui/button";

function buildStoryCoverPath(
  userId: string,
  storyId: string,
  fileName: string,
): string {
  const sanitizedName = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");

  return `stories/${userId}/${storyId}/${Date.now()}-${sanitizedName || "cover"}`;
}

export function StoryDetailsPanel({
  isOwner,
  isAuthenticated,
  userId,
  storyId,
  story,
  ownerName,
}: {
  isOwner: boolean;
  isAuthenticated: boolean;
  userId: string;
  storyId: string;
  story: {
    name: string;
    imageUrl: string;
    description: string | null;
    songCount: number;
    likeCount: number;
    viewerHasLiked?: boolean;
  };
  ownerName: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState(story.name);
  const [description, setDescription] = useState(story.description ?? "");
  const [imageUrl, setImageUrl] = useState(story.imageUrl);
  const [previewUrl, setPreviewUrl] = useState(story.imageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOwner) {
    return (
      <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.12),_transparent_35%),#1c1b1b] p-5 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <img
            src={previewUrl}
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
            <p className="mt-3 text-sm text-[#a68f87]">
              by{" "}
              <Link
                href={`/user/${userId}`}
                className="text-[#ffb59e] transition hover:text-white"
              >
                {ownerName}
              </Link>
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
              <span>{story.songCount} songs</span>
              <span>{story.likeCount} likes</span>
            </div>
            <p className="mt-6 text-sm leading-7 text-[#d7b8ad]">
              {story.description?.trim() ||
                "This story does not have a description yet."}
            </p>
            <div className="mt-8">
              <StoryLikeButton
                storyId={storyId}
                initialLikeCount={story.likeCount}
                initiallyLiked={story.viewerHasLiked ?? false}
                isAuthenticated={isAuthenticated}
                redirectUrl={`/user/${userId}/stories/${storyId}`}
              />
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
          imageUrl,
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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const temporaryPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(temporaryPreviewUrl);

    try {
      const blob = await upload(
        buildStoryCoverPath(userId, storyId, file.name),
        file,
        {
          access: "public",
          handleUploadUrl: "/api/story/cover/upload",
          onUploadProgress: ({ percentage }) => {
            setUploadProgress(Math.round(percentage));
          },
        },
      );

      setImageUrl(blob.url);
      setPreviewUrl(blob.url);
    } catch (uploadError) {
      setPreviewUrl(imageUrl);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the story cover right now.",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      event.target.value = "";
      URL.revokeObjectURL(temporaryPreviewUrl);
    }
  };

  const handleDeleteStory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this story?",
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await deleteStoryAction(userId, storyId);
        router.push(`/user/${userId}/stories`);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not delete the story right now.",
        );
      }
    });
  };

  return (
    <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.12),_transparent_35%),#1c1b1b] p-5 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-4">
          <img
            src={previewUrl}
            alt={story.name}
            className="aspect-square w-full rounded-2xl object-cover"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="rounded-2xl bg-[#2a2a2a] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
              Story image
            </p>
            <p className="mt-2 text-sm leading-6 text-[#d7b8ad]">
              Upload a new cover to give this story its own sleeve.
            </p>
            <Button
              variant="outline"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isPending}
              className="mt-4 w-full border-[#5c4037] text-[#f0d6cd]"
            >
              {isUploading ? "Uploading..." : "Change cover image"}
            </Button>
            {uploadProgress !== null ? (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-[#131313]">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-[#d7b8ad]">
                  {uploadProgress}% uploaded
                </p>
              </div>
            ) : null}
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
              <span>
                by{" "}
                <Link
                  href={`/user/${userId}`}
                  className="text-[#ffb59e] transition hover:text-white"
                >
                  {ownerName}
                </Link>
              </span>
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
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  onClick={handleDeleteStory}
                  disabled={isPending}
                  className="w-full border-[#5c4037] text-[#f0d6cd] hover:bg-[#3a1f23] hover:text-white sm:w-auto"
                >
                  {isPending ? "Working..." : "Delete Story"}
                </Button>
                <Button
                  onClick={handleUpdateStory}
                  disabled={isPending || isUploading}
                  className="w-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95 sm:w-auto"
                >
                  {isPending ? "Updating..." : "Update Story"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
