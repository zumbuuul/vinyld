import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/lib/session";

type LoginPageProps = {
  searchParams?: Promise<{
    redirectUrl?: string;
  }>;
};

const DEFAULT_REDIRECT_URL = "/";

function resolveRedirectUrl(redirectUrl?: string): string {
  if (!redirectUrl) {
    return DEFAULT_REDIRECT_URL;
  }

  if (!redirectUrl.startsWith("/") || redirectUrl.startsWith("//")) {
    return DEFAULT_REDIRECT_URL;
  }

  return redirectUrl;
}

function LoginPageFallback() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28 bg-[#1c1b1b]" />
        <Skeleton className="h-10 w-40 bg-[#1c1b1b]" />
        <Skeleton className="h-4 w-72 bg-[#1c1b1b]" />
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 bg-[#1c1b1b]" />
          <Skeleton className="h-12 w-full rounded-xl bg-[#1c1b1b]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 bg-[#1c1b1b]" />
          <Skeleton className="h-12 w-full rounded-xl bg-[#1c1b1b]" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl bg-[#1c1b1b]" />
      </div>

      <Skeleton className="h-4 w-48 bg-[#1c1b1b]" />
    </div>
  );
}

async function LoginPageView({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const redirectUrl = resolveRedirectUrl(params.redirectUrl);

  const session = await getCurrentSession();

  if (session) {
    redirect(redirectUrl);
  }

  return <LoginForm redirectUrl={redirectUrl} />;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageView searchParams={searchParams} />
    </Suspense>
  );
}
