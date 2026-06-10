"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { followUser, unfollowUser } from "@/actions/user.actions";
import { ProtectedAction } from "@/components/ProtectedAction";
import { Button } from "@/components/ui/button";

export function FollowButton({
  userId,
  initialIsFollowed,
  isAuthenticated,
  redirectUrl,
}: {
  userId: string;
  initialIsFollowed: boolean;
  isAuthenticated: boolean;
  redirectUrl: string;
}) {
  const router = useRouter();
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextValue = !isFollowed;
    setIsFollowed(nextValue);

    startTransition(async () => {
      try {
        if (nextValue) {
          await followUser(userId);
        } else {
          await unfollowUser(userId);
        }

        router.refresh();
      } catch {
        setIsFollowed(!nextValue);
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
          onClick={onClick}
          disabled={isPending}
          variant={isFollowed ? "outline" : "default"}
          className={
            isFollowed
              ? "w-full border-[#5c4037] text-[#f0d6cd] sm:w-auto"
              : "w-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95 sm:w-auto"
          }
        >
          {isPending ? "Working..." : isFollowed ? "Unfollow" : "Follow"}
        </Button>
      )}
    </ProtectedAction>
  );
}
