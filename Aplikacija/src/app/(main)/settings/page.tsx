import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/settings/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getUserPreferences,
  getUserProfileRecord,
} from "@/db/queries/users.queries";
import { getCurrentSession } from "@/lib/session";

function SettingsPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.16),_transparent_35%),#1c1b1b] p-5 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-[28px] bg-[#2a2a2a]" />
            <Skeleton className="h-11 w-full rounded-xl bg-[#2a2a2a]" />
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <Skeleton className="h-3 w-28 rounded-full bg-[#2a2a2a]" />
              <Skeleton className="h-12 w-56 rounded-xl bg-[#2a2a2a]" />
              <Skeleton className="h-4 w-full rounded-full bg-[#2a2a2a]" />
              <Skeleton className="h-4 w-5/6 rounded-full bg-[#2a2a2a]" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-full bg-[#2a2a2a]" />
              <Skeleton className="h-14 w-full rounded-2xl bg-[#2a2a2a]" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-full bg-[#2a2a2a]" />
              <Skeleton className="h-44 w-full rounded-2xl bg-[#2a2a2a]" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-4 w-52 rounded-full bg-[#2a2a2a]" />
              <Skeleton className="h-11 w-full rounded-xl bg-[#2a2a2a] sm:w-40" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

async function SettingsPageView() {
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/login?redirectUrl=${encodeURIComponent("/settings")}`);
  }

  const [profile, preferences] = await Promise.all([
    getUserProfileRecord(session.user.id),
    getUserPreferences(session.user.id),
  ]);

  if (!profile) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <ProfileForm
          userId={profile.id}
          role={profile.role}
          initialName={profile.name}
          initialArtistBio={profile.artistBio}
          initialProfilePictureUrl={preferences?.profilePictureUrl ?? null}
          initialDisplayImageUrl={profile.imageUrl}
        />
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPageView />
    </Suspense>
  );
}
