"use client";

import Link from "next/link";

import { LikeButton } from "@/components/feed/LikeButton";
import { ScoreDisplay } from "@/components/feed/ScoreDisplay";
import { UserAvatar } from "@/components/feed/UserAvatar";

export type RecentReviewListItem = {
  id: string;
  reviewSubject?: "album" | "song";
  targetHref?: string | null;
  targetName?: string | null;
  targetImageUrl?: string | null;
  targetSecondaryText?: string | null;
  reviewType: "user" | "critic";
  userId: string;
  userName: string;
  userImage: string | null;
  title: string | null;
  description: string | null;
  conclusion: string | null;
  likedAlbum: boolean | null;
  rating10: number | null;
  likeCount: number;
  likedByViewer: boolean;
  createdAt: string | null;
};

function formatRelativeTime(value: string | null): string {
  if (!value) {
    return "recently";
  }

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

function PreferenceBadge({
  liked,
  positiveLabel,
  negativeLabel,
}: {
  liked: boolean;
  positiveLabel: string;
  negativeLabel: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
        liked
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          : "border-rose-500/30 bg-rose-500/10 text-rose-200"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${liked ? "bg-emerald-300" : "bg-rose-300"}`}
      />
      {liked ? positiveLabel : negativeLabel}
    </div>
  );
}

export function RecentReviewsList({
  reviews,
  isAuthenticated,
  redirectUrl,
  reviewSubject,
  eyebrow,
  title,
  emptyText,
  countLabel,
  likedPositiveLabel,
  likedNegativeLabel,
}: {
  reviews: RecentReviewListItem[];
  isAuthenticated: boolean;
  redirectUrl: string;
  reviewSubject: "album" | "song";
  eyebrow: string;
  title: string;
  emptyText: string;
  countLabel: string;
  likedPositiveLabel: string;
  likedNegativeLabel: string;
}) {
  return (
    <section className="mt-6 rounded-[28px] border border-white/6 bg-[#141313]/88 p-5 sm:mt-8 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-2xl font-serif text-[#f5ebe8]">{title}</h3>
        </div>
        <p className="text-sm text-[#a68f87]">
          {reviews.length} {countLabel}
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-5 rounded-[22px] border border-white/6 bg-[#111010] px-4 py-5 text-sm text-[#8f7b74]">
          {emptyText}
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {reviews.map((review) => (
            <article
              key={`${review.reviewType}:${review.id}`}
              className={`rounded-[22px] border p-4 sm:p-5 ${
                review.reviewType === "critic"
                  ? "border-[#8d5bff]/45 bg-[linear-gradient(180deg,rgba(141,91,255,0.14),rgba(141,91,255,0.03)),#111010]"
                  : "border-white/6 bg-[#111010]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar imageUrl={review.userImage} name={review.userName} />
                  <div className="min-w-0">
                    <Link
                      href={`/user/${review.userId}`}
                      className="block truncate text-sm font-semibold text-white transition hover:text-[#ffb59e]"
                    >
                      {review.userName}
                    </Link>
                    <p
                      className={`text-[11px] uppercase tracking-[0.22em] ${
                        review.reviewType === "critic"
                          ? "text-[#b89cff]"
                          : "text-[#8f7b74]"
                      }`}
                    >
                      {review.reviewType === "critic" ? "Critique" : "Review"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[#8f7b74]">
                  {formatRelativeTime(review.createdAt)}
                </span>
              </div>

              {review.targetName ? (
                <Link
                  href={review.targetHref ?? "#"}
                  className="mt-4 flex items-center gap-3 rounded-2xl bg-[#1a1919] p-3 transition hover:bg-[#211f1f]"
                >
                  {review.targetImageUrl ? (
                    <img
                      src={review.targetImageUrl}
                      alt={review.targetName}
                      className="h-14 w-14 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#2a2a2a] text-[10px] uppercase tracking-[0.2em] text-[#e6beb2]">
                      {review.reviewSubject === "song" ? "Song" : "LP"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">
                      {review.reviewSubject === "song" ? "Song" : "Album"}
                    </p>
                    <p className="truncate text-base font-semibold text-white">
                      {review.targetName}
                    </p>
                    {review.targetSecondaryText ? (
                      <p className="truncate text-sm text-[#e6beb2]">
                        {review.targetSecondaryText}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ) : null}

              {review.title ? (
                <p
                  className={`mt-4 text-base font-semibold ${
                    review.reviewType === "critic" ? "text-[#efe7ff]" : "text-white"
                  }`}
                >
                  {review.title}
                </p>
              ) : null}

              <ScoreDisplay rating10={review.rating10} className="mt-4" />

              {review.reviewType === "user" && review.likedAlbum !== null ? (
                <div className="mt-4">
                  <PreferenceBadge
                    liked={review.likedAlbum}
                    positiveLabel={likedPositiveLabel}
                    negativeLabel={likedNegativeLabel}
                  />
                </div>
              ) : null}

              <p
                className={`mt-4 text-sm leading-6 ${
                  review.reviewType === "critic" ? "text-[#d9cdfc]" : "text-[#d7b8ad]"
                }`}
              >
                {review.description?.trim() || "Bez dodatnog opisa."}
              </p>

              {review.reviewType === "critic" && review.conclusion?.trim() ? (
                <div className="mt-4 rounded-2xl border border-[#8d5bff]/35 bg-[#17121f] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#b89cff]">
                    Zakljucak
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#efe7ff]">
                    {review.conclusion}
                  </p>
                </div>
              ) : null}

              <div className="mt-4">
                <LikeButton
                  reviewId={review.id}
                  reviewType={review.reviewType}
                  reviewSubject={review.reviewSubject ?? reviewSubject}
                  initialLikeCount={review.likeCount}
                  initiallyLiked={review.likedByViewer}
                  isAuthenticated={isAuthenticated}
                  redirectUrl={redirectUrl}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
