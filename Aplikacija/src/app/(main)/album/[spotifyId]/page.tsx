import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  getAlbumDetails,
  getCriticReviews,
  getCriticScore,
  getExistingReview,
  getUserReviews,
  getUserScore,
} from "@/actions/album.actions";
import { AlbumHeader } from "@/components/album/AlbumHeader";
import { CriticReviewForm } from "@/components/album/CriticReviewForm";
import { CriticReviewList } from "@/components/album/CriticReviewList";
import { ReviewForm } from "@/components/album/ReviewForm";
import { ReviewList } from "@/components/album/ReviewList";
import { ScoreDisplay } from "@/components/album/ScoreDisplay";
import { TrackList } from "@/components/album/TrackList";
import { auth } from "@/lib/auth";

type AlbumPageProps = {
  params: Promise<{
    spotifyId: string;
  }>;
};

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { spotifyId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const albumDetails = await getAlbumDetails(spotifyId).catch(() => notFound());

  const [userReviewPage, criticReviewPage, userScore, criticScore, existingReview] =
    await Promise.all([
      getUserReviews(albumDetails.id, 1),
      getCriticReviews(albumDetails.id, 1),
      getUserScore(albumDetails.id),
      getCriticScore(albumDetails.id),
      session
        ? getExistingReview(albumDetails.id, session.user.id)
        : Promise.resolve(null),
    ]);

  const isAuthenticated = Boolean(session);
  const redirectUrl = `/album/${albumDetails.spotifyId}`;
  const sessionUserId = session?.user.id ?? null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <AlbumHeader
        albumId={albumDetails.id}
        albumName={albumDetails.name}
        albumImageUrl={albumDetails.imageUrl}
        artists={albumDetails.artists}
        releaseYear={albumDetails.releaseYear}
        genres={albumDetails.genres}
        isAuthenticated={isAuthenticated}
        redirectUrl={redirectUrl}
        initialLiked={existingReview?.userReview?.liked ?? false}
      />

      <ScoreDisplay userScore={userScore} criticScore={criticScore} />

      <TrackList
        tracks={albumDetails.tracks}
        userId={sessionUserId}
        isAuthenticated={isAuthenticated}
        redirectUrl={redirectUrl}
      />

      {existingReview?.role === "user" ? (
        <ReviewForm
          albumId={albumDetails.id}
          existingReview={existingReview.userReview}
          isAuthenticated={isAuthenticated}
          redirectUrl={redirectUrl}
        />
      ) : null}

      {existingReview?.role === "critic" ? (
        <CriticReviewForm
          albumId={albumDetails.id}
          existingReview={existingReview.criticReview}
          isAuthenticated={isAuthenticated}
          redirectUrl={redirectUrl}
        />
      ) : null}

      <ReviewList
        albumId={albumDetails.id}
        initialReviewPage={userReviewPage}
        isAuthenticated={isAuthenticated}
        redirectUrl={redirectUrl}
      />

      <CriticReviewList
        albumId={albumDetails.id}
        initialReviewPage={criticReviewPage}
        isAuthenticated={isAuthenticated}
        redirectUrl={redirectUrl}
      />
    </div>
  );
}
