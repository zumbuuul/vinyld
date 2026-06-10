import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/settings/ProfileForm";
import {
  getUserPreferences,
  getUserProfileRecord,
} from "@/db/queries/users.queries";
import { getCurrentSession } from "@/lib/session";

export default async function SettingsPage() {
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
