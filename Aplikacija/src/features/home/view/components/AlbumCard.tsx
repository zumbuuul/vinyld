import Image from "next/image";

import type { Album } from "../../model/types";
import { StarRating } from "./StarRating";

interface AlbumCardProps {
  album: Album;
  starSrc: string;
}

export function AlbumCard({ album, starSrc }: AlbumCardProps) {
  return (
    <div className="bg-[#2a2a2a] rounded-lg p-4">
      <div className="bg-[#1c1b1b] rounded overflow-hidden mb-4">
        <Image
          src={album.image}
          alt={album.title}
          width={480}
          height={480}
          unoptimized={true}
          className="w-full h-64 object-cover"
        />
      </div>
      <h3 className="text-white font-serif font-bold text-lg mb-1 tracking-tight">
        {album.title}
      </h3>
      <p className="text-[#e6beb2] font-sans text-sm mb-3">{album.artist}</p>
      <StarRating rating={album.rating} starSrc={starSrc} />
    </div>
  );
}
