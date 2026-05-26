import {
  defaultHomeFeatureItems,
  mapRawActivityToView,
  mapRawAlbumToView,
} from "./home.mappers";
import { getCachedFeaturedAlbums, getCachedRecentActivity } from "./home.cache";
import { validateRawActivity, validateRawAlbum } from "./home.validation";
import type { HomeAssets, HomePageData } from "./types";

const assets: HomeAssets = {
  beats: "https://www.figma.com/api/mcp/asset/8ac54f36-b850-495d-a553-500caf44858e",
  darkSide: "https://www.figma.com/api/mcp/asset/75233400-157a-4170-9be8-e59bfc9a7dcd",
  rumours: "https://www.figma.com/api/mcp/asset/008fadee-c88c-40e9-80bc-c6333f7c236c",
  abbeyRoad: "https://www.figma.com/api/mcp/asset/ae304d3a-37bd-468b-a7d9-d63388143f5d",
  kindOfBlue: "https://www.figma.com/api/mcp/asset/b70b8fae-ca5e-46a1-bad5-07915f0d1c55",
  hero: "https://www.figma.com/api/mcp/asset/267a4820-9ab2-4643-8a27-1d231e502076",
  star: "https://www.figma.com/api/mcp/asset/dec2db42-d23c-4264-9d09-49819d329f4e",
  like: "https://www.figma.com/api/mcp/asset/efcbe5d3-13ca-4e22-ab03-ad9d86849704",
  comment: "https://www.figma.com/api/mcp/asset/e921d34f-92c4-4be4-ba0e-6897533f39a1",
  feature1: "https://www.figma.com/api/mcp/asset/770bcd5c-596b-45e3-8bf2-b7595a437417",
  feature2: "https://www.figma.com/api/mcp/asset/ef9b1ab8-3e84-4830-b6b6-52d8d47f5774",
  feature3: "https://www.figma.com/api/mcp/asset/7d7cb9ce-57d4-45a2-9a35-2179c3a5f262",
};

function fallbackData(): HomePageData {
  return {
    assets,
    albums: [
      {
        id: "fallback-1",
        title: "Dark Side of the Moon",
        artist: "Pink Floyd",
        image: assets.darkSide,
        rating: 5,
      },
      {
        id: "fallback-2",
        title: "Rumours",
        artist: "Fleetwood Mac",
        image: assets.rumours,
        rating: 4,
      },
      {
        id: "fallback-3",
        title: "Abbey Road",
        artist: "The Beatles",
        image: assets.abbeyRoad,
        rating: 5,
      },
      {
        id: "fallback-4",
        title: "Kind of Blue",
        artist: "Miles Davis",
        image: assets.kindOfBlue,
        rating: 5,
      },
    ],
    activities: [
      {
        id: "fallback-a1",
        user: "Julian V.",
        action: 'Added to "Midnight Jazz"',
        content:
          '"The pressing quality on this Blue Note reissue is absolutely stellar. Minimal surface noise and incredible dynamic range."',
        rating: 0,
        likes: 42,
        comments: 12,
        avatar: assets.beats,
      },
      {
        id: "fallback-a2",
        user: "Sarah K.",
        action: 'Reviewed "Pet Sounds"',
        content:
          '"A masterpiece that never ages. Every spin reveals a new layer of harmony."',
        rating: 5,
        likes: 156,
        comments: 24,
        avatar: assets.kindOfBlue,
      },
    ],
    features: defaultHomeFeatureItems(assets),
  };
}

export async function getHomePageData(): Promise<HomePageData> {
  const [rawAlbums, rawActivities] = await Promise.all([
    getCachedFeaturedAlbums(),
    getCachedRecentActivity(),
  ]);

  if (rawAlbums.length === 0 && rawActivities.length === 0) {
    return fallbackData();
  }

  const albums = rawAlbums
    .map(validateRawAlbum)
    .map((item) => mapRawAlbumToView(item, assets));

  const activities = rawActivities
    .map(validateRawActivity)
    .map((item, index) => mapRawActivityToView(item, assets, index));

  return {
    assets,
    albums: albums.length > 0 ? albums : fallbackData().albums,
    activities: activities.length > 0 ? activities : fallbackData().activities,
    features: defaultHomeFeatureItems(assets),
  };
}
