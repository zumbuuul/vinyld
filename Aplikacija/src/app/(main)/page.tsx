import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const heroImage =
  "https://www.figma.com/api/mcp/asset/7294e38e-2f4b-4602-a65f-7a21549d2bf8";
const grainImage =
  "https://www.figma.com/api/mcp/asset/b618309b-96fa-484e-84ba-ac1a6e77eafd";
const albumOneImage =
  "https://www.figma.com/api/mcp/asset/051ee437-38f5-4c24-a6f2-3071020ab894";
const albumTwoImage =
  "https://www.figma.com/api/mcp/asset/e21870e8-1b96-4541-bdf8-cf9f8e2f9e60";
const albumThreeImage =
  "https://www.figma.com/api/mcp/asset/7f81d012-9613-4e81-851f-2a28e6308eff";
const albumFourImage =
  "https://www.figma.com/api/mcp/asset/33575c96-78e8-4fb9-bb2a-e1c5bfaa1018";
const avatarOne =
  "https://www.figma.com/api/mcp/asset/2de5dc84-4fac-4be4-a711-3f7d989cfc4f";
const avatarTwo =
  "https://www.figma.com/api/mcp/asset/b4060a9e-aa2f-4894-923f-8faa7d7bb63b";
const featureOne =
  "https://www.figma.com/api/mcp/asset/f5f10c62-e8c9-4187-b24d-49db302a566b";
const featureTwo =
  "https://www.figma.com/api/mcp/asset/4e937ae8-b709-4271-826c-590083e4c0b5";
const featureThree =
  "https://www.figma.com/api/mcp/asset/a51edb71-c313-496a-8203-18ab9ffaf266";
const featureFour =
  "https://www.figma.com/api/mcp/asset/4119ec21-ebaa-4244-a685-0ca9cc9ecaa7";
const ctaIcon =
  "https://www.figma.com/api/mcp/asset/8edca9a8-b753-499f-8d5b-af98a43a6d1b";

const featuredAlbums = [
  {
    title: "Dark Side of the Moon",
    artist: "Pink Floyd",
    rating: 5,
    image: albumOneImage,
  },
  {
    title: "Rumours",
    artist: "Fleetwood Mac",
    rating: 4,
    image: albumTwoImage,
  },
  {
    title: "Abbey Road",
    artist: "The Beatles",
    rating: 5,
    image: albumThreeImage,
  },
  {
    title: "Kind of Blue",
    artist: "Miles Davis",
    rating: 5,
    image: albumFourImage,
  },
];

const activityItems = [
  {
    id: "activity-1",
    user: "Julian V.",
    action: 'Added to "Midnight Jazz"',
    content:
      '"The pressing quality on this Blue Note reissue is absolutely stellar. Minimal surface noise and incredible dynamic range."',
    likes: 42,
    comments: 12,
    avatar: avatarOne,
    rating: 0,
  },
  {
    id: "activity-2",
    user: "Sarah K.",
    action: 'Reviewed "Pet Sounds"',
    content:
      '"A masterpiece that never ages. Every spin reveals a new layer of harmony."',
    likes: 156,
    comments: 24,
    avatar: avatarTwo,
    rating: 5,
  },
];

const features = [
  {
    title: "Log your listening",
    description:
      "Keep a digital diary of every record you play. Track time, frequency, and mood across your entire collection.",
    icon: featureOne,
  },
  {
    title: "Curate lists",
    description:
      "Build beautiful, shareable lists. Whether it is Sunday Mornings or Best B-Sides, organize your way.",
    icon: featureTwo,
  },
  {
    title: "Connect with friends",
    description:
      "Follow fellow collectors, swap recommendations, and see what is spinning around the world.",
    icon: featureThree,
  },
  {
    title: "Discover new sounds",
    description:
      "Our curation engine finds hidden gems based on your taste, pressings, and listening habits.",
    icon: featureFour,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < rating;
        return (
          <svg
            key={index}
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 ${active ? "text-[#ffb59e]" : "text-white/20"}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 17.75l-6.18 3.25 1.18-6.86-5-4.86 6.9-1 3.1-6.26 3.1 6.26 6.9 1-5 4.86 1.18 6.86L12 17.75z" />
          </svg>
        );
      })}
    </div>
  );
}

export default async function FeedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="relative bg-[#131313] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url('${grainImage}')`,
          backgroundSize: "512px 512px",
        }}
      />

      <section
        id="hero"
        className="relative flex min-h-[80vh] items-center overflow-hidden"
      >
        <div className="absolute inset-0 opacity-40">
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
                href="#featured"
                className="rounded-md bg-[#2a2a2a] px-6 py-3 text-sm text-[#e5e2e1]"
              >
                Explore Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="bg-[#131313] py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#ffb59e]">
                Monthly Selection
              </p>
              <h2 className="mt-2 text-3xl font-serif font-bold">
                Iconic Pressings
              </h2>
            </div>
            <Link
              href="#featured"
              className="text-sm text-[#e6beb2] hover:text-white"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featuredAlbums.map((album) => (
              <div
                key={album.title}
                className="rounded-xl bg-[#2a2a2a] p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
              >
                <div className="overflow-hidden rounded-sm bg-[#1c1b1b]">
                  <img
                    src={album.image}
                    alt={album.title}
                    className="h-56 w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold">
                  {album.title}
                </h3>
                <p className="text-sm text-[#e6beb2]">{album.artist}</p>
                <div className="mt-3">
                  <StarRating rating={album.rating} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {session ? (
        <section id="community" className="bg-[#1c1b1b] py-16 text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 lg:flex-row">
            <div className="max-w-sm space-y-6">
              <h2 className="text-3xl font-serif font-bold">
                Recent <span className="italic">Spins</span>
              </h2>
              <p className="text-[#e6beb2]">
                Join the conversation. See what the community is listening to
                and sharing right now.
              </p>
              <button className="rounded-md bg-[#353534] px-6 py-3 text-sm">
                Join Community
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-6">
              {activityItems.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col gap-4 rounded-xl bg-[#131313] p-6 sm:flex-row"
                >
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-white">
                        {activity.user}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-[#e6beb2]">
                        {activity.action}
                      </span>
                    </div>
                    {activity.rating > 0 ? (
                      <StarRating rating={activity.rating} />
                    ) : null}
                    <p className="text-sm text-[#e6beb2]">{activity.content}</p>
                    <div className="flex items-center gap-4 text-xs text-[#e6beb2]">
                      <span>{activity.likes} likes</span>
                      <span>{activity.comments} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="features" className="bg-[#131313] py-16">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="space-y-4">
              <div className="h-14 w-14">
                <img src={feature.icon} alt="" className="h-full w-full" />
              </div>
              <h3 className="text-xl font-serif font-bold">{feature.title}</h3>
              <p className="text-sm text-[#e6beb2]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#1c1b1b] py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-6 text-xs text-white/40 md:flex-row md:items-center">
          <div className="space-y-2">
            <p className="font-serif text-base text-white">vinyld</p>
            <p className="uppercase tracking-[0.2em]">
              © 2026 vinyld. Built for the high-fidelity future.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 uppercase tracking-[0.2em]">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Archive</span>
            <span>Instagram</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
