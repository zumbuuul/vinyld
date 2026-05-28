"use client";

import Link from "next/link";
import { useState } from "react";

import { signIn } from "@/lib/auth-client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const result = await signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    if (result?.error) {
      setError(result.error.message ?? "Unable to sign in.");
      setLoading(false);
      return;
    }

    setMessage("Signed in. Redirecting...");
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[#e6beb2]">
          Welcome back
        </p>
        <h2 className="text-3xl font-serif font-semibold">Sign in</h2>
        <p className="text-sm text-[#e6beb2]">
          Enter your credentials to return to your collection.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-[#e6beb2]">
            Email
          </label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl bg-[#1c1b1b] px-4 py-3 text-sm text-[#f6edea] placeholder:text-[#9b8c86] ring-1 ring-[rgba(92,64,55,0.2)] focus:outline-none focus:ring-2 focus:ring-[#ffb59e]"
            placeholder="you@vinyl.fm"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-[#e6beb2]">
            Password
          </label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl bg-[#1c1b1b] px-4 py-3 text-sm text-[#f6edea] placeholder:text-[#9b8c86] ring-1 ring-[rgba(92,64,55,0.2)] focus:outline-none focus:ring-2 focus:ring-[#ffb59e]"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-[#ffb59e] to-[#ff5717] py-3 text-sm font-serif font-semibold text-[#521300] transition hover:from-[#ffb59e] hover:to-[#ff6b2d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {error ? (
        <div className="rounded-lg bg-[rgba(255,87,23,0.12)] px-4 py-3 text-sm text-[#ffb59e]">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-lg bg-[rgba(255,181,158,0.12)] px-4 py-3 text-sm text-[#ffb59e]">
          {message}
        </div>
      ) : null}

      <p className="text-sm text-[#e6beb2]">
        No account yet?{" "}
        <Link href="/register" className="text-[#ffb59e] hover:text-white">
          Create one
        </Link>
      </p>
    </div>
  );
}
