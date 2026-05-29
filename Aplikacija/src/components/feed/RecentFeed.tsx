"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { UserAvatar } from "@/components/feed/UserAvatar";
import type {
  RecentFeedCursor,
  RecentFeedItem,
  RecentFeedPage,
} from "@/features/feed/feed.types";

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.round(hours / 24)}d ago`;
}

export function RecentFeed({
  initialItems,
  initialNextCursor,
  initialHasMore,
  asOf,
  onLoadMore,
}: {
  initialItems: RecentFeedItem[];
  initialNextCursor: RecentFeedCursor | null;
  initialHasMore: boolean;
  asOf: string;
  onLoadMore: (params: {
    cursor: RecentFeedCursor | null;
    asOf: string;
    limit?: number;
  }) => Promise<RecentFeedPage>;
}) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState<RecentFeedCursor | null>(
    initialNextCursor,
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = () => {
    if (!hasMore || isPending) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const page = await onLoadMore({
          cursor: nextCursor,
          asOf,
          limit: 3,
        });

        setItems((currentItems) => {
          const seenKeys = new Set(
            currentItems.map((item) => `${item.kind}:${item.id}`),
          );
          const appendedItems = page.items.filter(
            (item) => !seenKeys.has(`${item.kind}:${item.id}`),
          );

          return [...currentItems, ...appendedItems];
        });
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch {
        setError("Could not load more activities. Please try again.");
      }
    });
  };

  return (
    <section id="community" className="bg-[#131313] py-16 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">
            Live feed
          </p>
          <h2 className="mt-2 text-3xl font-serif font-bold">Recent spins</h2>
        </div>
        {items.length === 0 ? (
          <div className="rounded-xl bg-[#1c1b1b] p-6 text-sm text-[#e6beb2]">
            <p className="text-base font-semibold text-white">Nothing new!</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={`${item.kind}:${item.id}`}
                className="rounded-xl bg-[#1c1b1b] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-[#e6beb2]">
                    <UserAvatar
                      imageUrl={item.actorImage}
                      name={item.actorName}
                    />
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-white">
                        {item.actorName}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                        {item.activityLabel}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[#e6beb2]">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
                {item.kind === "review" || item.kind === "critic_review" ? (
                  <>
                    <Link
                      href={item.targetHref ?? "#"}
                      className="mt-4 flex items-center gap-3"
                    >
                      {item.albumImageUrl ? (
                        <img
                          src={item.albumImageUrl}
                          alt={item.albumName ?? "Album"}
                          className="h-14 w-14 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-[#2a2a2a] text-[10px] uppercase tracking-[0.2em] text-[#e6beb2]">
                          LP
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">
                          Album
                        </p>
                        <p className="text-base font-semibold text-white">
                          {item.albumName}
                        </p>
                        <p className="text-sm text-[#e6beb2]">
                          {item.albumArtist}
                        </p>
                      </div>
                    </Link>
                    {item.kind === "critic_review" && item.title ? (
                      <p className="mt-4 text-sm font-semibold text-white">
                        {item.title}
                      </p>
                    ) : null}
                    <p className="mt-4 text-sm text-[#e6beb2]">
                      {item.summary ?? "Fresh listen added to the feed."}
                    </p>
                  </>
                ) : null}

                {item.kind === "story" ? (
                  <>
                    <Link
                      href={item.targetHref ?? "#"}
                      className="mt-4 flex items-center gap-3"
                    >
                      {item.storyImage ? (
                        <img
                          src={item.storyImage}
                          alt={item.storyName ?? "Playlist"}
                          className="h-14 w-14 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-[#2a2a2a] text-[10px] uppercase tracking-[0.2em] text-[#e6beb2]">
                          Mix
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">
                          Playlist
                        </p>
                        <p className="text-base font-semibold text-white">
                          {item.storyName}
                        </p>
                      </div>
                    </Link>
                    <p className="mt-4 text-sm text-[#e6beb2]">
                      {item.summary ?? "New playlist added to the timeline."}
                    </p>
                  </>
                ) : null}

                {item.kind === "follow" ? (
                  <>
                    <Link
                      href={item.targetHref ?? "#"}
                      className="mt-4 flex items-center gap-3"
                    >
                      {item.targetUserImage ? (
                        <img
                          src={item.targetUserImage}
                          alt={item.targetUserName ?? "User"}
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2a2a] text-[10px] uppercase tracking-[0.2em] text-[#e6beb2]">
                          U
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">
                          User
                        </p>
                        <p className="text-base font-semibold text-white">
                          {item.targetUserName}
                        </p>
                      </div>
                    </Link>
                    <p className="mt-4 text-sm text-[#e6beb2]">
                      Started following {item.targetUserName}.
                    </p>
                  </>
                ) : null}
              </article>
            ))}
          </div>
        )}
        {error ? (
          <p className="text-sm text-[#ffb59e]">{error}</p>
        ) : null}
        {hasMore ? (
          <div>
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isPending}
              className="rounded-xl bg-[#2a2a2a] px-5 py-3 text-sm font-semibold text-[#f6edea] transition hover:bg-[#3a3a3a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Loading..." : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
