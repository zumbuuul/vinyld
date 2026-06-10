import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
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
  return null;
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
