"use client";

import { useEffect, useState } from "react";

import { getUserNowSpinning } from "@/actions/user.actions";
import type { NowSpinningState } from "@/features/user/user.types";

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
      {children}
    </p>
  );
}

function getProgressPercent(
  nowSpinning: Extract<NowSpinningState, { status: "track" }>,
) {
  const { progressMs, durationMs } = nowSpinning.track;

  if (!progressMs || !durationMs) {
    return 0;
  }

  return Math.min(100, Math.max(0, (progressMs / durationMs) * 100));
}

export function NowSpinningWidget({
  userId,
  initialNowSpinning,
  hasSpotifyConnection,
}: {
  userId: string;
  initialNowSpinning: NowSpinningState;
  hasSpotifyConnection: boolean;
}) {
  const [nowSpinning, setNowSpinning] =
    useState<NowSpinningState>(initialNowSpinning);

  useEffect(() => {
    setNowSpinning(initialNowSpinning);
  }, [initialNowSpinning]);

  useEffect(() => {
    if (!hasSpotifyConnection || nowSpinning.status === "not_connected") {
      return;
    }

    let cancelled = false;
    let inFlight = false;

    async function refreshNowSpinning() {
      if (inFlight) {
        return;
      }

      inFlight = true;

      try {
        const nextState = await getUserNowSpinning(userId);

        if (!cancelled) {
          setNowSpinning(nextState);
        }
      } catch {
        if (!cancelled) {
          setNowSpinning({ status: "unavailable" });
        }
      } finally {
        inFlight = false;
      }
    }

    const intervalId = window.setInterval(() => {
      void refreshNowSpinning();
    }, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [hasSpotifyConnection, nowSpinning.status, userId]);

  if (nowSpinning.status !== "track") {
    const message =
      nowSpinning.status === "not_playing"
        ? "Nothing playing right now."
        : nowSpinning.status === "unavailable"
          ? "Spotify playback is temporarily unavailable."
          : hasSpotifyConnection
            ? "Spotify connection needs attention."
            : "Spotify is not connected.";

    return (
      <section className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6">
        <SectionEyebrow>Now Spinning</SectionEyebrow>
        <div className="mt-4 rounded-2xl bg-[#2a2a2a] p-5">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#5c4037]" />
            <p className="text-sm text-[#d7b8ad]">{message}</p>
          </div>
        </div>
      </section>
    );
  }

  const progressPercent = getProgressPercent(nowSpinning);
  const { track } = nowSpinning;

  return (
    <section className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6">
      <SectionEyebrow>Now Spinning</SectionEyebrow>
      <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-[#2a2a2a] p-4 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[#1c1b1b]">
          {track.albumImageUrl ? (
            <img
              src={track.albumImageUrl}
              alt={track.albumName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#ffb59e,#ff5717)] text-[10px] uppercase tracking-[0.28em] text-[#521300]">
              Live
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                track.isPlaying ? "bg-[#ff5717]" : "bg-[#8f7b74]"
              }`}
            />
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8f7b74]">
              {track.isPlaying ? "Playing" : "Paused"}
            </p>
          </div>
          <p className="mt-2 truncate text-lg font-serif text-[#f5ebe8]">
            {track.name}
          </p>
          <p className="mt-1 truncate text-sm text-[#d7b8ad]">
            {track.artists} • {track.albumName}
          </p>
          <div className="mt-4 h-2 rounded-full bg-[#1c1b1b]">
            <div
              className="h-2 rounded-full bg-[linear-gradient(135deg,#ffb59e,#ff5717)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {track.spotifyUrl ? (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-xs uppercase tracking-[0.22em] text-[#ffb59e] hover:text-white"
            >
              Open in Spotify
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
