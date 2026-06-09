export type FeedActivityKind = "review" | "critic_review" | "story" | "follow";

export type RecentFeedItem = {
  id: string;
  kind: FeedActivityKind;
  actorId: string;
  actorName: string;
  actorImage: string | null;
  createdAt: string;
  albumSpotifyId: string | null;
  albumName: string | null;
  storyId: string | null;
  storyName: string | null;
  storyImage: string | null;
  targetUserId: string | null;
  targetUserName: string | null;
  targetUserImage: string | null;
  title: string | null;
  summary: string | null;
  albumArtist: string | null;
  albumImageUrl: string | null;
  rating10: number | null;
  activityLabel: string;
  targetHref: string | null;
};

export type TrendingReviewItem = {
  id: string;
  reviewType: "user" | "critic";
  userName: string;
  userImage: string | null;
  albumName: string;
  albumArtist: string;
  albumSpotifyId: string;
  albumImageUrl: string | null;
  excerpt: string;
  rating10: number | null;
  likeCount: number;
};

export type PopularStory = {
  id: string;
  name: string;
  imageUrl: string | null;
  userName: string;
  userImage: string | null;
  likeCount: number;
};

export type PopularUser = {
  id: string;
  name: string;
  imageUrl: string | null;
  likeCount: number;
};

export type TrendingData = {
  popularReviews: TrendingReviewItem[];
  popularStories: PopularStory[];
  popularUsers: PopularUser[];
};

export type RecentFeedCursor = {
  createdAt: string;
  id: string;
};

export type RecentFeedPage = {
  items: RecentFeedItem[];
  nextCursor: RecentFeedCursor | null;
  hasMore: boolean;
  asOf: string;
};
