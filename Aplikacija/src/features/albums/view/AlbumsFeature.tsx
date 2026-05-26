"use client";

import { FeatureSection } from "@/features/_core";

import { useAlbumsController } from "../controller/useAlbumsController";

export function AlbumsFeature() {
  const { items, loading } = useAlbumsController();

  return (
    <FeatureSection
      title="Albums"
      subtitle="MVC feature skeleton: controller orchestrates model data for the view."
    >
      {loading ? <p>Loading...</p> : <p>Items: {items.length}</p>}
    </FeatureSection>
  );
}
