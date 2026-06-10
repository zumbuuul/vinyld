import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getStorySongs } from "@/actions/story.actions";
import { getStoryById, isStoryLikedByUser } from "@/db/queries/stories.queries";
import { getUserProfile } from "@/actions/user.actions";
import { StoryDetailsPanel } from "@/components/story/StoryDetailsPanel";
import { StorySongList } from "@/components/story/StorySongList";
import { getCurrentSession } from "@/lib/session";

function StoryDetailsFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl rounded-[32px] bg-[#1c1b1b] p-6 sm:p-8">
        Loading story...
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
