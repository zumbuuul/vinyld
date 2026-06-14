import { Suspense } from "react";

import {
  getPopularUsers,
  getSimilarTaste,
  getTopCritics,
} from "@/actions/community.actions";
import { CommunityColumn } from "@/components/community/CommunityColumn";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/lib/session";

function CommunityPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.16),_transparent_30%),#171515] p-6 sm:p-8">
          <div className="max-w-3xl">
            <Skeleton className="h-3 w-24 bg-[#1c1b1b]" />
            <Skeleton className="mt-4 h-14 w-2/3 bg-[#1c1b1b]" />
            <Skeleton className="mt-4 h-5 w-full bg-[#1c1b1b]" />
            <Skeleton className="mt-2 h-5 w-3/4 bg-[#1c1b1b]" />
          </div>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, columnIndex) => (
              <section
                key={columnIndex}
                className="rounded-[28px] bg-[#1c1b1b] p-6"
              >
                <Skeleton className="h-3 w-24 bg-[#2a2a2a]" />
                <Skeleton className="mt-3 h-9 w-40 bg-[#2a2a2a]" />
                <Skeleton className="mt-3 h-4 w-full bg-[#2a2a2a]" />
                <Skeleton className="mt-2 h-4 w-3/4 bg-[#2a2a2a]" />

                <div className="mt-6 space-y-3">
                  {Array.from({ length: 3 }, (_, cardIndex) => (
                    <div
                      key={cardIndex}
                      className="rounded-[22px] bg-[#2a2a2a] p-4"
                    >
                      <div className="flex gap-3">
                        <Skeleton className="h-12 w-12 rounded-full bg-[#1c1b1b]" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <Skeleton className="h-5 w-2/3 bg-[#1c1b1b]" />
                          <Skeleton className="h-3 w-1/2 bg-[#1c1b1b]" />
                          <Skeleton className="h-4 w-1/3 bg-[#1c1b1b]" />
                        </div>
                      </div>
                      <Skeleton className="mt-4 h-10 w-full bg-[#1c1b1b]" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

async function CommunityPageView() {
  const session = await getCurrentSession();
  const viewerId = session?.user.id ?? null;

  const [topCritics, popularUsers, similarTaste] = await Promise.all([
    getTopCritics(viewerId),
    getPopularUsers(viewerId),
    getSimilarTaste(viewerId),
  ]);

  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.16),_transparent_30%),#171515] p-6 shadow-[0_40px_140px_-60px_rgba(0,0,0,0.92)] sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#8f7b74]">
              Community
            </p>
            <h1 className="mt-3 text-5xl font-serif leading-none text-[#f5ebe8] sm:text-6xl">
              See who is shaping the taste of the room.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-[#d7b8ad] sm:text-base">
              Track the critics getting the most attention, the users collecting
              the most appreciation, and the listeners whose album tastes most
              closely overlap with your own.
            </p>
          </div>

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
            <CommunityColumn
              eyebrow="Pillar 01"
              title="Top Critics"
              description="The ten critics whose critiques have earned the most likes across the platform."
              items={topCritics}
              emptyText="No critic activity has surfaced yet."
              isAuthenticated={Boolean(session)}
              redirectUrl="/community"
              viewerId={viewerId}
            />
            <CommunityColumn
              eyebrow="Pillar 02"
              title="Popular Users"
              description="Listeners whose reviews and stories have gathered the most likes overall."
              items={popularUsers}
              emptyText="No user activity has surfaced yet."
              isAuthenticated={Boolean(session)}
              redirectUrl="/community"
              viewerId={viewerId}
            />
            <CommunityColumn
              eyebrow="Pillar 03"
              title="Similar Taste"
              description="Logged-in listeners see users with the strongest overlap in highly rated albums."
              items={similarTaste}
              emptyText={
                session
                  ? "Not enough overlapping high-rated album reviews yet."
                  : "Sign in to compare your highly rated albums with active listeners."
              }
              isAuthenticated={Boolean(session)}
              redirectUrl="/community"
              viewerId={viewerId}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<CommunityPageSkeleton />}>
      <CommunityPageView />
    </Suspense>
  );
}
