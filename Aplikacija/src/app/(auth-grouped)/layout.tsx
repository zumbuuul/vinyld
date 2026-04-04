import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      {session ? <p>logged in</p> : <p>not logged in</p>}
      <p>hi from layout</p> {children}
    </>
  );
}
