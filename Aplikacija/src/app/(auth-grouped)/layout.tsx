import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return <p>NOT SIGNED IN</p>;

  return (
    <>
      <p>hi from layout</p> {children}
    </>
  );
}
