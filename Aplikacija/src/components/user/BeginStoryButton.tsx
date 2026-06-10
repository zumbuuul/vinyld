"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { beginNewStory } from "@/actions/story.actions";
import { Button } from "@/components/ui/button";

export function BeginStoryButton({
  className,
  emptyState = false,
}: {
  className?: string;
  emptyState?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleBeginStory = () => {
    startTransition(async () => {
      const result = await beginNewStory();
      router.push(`/user/${result.userId}/stories/${result.storyId}`);
    });
  };

  return (
    <Button
      onClick={handleBeginStory}
      disabled={isPending}
      className={
        className ??
        (emptyState
          ? "w-full min-h-28 bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95"
          : "w-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95 sm:w-auto")
      }
    >
      {isPending ? "Creating..." : "Begin a new story"}
    </Button>
  );
}
