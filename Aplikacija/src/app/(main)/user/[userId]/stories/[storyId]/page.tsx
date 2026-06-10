import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getStorySongs } from "@/actions/story.actions";
import { getStoryById, isStoryLikedByUser } from "@/db/queries/stories.queries";
import { getUserProfile } from "@/actions/user.actions";
import { StoryDetailsPanel } from "@/components/story/StoryDetailsPanel";
import { StorySongList } from "@/components/story/StorySongList";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/lib/session";

function StoryDetailsFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-4 w-28 bg-[#1c1b1b]" />

        <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.12),_transparent_35%),#1c1b1b] p-5 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl bg-[#2a2a2a]" />
              <Skeleton className="h-40 w-full rounded-2xl bg-[#2a2a2a]" />
            </div>
            <div className="space-y-5">
              <Skeleton className="h-3 w-24 bg-[#2a2a2a]" />
              <Skeleton className="h-14 w-full rounded-2xl bg-[#2a2a2a]" />
              <Skeleton className="h-4 w-56 bg-[#2a2a2a]" />
              <Skeleton className="h-40 w-full rounded-2xl bg-[#2a2a2a]" />
              <div className="flex gap-3">
                <Skeleton className="h-11 w-32 rounded-xl bg-[#2a2a2a]" />
                <Skeleton className="h-11 w-40 rounded-xl bg-[#2a2a2a]" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6">
          <div className="space-y-3">
            <Skeleton className="h-3 w-20 bg-[#2a2a2a]" />
            <Skeleton className="h-8 w-40 bg-[#2a2a2a]" />
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={index}
                className="h-20 w-full rounded-2xl bg-[#2a2a2a]"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

async function StoryDetailsView({
  params,
}: {
  params: Promise<{ userId: string; storyId: string }>;
}) {
  const [{ userId, storyId }, session] = await Promise.all([
    params,
    getCurrentSession(),
  ]);
  const [story, profile, songs] = await Promise.all([
    getStoryById(storyId),
    getUserProfile(userId),
    getStorySongs(storyId),
  ]);

  if (!story || !profile || story.userId !== userId) {
    notFound();
  }

  const isOwner = session?.user.id === story.userId;
  const viewerHasLiked =
    session?.user.id != null
      ? await isStoryLikedByUser(storyId, session.user.id)
      : false;

  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={`/user/${userId}/stories`}
          className="text-sm text-[#ffb59e] transition hover:text-white"
        >
          Back to stories
        </Link>

        <StoryDetailsPanel
          isOwner={isOwner}
          isAuthenticated={Boolean(session)}
          userId={userId}
          storyId={storyId}
          ownerName={profile.name}
          story={{
            name: story.name,
            imageUrl: story.imageUrl,
            description: story.description,
            songCount: story.songCount,
            likeCount: story.likeCount,
            viewerHasLiked,
          }}
        />

        <StorySongList storyId={storyId} songs={songs} isOwner={isOwner} />
      </div>
    </main>
  );
}

export default function StoryDetailsPage({
  params,
}: {
  params: Promise<{ userId: string; storyId: string }>;
}) {
  return (
    <Suspense fallback={<StoryDetailsFallback />}>
      <StoryDetailsView params={params} />
    </Suspense>
  );
}
