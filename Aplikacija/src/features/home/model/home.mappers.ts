import type {
  ActivityItem,
  Album,
  HomeAssets,
  HomeFeatureItem,
  RawHomeActivity,
  RawHomeAlbum,
} from "./types";

const albumArtworkByTitle: Record<string, string> = {
  "Dark Side of the Moon": "darkSide",
  Rumours: "rumours",
  "Abbey Road": "abbeyRoad",
  "Kind of Blue": "kindOfBlue",
};

const avatarPool: Array<keyof HomeAssets> = ["beats", "kindOfBlue", "darkSide", "rumours"];

function toFiveStarScale(rating10: number): number {
  return Math.round(rating10 / 2);
}

export function mapRawAlbumToView(raw: RawHomeAlbum, assets: HomeAssets): Album {
  const artKey = albumArtworkByTitle[raw.title] as keyof HomeAssets | undefined;

  return {
    id: raw.id,
    title: raw.title,
    artist: raw.artist,
    image: artKey ? assets[artKey] : assets.darkSide,
    rating: toFiveStarScale(raw.averageRating10),
  };
}

export function mapRawActivityToView(
  raw: RawHomeActivity,
  assets: HomeAssets,
  index: number,
): ActivityItem {
  const avatarKey = avatarPool[index % avatarPool.length];

  return {
    id: raw.id,
    user: raw.user,
    action: `Reviewed \"${raw.albumTitle}\"`,
    content: raw.description || "Fresh listen added to the feed.",
    rating: toFiveStarScale(raw.rating10),
    likes: 0,
    comments: 0,
    avatar: assets[avatarKey],
  };
}

export function defaultHomeFeatureItems(assets: HomeAssets): HomeFeatureItem[] {
  return [
    {
      title: "Vodi svoj dnevnik",
      description:
        "Digitalni zapis svake preslusane ploce. Prati vreme i raspolozenje kroz celu svoju kolekciju.",
      icon: assets.feature1,
    },
    {
      title: "Slozi svoje liste",
      description:
        "Pravi prelepe liste koje mozes da delis. Bilo da je to 'Bezvremenski klasik' ili 'Najbolje B-strane', organizuj muziku po svom.",
      icon: assets.feature2,
    },
    {
      title: "Povezi se sa drugima",
      description:
        "Prati ostale kolekcionare, razmenjuj preporuke i vidi sta se trenutno vrti na gramofonima.",
      icon: assets.feature3,
    },
  ];
}
