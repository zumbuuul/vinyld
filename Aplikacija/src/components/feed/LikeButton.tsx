"use client";

import { useState, useTransition } from "react";

import {
  toggleAlbumReviewLike,
  toggleCriticAlbumReviewLike,
} from "@/actions/review.actions";
import { ProtectedAction } from "@/components/ProtectedAction";
import { Button } from "@/components/ui/button";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 ${filled ? "fill-current" : "fill-none"} stroke-current`}
      strokeWidth="1.8"
    >
      <path d="M12 20.5 4.8 13.9a4.9 4.9 0 0 1 0-7 4.95 4.95 0 0 1 6.97 0L12 7.14l.23-.24a4.95 4.95 0 0 1 6.97 0 4.9 4.9 0 0 1 0 7Z" />
    </svg>
  );
}

export function LikeButton({
  reviewId,
  reviewType,
  initialLikeCount,
  initiallyLiked,
  isAuthenticated,
  redirectUrl,
}: {
  reviewId: string;
  reviewType: "user" | "critic";
  initialLikeCount: number;
  initiallyLiked: boolean;
  isAuthenticated: boolean;
  redirectUrl: string;
}) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result =
          reviewType === "critic"
            ? await toggleCriticAlbumReviewLike(reviewId)
            : await toggleAlbumReviewLike(reviewId);
        setLiked(result.liked);
        setLikeCount(result.likeCount);
      } catch {
        return;
      }
    });
  };

  return (
    <ProtectedAction
      isAuthenticated={isAuthenticated}
      redirectUrl={redirectUrl}
      onAction={handleToggle}
    >
      {({ onClick }) => (
        <Button
          variant={liked ? "default" : "outline"}
          size="sm"
          onClick={onClick}
          disabled={isPending}
          aria-pressed={liked}
          className={liked ? "" : "text-[#ffb59e]"}
        >
          <HeartIcon filled={liked} />
          {liked ? "Unlike" : "Like"}
          <span className="text-[11px] opacity-80">{likeCount}</span>
        </Button>
      )}
    </ProtectedAction>
  );
}
