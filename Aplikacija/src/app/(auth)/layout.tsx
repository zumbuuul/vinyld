import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#131313]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,181,158,0.12),transparent_55%),radial-gradient(circle_at_bottom,rgba(143,1,147,0.15),transparent_60%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:grid lg:grid-cols-[1.1fr,1fr] lg:items-center">
        <div className="space-y-10">
          <Link
            href="/"
            className="text-3xl font-serif font-bold tracking-tight text-[#ffb59e]"
          >
            vinyld
          </Link>

          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-[#e6beb2]">
              Modern analog
            </p>
            <h1 className="text-5xl font-serif font-semibold leading-tight">
              Curate your listening life.
            </h1>
            <p className="text-lg text-[#e6beb2]">
              Track albums, rate songs, and share playlists with a community
              that listens closely.
            </p>
          </div>

          <div className="space-y-4 text-sm text-[#e6beb2]">
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-[#ffb59e]" />
              <p>Review albums and songs with a clean, editorial flow.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-[#ffb59e]" />
              <p>Build playlists that feel like a collection, not a queue.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-[#ffb59e]" />
              <p>Follow friends and critics to see what is spinning now.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[rgba(19,19,19,0.7)] p-8 shadow-[0_48px_80px_rgba(255,181,158,0.08)] backdrop-blur-[20px]">
          {children}
        </div>
      </div>
    </div>
  );
}
