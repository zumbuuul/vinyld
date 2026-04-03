import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function ServerAuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Server Auth Page</h1>
      <p className="text-sm text-gray-600">
        This page reads session in a server component.
      </p>

      {session?.user ? (
        <div className="rounded border p-4 space-y-2">
          <p className="font-medium">Authenticated</p>
          <p>Email: {session.user.email}</p>
          <p>Name: {session.user.name}</p>
        </div>
      ) : (
        <div className="rounded border p-4">
          <p className="font-medium">No active session</p>
        </div>
      )}

      <Link
        href="/"
        className="inline-block rounded border px-3 py-2 hover:bg-gray-50"
      >
        Back to home
      </Link>
    </main>
  );
}
