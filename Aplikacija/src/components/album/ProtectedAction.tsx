"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback } from "react";

type ProtectedActionProps = {
  isAuthenticated: boolean;
  redirectUrl: string;
  children: (
    runProtectedAction: <T>(action: () => Promise<T>) => Promise<T | null>,
  ) => ReactNode;
};

const DEFAULT_REDIRECT_URL = "/";

function resolveRedirectUrl(redirectUrl: string): string {
  if (!redirectUrl) {
    return DEFAULT_REDIRECT_URL;
  }

  if (!redirectUrl.startsWith("/") || redirectUrl.startsWith("//")) {
    return DEFAULT_REDIRECT_URL;
  }

  return redirectUrl;
}

export function ProtectedAction({
  isAuthenticated,
  redirectUrl,
  children,
}: ProtectedActionProps) {
  const router = useRouter();

  const runProtectedAction = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | null> => {
      if (!isAuthenticated) {
        const safeRedirectUrl = resolveRedirectUrl(redirectUrl);
        router.push(`/login?redirectUrl=${encodeURIComponent(safeRedirectUrl)}`);
        return null;
      }

      return action();
    },
    [isAuthenticated, redirectUrl, router],
  );

  return <>{children(runProtectedAction)}</>;
}
