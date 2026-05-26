export interface Album {
  id: string;
  title: string;
  artist: string;
  image: string;
  rating: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  content: string;
  rating: number;
  likes: number;
  comments: number;
  avatar: string;
}

export interface HomeFeatureItem {
  title: string;
  description: string;
  icon: string;
}

export interface HomeAssets {
  beats: string;
  darkSide: string;
  rumours: string;
  abbeyRoad: string;
  kindOfBlue: string;
  hero: string;
  star: string;
  like: string;
  comment: string;
  feature1: string;
  feature2: string;
  feature3: string;
}

export interface RawHomeAlbum {
  id: string;
  title: string;
  artist: string;
  spotifyId: string;
  averageRating10: number;
}

export interface RawHomeActivity {
  id: string;
  user: string;
  albumTitle: string;
  description: string;
  rating10: number;
  createdAt: string;
}

export interface HomePageData {
  assets: HomeAssets;
  albums: Album[];
  activities: ActivityItem[];
  features: HomeFeatureItem[];
}

export interface HomeMetadata {
  title: string;
  description: string;
}

export interface HomeInitialState {
  hasFeaturedAlbums: boolean;
  hasCommunityActivity: boolean;
}
