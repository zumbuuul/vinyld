"use client";

const imgBeats =
  "https://www.figma.com/api/mcp/asset/8ac54f36-b850-495d-a553-500caf44858e";
const imgDarkSide =
  "https://www.figma.com/api/mcp/asset/75233400-157a-4170-9be8-e59bfc9a7dcd";
const imgRumours =
  "https://www.figma.com/api/mcp/asset/008fadee-c88c-40e9-80bc-c6333f7c236c";
const imgAbbeyRoad =
  "https://www.figma.com/api/mcp/asset/ae304d3a-37bd-468b-a7d9-d63388143f5d";
const imgKindOfBlue =
  "https://www.figma.com/api/mcp/asset/b70b8fae-ca5e-46a1-bad5-07915f0d1c55";
const imgHero =
  "https://www.figma.com/api/mcp/asset/267a4820-9ab2-4643-8a27-1d231e502076";
const imgStar =
  "https://www.figma.com/api/mcp/asset/dec2db42-d23c-4264-9d09-49819d329f4e";
const imgLike =
  "https://www.figma.com/api/mcp/asset/efcbe5d3-13ca-4e22-ab03-ad9d86849704";
const imgComment =
  "https://www.figma.com/api/mcp/asset/e921d34f-92c4-4be4-ba0e-6897533f39a1";
const imgFeature1 =
  "https://www.figma.com/api/mcp/asset/770bcd5c-596b-45e3-8bf2-b7595a437417";
const imgFeature2 =
  "https://www.figma.com/api/mcp/asset/ef9b1ab8-3e84-4830-b6b6-52d8d47f5774";
const imgFeature3 =
  "https://www.figma.com/api/mcp/asset/7d7cb9ce-57d4-45a2-9a35-2179c3a5f262";
const imgFeature4 =
  "https://www.figma.com/api/mcp/asset/f6328567-7f1f-4a63-897c-29f501b538e0";

interface Album {
  id: string;
  title: string;
  artist: string;
  image: string;
  rating: number;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  title: string;
  content: string;
  rating: number;
  likes: number;
  comments: number;
  avatar: string;
}

const albums: Album[] = [
  {
    id: "1",
    title: "Dark Side of the Moon",
    artist: "Pink Floyd",
    image: imgDarkSide,
    rating: 5,
  },
  {
    id: "2",
    title: "Rumours",
    artist: "Fleetwood Mac",
    image: imgRumours,
    rating: 4,
  },
  {
    id: "3",
    title: "Abbey Road",
    artist: "The Beatles",
    image: imgAbbeyRoad,
    rating: 5,
  },
  {
    id: "4",
    title: "Kind of Blue",
    artist: "Miles Davis",
    image: imgKindOfBlue,
    rating: 5,
  },
];

const activities: ActivityItem[] = [
  {
    id: "1",
    user: "Julian V.",
    action: 'Added to "Midnight Jazz"',
    title: "",
    content:
      '"The pressing quality on this Blue Note reissue is absolutely stellar. Minimal surface noise and incredible dynamic range."',
    rating: 0,
    likes: 42,
    comments: 12,
    avatar: imgBeats,
  },
  {
    id: "2",
    user: "Sarah K.",
    action: 'Reviewed "Pet Sounds"',
    title: "",
    content:
      '"A masterpiece that never ages. Every spin reveals a new layer of harmony."',
    rating: 5,
    likes: 156,
    comments: 24,
    avatar: imgKindOfBlue,
  },
];

const features = [
  {
    title: "Vodi svoj dnevnik",
    description:
      "Digitalni zapis svake preslušane ploče. Prati vreme i raspoloženje kroz celu svoju kolekciju.",
    icon: imgFeature1,
  },
  {
    title: "Složi svoje liste",
    description:
      "Pravi prelepe liste koje možeš da deliš. Bilo da je to 'Bezvremenski klasik' ili 'Najbolje B-strane', organizuj muziku po svom.",
    icon: imgFeature2,
  },
  {
    title: "Poveži se sa drugima",
    description:
      "Prati ostale kolekcionare, razmenjuj preporuke i vidi šta se trenutno vrti na gramofonima.",
    icon: imgFeature3,
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <img
        key={i}
        src={imgStar}
        alt="star"
        className="w-[11.67px] h-[11.08px]"
      />
    ))}
  </div>
);

const AlbumCard = ({ album }: { album: Album }) => (
  <div className="bg-[#2a2a2a] rounded-lg p-4">
    <div className="bg-[#1c1b1b] rounded overflow-hidden mb-4">
      <img
        src={album.image}
        alt={album.title}
        className="w-full h-64 object-cover"
      />
    </div>
    <h3 className="text-white font-serif font-bold text-lg mb-1 tracking-tight">
      {album.title}
    </h3>
    <p className="text-[#e6beb2] font-sans text-sm mb-3">{album.artist}</p>
    <StarRating rating={album.rating} />
  </div>
);

