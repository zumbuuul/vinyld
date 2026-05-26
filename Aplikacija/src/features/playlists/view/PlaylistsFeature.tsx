"use client";

import { FeatureSection } from "@/features/_core";

import { usePlaylistsController } from "../controller/usePlaylistsController";

export function PlaylistsFeature() {
  const { items, loading } = usePlaylistsController();

  return (
    <FeatureSection
      title="Playlists"
      subtitle="MVC feature skeleton: controller orchestrates model data for the view."
    >
      {loading ? <p>Loading...</p> : <p>Items: {items.length}</p>}
    </FeatureSection>
  );
}
