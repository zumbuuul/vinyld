import { Suspense } from "react";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/lib/session";

function RegisterPageFallback() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32 bg-[#1c1b1b]" />
        <Skeleton className="h-10 w-48 bg-[#1c1b1b]" />
        <Skeleton className="h-4 w-80 bg-[#1c1b1b]" />
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 bg-[#1c1b1b]" />
          <Skeleton className="h-12 w-full rounded-xl bg-[#1c1b1b]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 bg-[#1c1b1b]" />
          <Skeleton className="h-12 w-full rounded-xl bg-[#1c1b1b]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 bg-[#1c1b1b]" />
          <Skeleton className="h-12 w-full rounded-xl bg-[#1c1b1b]" />
          <Skeleton className="h-3 w-44 bg-[#1c1b1b]" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl bg-[#1c1b1b]" />
      </div>

      <Skeleton className="h-4 w-52 bg-[#1c1b1b]" />
    </div>
  );
}

async function RegisterPageView() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/");
  }

  return <RegisterForm />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageFallback />}>
      <RegisterPageView />
    </Suspense>
  );
}
