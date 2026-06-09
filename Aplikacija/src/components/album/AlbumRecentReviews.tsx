"use client";

import { LikeButton } from "@/components/feed/LikeButton";
import { ScoreDisplay } from "@/components/feed/ScoreDisplay";
import { UserAvatar } from "@/components/feed/UserAvatar";

type AlbumRecentReviewItem = {
  id: string;
  reviewType: "user" | "critic";
  userName: string;
  userImage: string | null;
  title: string | null;
  description: string | null;
  conclusion: string | null;
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

export function AlbumRecentReviews({
  reviews,
  isAuthenticated,
  redirectUrl,
}: {
  reviews: AlbumRecentReviewItem[];
  isAuthenticated: boolean;
  redirectUrl: string;
}) {
  return (
    <section className="mt-6 rounded-[28px] border border-white/6 bg-[#141313]/88 p-5 sm:mt-8 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
            Recenzije
          </p>
          <h3 className="mt-1 text-2xl font-serif text-[#f5ebe8]">
            Skoriji utisci o albumu
          </h3>
        </div>
        <p className="text-sm text-[#a68f87]">{reviews.length} reviews</p>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-5 rounded-[22px] border border-white/6 bg-[#111010] px-4 py-5 text-sm text-[#8f7b74]">
          Jos nema recenzija za ovaj album.
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
                    <p className="truncate text-sm font-semibold text-white">
                      {review.userName}
                    </p>
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
