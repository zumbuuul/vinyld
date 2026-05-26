"use client";

import { FeatureSection } from "@/features/_core";

import { useReviewsController } from "../controller/useReviewsController";

export function ReviewsFeature() {
  const { items, loading } = useReviewsController();

  return (
    <FeatureSection
      title="Reviews"
      subtitle="MVC feature skeleton: controller orchestrates model data for the view."
    >
      {loading ? <p>Loading...</p> : <p>Items: {items.length}</p>}
    </FeatureSection>
  );
}
