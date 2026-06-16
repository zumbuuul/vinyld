"use client";

function fallbackBio(name: string) {
  return `${name} is still shaping the public notes around their sound. Check back when the profile has liner notes worthy of the records behind it.`;
}

export function ArtistBioSection({
  name,
  bio,
}: {
  name: string;
  bio: string | null;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-[#261b22] p-6 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[#8f7b74]">
        Artist Bio
      </p>
      <div className="mt-5">
        <h2 className="text-3xl font-serif leading-tight text-[#f5ebe8] sm:text-4xl">
          The artist statement
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[#ecd2c8] sm:text-lg">
          {bio?.trim() || fallbackBio(name)}
        </p>
      </div>
    </section>
  );
}
