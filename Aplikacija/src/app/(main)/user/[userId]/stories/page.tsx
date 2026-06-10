import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getTotalStories, getUserStories } from "@/actions/story.actions";
import { getUserProfile } from "@/actions/user.actions";
import { UserStoriesBrowser } from "@/components/user/UserStoriesBrowser";
import { getCurrentSession } from "@/lib/session";

function StoriesPageFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl rounded-[32px] bg-[#1c1b1b] p-6 sm:p-8">
        Loading stories...
      </div>
    </main>
  );
}

async function UserStoriesView({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [{ userId }, session] = await Promise.all([params, getCurrentSession()]);
  const [profile, initialStories, totalStories] = await Promise.all([
    getUserProfile(userId),
    getUserStories(userId, 1),
    getTotalStories(userId),
  ]);

  if (!profile) {
    notFound();
  }

  const isOwnProfile = session?.user.id === userId;

  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href={`/user/${userId}`} className="text-sm text-[#ffb59e] transition hover:text-white">
          Back to profile
        </Link>

        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
            {profile.name}
          </p>
        </div>

        <UserStoriesBrowser
          userId={userId}
          initialStories={initialStories}
          totalStories={totalStories}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </main>
  );
}

export default function UserStoriesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <Suspense fallback={<StoriesPageFallback />}>
      <UserStoriesView params={params} />
    </Suspense>
  );
}
