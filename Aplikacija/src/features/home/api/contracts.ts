import type { HomeFeatureItem } from "../model/types";

export interface HomeAlbumsResponse {
  items: Array<{
    id: string;
    title: string;
    artist: string;
    rating: number;
    image: string;
  }>;
}

export interface HomeActivityResponse {
  items: Array<{
    id: string;
    user: string;
    action: string;
    content: string;
    rating: number;
    likes: number;
    comments: number;
    avatar: string;
  }>;
}

export interface HomeFeaturesResponse {
  items: HomeFeatureItem[];
}
