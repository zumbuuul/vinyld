import Link from "next/link";

const heroImage =
  "https://www.figma.com/api/mcp/asset/7294e38e-2f4b-4602-a65f-7a21549d2bf8";

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#131313]">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Turntable close-up"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-[#131313] via-[rgba(19,19,19,0.8)] to-[rgba(19,19,19,0)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 sm:py-28">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl font-serif font-bold leading-tight tracking-[-0.04em] sm:text-6xl">
            Your Vinyl Life,
            <br />
            <span className="italic text-[#ffb59e]">Curated.</span>
          </h1>
          <p className="text-base text-[#e6beb2] sm:text-lg">
            The definitive platform for the analog enthusiast. Catalog your
            collection, track your listening habits, and connect with a global
            community of audiophiles.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-md bg-linear-to-r from-[#ffb59e] to-[#ff5717] px-6 py-3 text-sm font-semibold text-[#521300]"
            >
              Start Your Collection
            </Link>
            <Link
              href="#trending"
              className="rounded-md bg-[#2a2a2a] px-6 py-3 text-sm text-[#e5e2e1]"
            >
              Explore the Pulse
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
