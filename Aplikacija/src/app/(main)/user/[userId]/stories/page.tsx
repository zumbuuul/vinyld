import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getTotalStories, getUserStories } from "@/actions/story.actions";
import { getUserProfile } from "@/actions/user.actions";
import { UserStoriesBrowser } from "@/components/story/UserStoriesBrowser";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/lib/session";

function StoriesPageFallback() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-4 w-28 bg-[#1c1b1b]" />
        <div>
          <Skeleton className="h-3 w-24 bg-[#1c1b1b]" />
        </div>
        <section className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 bg-[#2a2a2a]" />
                <Skeleton className="h-8 w-44 bg-[#2a2a2a]" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl bg-[#2a2a2a]" />
            </div>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton
                key={index}
                className="h-24 w-full rounded-2xl bg-[#2a2a2a]"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

async function UserStoriesView({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [{ userId }, session] = await Promise.all([
    params,
    getCurrentSession(),
  ]);
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
        <Link
          href={`/user/${userId}`}
          className="text-sm text-[#ffb59e] transition hover:text-white"
        >
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
