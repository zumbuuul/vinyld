import type { HomePageData } from "../model/types";
import type {
  HomeActivityResponse,
  HomeAlbumsResponse,
  HomeFeaturesResponse,
} from "./contracts";

export function toHomeAlbumsResponse(data: HomePageData): HomeAlbumsResponse {
  return { items: data.albums };
}

export function toHomeActivityResponse(data: HomePageData): HomeActivityResponse {
  return { items: data.activities };
}

export function toHomeFeaturesResponse(data: HomePageData): HomeFeaturesResponse {
  return { items: data.features };
}
