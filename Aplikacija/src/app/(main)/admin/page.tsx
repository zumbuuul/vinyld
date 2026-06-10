import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getRoleRequests } from "@/actions/admin.actions";
import { RoleRequestColumn } from "@/components/admin/RoleRequestColumn";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserPreferences } from "@/db/queries/users.queries";
import { getCurrentSession } from "@/lib/session";

function AdminPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.16),_transparent_35%),#1c1b1b] p-5 sm:p-8">
          <Skeleton className="h-3 w-20 rounded-full bg-[#2a2a2a]" />
          <Skeleton className="mt-4 h-12 w-72 rounded-xl bg-[#2a2a2a]" />
          <Skeleton className="mt-4 h-4 w-full rounded-full bg-[#2a2a2a]" />
          <Skeleton className="mt-2 h-4 w-5/6 rounded-full bg-[#2a2a2a]" />
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <section
              key={index}
              className="rounded-[28px] bg-[#1c1b1b] p-5 sm:p-6"
            >
              <Skeleton className="h-3 w-32 rounded-full bg-[#2a2a2a]" />
              <Skeleton className="mt-3 h-4 w-40 rounded-full bg-[#2a2a2a]" />
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-10 w-24 rounded-xl bg-[#2a2a2a]" />
                <Skeleton className="h-10 w-24 rounded-xl bg-[#2a2a2a]" />
                <Skeleton className="h-10 w-24 rounded-xl bg-[#2a2a2a]" />
              </div>
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }, (_, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="rounded-2xl bg-[#2a2a2a] p-4"
                  >
                    <Skeleton className="h-6 w-36 rounded-full bg-[#353534]" />
                    <Skeleton className="mt-2 h-3 w-28 rounded-full bg-[#353534]" />
                    <div className="mt-4 rounded-2xl bg-[#1c1b1b] px-4 py-4">
                      <Skeleton className="h-3 w-16 rounded-full bg-[#2a2a2a]" />
                      <Skeleton className="mt-3 h-4 w-full rounded-full bg-[#2a2a2a]" />
                      <Skeleton className="mt-2 h-4 w-5/6 rounded-full bg-[#2a2a2a]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

async function AdminPageView() {
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/login?redirectUrl=${encodeURIComponent("/admin")}`);
  }

  const preferences = await getUserPreferences(session.user.id);

  if (preferences?.role !== "admin") {
    redirect("/");
  }

  const [criticRequests, artistRequests, adminRequests] = await Promise.all([
    getRoleRequests("critic", "pending"),
    getRoleRequests("artist", "pending"),
    getRoleRequests("admin", "pending"),
  ]);

  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,116,74,0.16),_transparent_35%),#1c1b1b] p-5 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-serif leading-none text-[#f5ebe8] sm:text-5xl">
            Role requests
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d7b8ad]">
            Review incoming access requests across critic, artist, and admin
            tracks. Each column defaults to pending requests and can be filtered
            independently.
          </p>
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-3">
          <RoleRequestColumn role="critic" initialRequests={criticRequests} />
          <RoleRequestColumn role="artist" initialRequests={artistRequests} />
          <RoleRequestColumn role="admin" initialRequests={adminRequests} />
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <AdminPageView />
    </Suspense>
  );
}
