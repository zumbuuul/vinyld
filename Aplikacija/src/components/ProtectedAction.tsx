"use client";

import { useRouter } from "next/navigation";

export function ProtectedAction({
  isAuthenticated,
  redirectUrl,
  onAction,
  children,
}: {
  isAuthenticated: boolean;
  redirectUrl: string;
  onAction: () => void | Promise<void>;
  children: (props: { onClick: () => void | Promise<void> }) => React.ReactNode;
}) {
  const router = useRouter();

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirectUrl=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    await onAction();
  };

  return children({ onClick: handleClick });
}
