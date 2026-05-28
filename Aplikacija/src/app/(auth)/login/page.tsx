import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { auth } from "@/lib/auth";

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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const redirectUrl = resolveRedirectUrl(params.redirectUrl);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect(redirectUrl);
  }

  return <LoginForm redirectUrl={redirectUrl} />;
}
