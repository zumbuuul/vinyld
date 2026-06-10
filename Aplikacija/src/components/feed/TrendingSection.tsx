import Link from "next/link";

import { LikeButton } from "@/components/feed/LikeButton";
import { ScoreDisplay } from "@/components/feed/ScoreDisplay";
import { UserAvatar } from "@/components/feed/UserAvatar";
import type { TrendingData } from "@/features/feed/feed.types";

export function TrendingSection({
  trending,
  isAuthenticated,
}: {
  trending: TrendingData;
  isAuthenticated: boolean;
}) {
  return (
    <section id="trending" className="bg-[#1c1b1b] py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">
              Trending now
            </p>
            <h2 className="mt-2 text-3xl font-serif font-bold">
              Community heatcheck
            </h2>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold">
                Popular reviews
              </h3>
            </div>
            {trending.popularReviews.length === 0 ? (
              <div className="rounded-xl bg-[#131313] p-5 text-sm text-[#e6beb2]">
                No reviews yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {trending.popularReviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl bg-[#131313] p-5"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                      <span>
                        {review.reviewType === "critic"
                          ? "Critic review"
                          : "User review"}
                      </span>
                      <LikeButton
                        reviewId={review.id}
                        reviewType={review.reviewType}
                        initialLikeCount={review.likeCount}
                        initiallyLiked={review.likedByViewer}
                        isAuthenticated={isAuthenticated}
                        redirectUrl="/"
                      />
                    </div>
                    <Link
                      href={`/album/${review.albumSpotifyId}`}
                      className="mt-4 flex items-center gap-3"
                    >
                      {review.albumImageUrl ? (
                        <img
                          src={review.albumImageUrl}
                          alt={review.albumName}
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
                          {review.albumName}
                        </p>
                        <p className="text-sm text-[#e6beb2]">
                          {review.albumArtist}
                        </p>
                      </div>
                    </Link>
                    <p className="mt-4 text-sm text-[#e6beb2]">
                      {review.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#e6beb2]">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          imageUrl={review.userImage}
                          name={review.userName}
                        />
                        <span>{review.userName}</span>
                      </div>
                      <ScoreDisplay rating10={review.rating10} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold">
                Popular stories
              </h3>
            </div>
            {trending.popularStories.length === 0 ? (
              <div className="rounded-xl bg-[#131313] p-5 text-sm text-[#e6beb2]">
                No stories yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {trending.popularStories.map((story) => (
                  <article
                    key={story.id}
                    className="rounded-xl bg-[#131313] p-5"
                  >
                    <Link
                      href={`/user/${story.userId}/stories/${story.id}`}
                      className="flex items-center gap-3"
                    >
                      {story.imageUrl ? (
                        <img
                          src={story.imageUrl}
                          alt={story.name}
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
                          {story.name}
                        </p>
                      </div>
                    </Link>
                    <div className="mt-4 flex items-center justify-between text-xs text-[#e6beb2]">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          imageUrl={story.userImage}
                          name={story.userName}
                          size="sm"
                        />
                        <span>{story.userName}</span>
                      </div>
                      <span>{story.likeCount} likes</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold">
                Popular users
              </h3>
            </div>
            {trending.popularUsers.length === 0 ? (
              <div className="rounded-xl bg-[#131313] p-5 text-sm text-[#e6beb2]">
                No users yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {trending.popularUsers.map((user) => (
                  <article
                    key={user.id}
                    className="rounded-xl bg-[#131313] p-5"
                  >
                    <Link
                      href={`/user/${user.id}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          imageUrl={user.imageUrl}
                          name={user.name}
                          size="lg"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {user.name}
                          </p>
                          <p className="text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                            Collector
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[#e6beb2]">
                        {user.likeCount} likes
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
