"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  disconnectSpotifyAccount,
  getSpotifyConnectUrl,
} from "@/actions/user.actions";
import { Button } from "@/components/ui/button";

export function SpotifyConnectButton({
  isConnected,
  returnTo,
}: {
  isConnected: boolean;
  returnTo: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);

    startTransition(async () => {
      try {
        if (isConnected) {
          await disconnectSpotifyAccount();
          router.refresh();
          return;
        }

        const { url } = await getSpotifyConnectUrl({ returnTo });
        window.location.assign(url);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Could not update Spotify connection.",
        );
      }
    });
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <Button
        type="button"
        variant={isConnected ? "outline" : "default"}
        disabled={isPending}
        onClick={handleClick}
        className={
          isConnected
            ? "w-full border-[#5c4037] text-[#f0d6cd] sm:w-auto"
            : "w-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[#521300] hover:opacity-95 sm:w-auto"
        }
      >
        {isPending
          ? "Working..."
          : isConnected
            ? "Disconnect Spotify"
            : "Connect Spotify"}
      </Button>
      {error ? <p className="text-xs text-[#ffb59e]">{error}</p> : null}
    </div>
  );
}
