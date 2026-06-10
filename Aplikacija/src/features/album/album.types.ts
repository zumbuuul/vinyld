export type AlbumTrack = {
  id: string;
  spotifyId: string;
  name: string;
  durationMs: number;
  trackNumber: number;
};

export type AlbumDetails = {
  id: string;
  spotifyId: string;
  name: string;
  releaseYear: number | null;
  artists: string[];
  imageUrl: string | null;
  genres: string[];
  tracks: AlbumTrack[];
};

export type UserAlbumReview = {
  id: string;
  albumId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  ocena: number | null;
  liked: boolean;
  description: string | null;
  dateCreated: string;
  likeCount: number;
  likedByCurrentUser: boolean;
};

export type CriticAlbumReview = {
  id: string;
  albumId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  naslov: string;
  ocena: number;
  tekstKritike: string;
  zakljucak: string | null;
  dateCreated: string;
  likeCount: number;
  likedByCurrentUser: boolean;
};

export type AlbumScore = {
  average: number | null;
  reviewCount: number;
};

export type AlbumReviewPage<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type AlbumLikeTargetType = "album" | "user_review" | "critic_review";

export type ViewerRole = "user" | "critic" | "artist" | "admin";

export type ExistingAlbumReview = {
  role: ViewerRole;
  userReview: {
    id: string;
    ocena: number | null;
    liked: boolean;
    description: string | null;
  } | null;
  criticReview: {
    id: string;
    naslov: string;
    ocena: number;
    tekstKritike: string;
    zakljucak: string | null;
  } | null;
};

export type UserStoryListItem = {
  id: string;
  name: string;
  imageUrl: string;
  songCount: number;
  likeCount: number;
};
