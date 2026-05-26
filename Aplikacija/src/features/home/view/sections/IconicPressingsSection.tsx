import type { Album } from "../../model/types";
import { AlbumCard } from "../components/AlbumCard";

interface IconicPressingsSectionProps {
  albums: Album[];
  starSrc: string;
}

export function IconicPressingsSection({ albums, starSrc }: IconicPressingsSectionProps) {
  return (
    <section className="bg-[#131313] py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[#ffb59e] font-sans text-xs uppercase tracking-wider mb-2">Monthly Selection</p>
            <h2 className="text-5xl font-serif font-bold tracking-tight">Iconic Pressings</h2>
          </div>
          <a href="#" className="text-[#e6beb2] font-sans hover:text-white transition flex items-center gap-2">
            View All
            <span>{"->"}</span>
          </a>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} starSrc={starSrc} />
          ))}
        </div>
      </div>
    </section>
  );
}
