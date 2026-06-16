"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { signUp } from "@/lib/auth-client";

const registerFormSchema = z.object({
  name: z.string().trim().min(1, "Display name is required."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

type RegisterValidationResult =
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      data: RegisterFormData;
    };

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const validateForm = (): RegisterValidationResult => {
    const parsed = registerFormSchema.safeParse({ name, email, password });

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ?? "Please check your input data.",
      };
    }

    return { success: true, data: parsed.data };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const validationResult = validateForm();

    if (!validationResult.success) {
      setError(validationResult.error);
      return;
    }

    setLoading(true);

    const result = await signUp.email({
      name: validationResult.data.name,
      email: validationResult.data.email,
      password: validationResult.data.password,
      callbackURL: "/",
    });

    if (result?.error) {
      setError(result.error.message ?? "Unable to create account.");
      setLoading(false);
      return;
    }

    setMessage("Account created. Redirecting...");
    setLoading(false);
    router.replace("/");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[#e6beb2]">
          Start your archive
        </p>
        <h2 className="text-3xl font-serif font-semibold">Create account</h2>
        <p className="text-sm text-[#e6beb2]">
          Build your profile and start rating your favorite releases.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-[#e6beb2]">
            Display name
          </label>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl bg-[#1c1b1b] px-4 py-3 text-sm text-[#f6edea] placeholder:text-[#9b8c86] ring-1 ring-[rgba(92,64,55,0.2)] focus:outline-none focus:ring-2 focus:ring-[#ffb59e]"
            placeholder="Your name"
          />
        </div>

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
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl bg-[#1c1b1b] px-4 py-3 text-sm text-[#f6edea] placeholder:text-[#9b8c86] ring-1 ring-[rgba(92,64,55,0.2)] focus:outline-none focus:ring-2 focus:ring-[#ffb59e]"
            placeholder="Minimum 8 characters"
          />
          <p className="mt-2 text-xs text-[#e6beb2]">
            Passwords must be at least 8 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-[#ffb59e] to-[#ff5717] py-3 text-sm font-serif font-semibold text-[#521300] transition hover:from-[#ffb59e] hover:to-[#ff6b2d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
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
        Already have an account?{" "}
        <Link href="/login" className="text-[#ffb59e] hover:text-white">
          Sign in
        </Link>
      </p>
    </div>
  );
}
