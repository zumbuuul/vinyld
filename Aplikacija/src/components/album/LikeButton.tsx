"use client";

import { useState, useTransition } from "react";

import {
  toggleAlbumLike,
  toggleAlbumReviewLike,
  toggleCriticAlbumReviewLike,
} from "@/actions/album.actions";
import type { AlbumLikeTargetType } from "@/features/album/album.types";

import { ProtectedAction } from "./ProtectedAction";

type LikeButtonProps = {
  targetType: AlbumLikeTargetType;
  targetId: string;
  isAuthenticated: boolean;
  redirectUrl: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  compact?: boolean;
};

export function LikeButton({
  targetType,
  targetId,
  isAuthenticated,
  redirectUrl,
  initialLiked = false,
  initialLikeCount,
  compact = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState<number | null>(
    typeof initialLikeCount === "number" ? initialLikeCount : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (
    runProtectedAction: <T>(action: () => Promise<T>) => Promise<T | null>,
  ) => {
    if (isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await runProtectedAction(async () => {
        switch (targetType) {
          case "album":
            return toggleAlbumLike(targetId);
          case "user_review":
            return toggleAlbumReviewLike(targetId);
          case "critic_review":
            return toggleCriticAlbumReviewLike(targetId);
        }
      });

      if (!result) {
        return;
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      const nextLiked = result.data.liked;
      setLiked(nextLiked);

      if (likeCount !== null) {
        setLikeCount((currentCount) => {
          if (currentCount === null) {
            return currentCount;
          }

          if (nextLiked) {
            return currentCount + 1;
          }

          return Math.max(0, currentCount - 1);
        });
      }
    });
  };

  return (
    <ProtectedAction isAuthenticated={isAuthenticated} redirectUrl={redirectUrl}>
      {(runProtectedAction) => (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleToggle(runProtectedAction)}
            disabled={isPending}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              liked
                ? "border-[#ff8f6b] bg-[rgba(255,143,107,0.16)] text-[#ffb59e]"
                : "border-white/20 bg-transparent text-[#e6beb2] hover:border-[#ff8f6b]/50 hover:text-[#ffb59e]"
            } ${compact ? "px-2.5 py-1 text-[11px]" : ""}`}
          >
            <span aria-hidden="true">{liked ? "[x]" : "[ ]"}</span>
            <span>{liked ? "Liked" : "Like"}</span>
            {likeCount !== null ? <span>({likeCount})</span> : null}
          </button>
          {error ? <p className="text-xs text-[#ffb59e]">{error}</p> : null}
        </div>
      )}
    </ProtectedAction>
  );
}
