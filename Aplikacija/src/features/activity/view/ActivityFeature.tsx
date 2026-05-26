"use client";

import { FeatureSection } from "@/features/_core";

import { useActivityController } from "../controller/useActivityController";

export function ActivityFeature() {
  const { items, loading } = useActivityController();

  return (
    <FeatureSection
      title="Activity"
      subtitle="MVC feature skeleton: controller orchestrates model data for the view."
    >
      {loading ? <p>Loading...</p> : <p>Items: {items.length}</p>}
    </FeatureSection>
  );
}