const ActivityCard = ({ activity }: { activity: ActivityItem }) => (
  <div className="bg-[#131313] rounded-lg p-6 flex gap-6">
    <img
      src={activity.avatar}
      alt={activity.user}
      className="w-12 h-12 rounded-full flex-shrink-0"
    />
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-white font-sans font-bold text-sm">
          {activity.user}
        </p>
        <p className="text-[#e6beb2] font-sans text-xs uppercase tracking-wide">
          {activity.action}
        </p>
      </div>
      {activity.rating > 0 && <StarRating rating={activity.rating} />}
      <p className="text-[#e6beb2] font-sans text-sm mt-2">
        {activity.content}
      </p>
      <div className="flex gap-4 mt-3">
        <button className="flex items-center gap-1 text-[#e6beb2] font-sans text-xs hover:text-white">
          <img src={imgLike} alt="like" className="w-3 h-3" />
          {activity.likes}
        </button>
        <button className="flex items-center gap-1 text-[#e6beb2] font-sans text-xs hover:text-white">
          <img src={imgComment} alt="comment" className="w-3 h-3" />
          {activity.comments}
        </button>
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-[#131313] text-white font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[rgba(19,19,19,0.7)] flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <h1
            id="logo"
            className="text-2xl font-serif font-bold italic text-[#ffb59e] tracking-tight"
          >
            vinyld
          </h1>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm font-serif border-b-2 border-[#ffb59e] text-[#ffb59e] pb-1"
            >
              Police
            </a>
            <a
              href="#"
              className="text-sm font-serif text-gray-500 hover:text-white transition"
            >
              Ljudi
            </a>
            <a
              href="#"
              className="text-sm font-serif text-gray-500 hover:text-white transition"
            >
              Priče
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition flex items-center justify-center">
            🔍
          </button>
          <button className="px-6 py-2 rounded bg-gradient-to-r from-[#ffb59e] to-[#ff5717] text-[#521300] font-serif font-bold text-sm hover:from-[#ffb59e] hover:to-[#ff6b2d] transition">
            Pridruži se
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#131313]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url('${imgHero}')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[rgba(19,19,19,0.8)] to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 py-24">
          <div className="max-w-2xl">
            <h1 className="text-8xl font-serif font-bold mb-8 leading-tight tracking-tight">
              Svaka Ploča
              <br />
              Priča
              <br />
              <span className="italic text-[#ffb59e]">Priču.</span>
            </h1>
            <p className="text-xl text-[#e6beb2] mb-12 leading-relaxed max-w-lg font-sans">
              Mesto okpljanja za muzičke entuzijaste. Podeli svoj ukus i poveži
              se sa prijateljima.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-4 rounded bg-gradient-to-r from-[#ffb59e] to-[#ff5717] text-[#521300] font-serif font-bold hover:from-[#ffb59e] hover:to-[#ff6b2d] transition">
                Započni svoju kolekciju
              </button>
              <button className="px-8 py-4 rounded bg-[#2a2a2a] text-[#e5e2e1] font-sans font-medium hover:bg-[#353534] transition">
                Istraži police
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#131313] py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <div key={idx}>
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-14 h-14 mb-6"
                />
                <h3 className="text-2xl font-serif font-bold mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[#e6beb2] font-sans text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Albums Section */}
      <section className="bg-[#131313] py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[#ffb59e] font-sans text-xs uppercase tracking-wider mb-2">
                Monthly Selection
              </p>
              <h2 className="text-5xl font-serif font-bold tracking-tight">
                Iconic Pressings
              </h2>
            </div>
            <a
              href="#"
              className="text-[#e6beb2] font-sans hover:text-white transition flex items-center gap-2"
            >
              View All
              <span>→</span>
            </a>
          </div>

          <div className="grid grid-cols-4 gap-8">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-[#1c1b1b] py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-12">
            <div>
              <h2 className="text-5xl font-serif font-bold mb-6 tracking-tight">
                Recent <span className="italic">Spins</span>
              </h2>
              <p className="text-[#e6beb2] font-sans text-lg mb-8">
                Join the conversation. See what the community is listening to
                and sharing right now.
              </p>
              <button className="px-6 py-3 rounded bg-[#353534] text-white font-sans hover:bg-[#3f3e3e] transition">
                Join Community
              </button>
            </div>

            <div className="col-span-2 space-y-6">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1c1b1b] border-t border-[#2a2a2a] py-12 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h3
              id="footer-logo"
              className="text-xl font-serif font-bold mb-2 tracking-tight"
            >
              vinyld
            </h3>
            <p className="text-xs font-sans text-white/40 uppercase tracking-wide">
              © 2026 vinyld. tvoja kolekcija, tvoja pravila.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
