"use client";

import { FeatureSection } from "@/features/_core";

import { useProfileController } from "../controller/useProfileController";

export function ProfileFeature() {
  const { items, loading } = useProfileController();

  return (
    <FeatureSection
      title="Profile"
      subtitle="MVC feature skeleton: controller orchestrates model data for the view."
    >
      {loading ? <p>Loading...</p> : <p>Items: {items.length}</p>}
    </FeatureSection>
  );
}
