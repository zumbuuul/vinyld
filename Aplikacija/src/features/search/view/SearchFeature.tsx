"use client";

import { FeatureSection } from "@/features/_core";

import { useSearchController } from "../controller/useSearchController";

export function SearchFeature() {
  const { items, loading } = useSearchController();

  return (
    <FeatureSection
      title="Search"
      subtitle="MVC feature skeleton: controller orchestrates model data for the view."
    >
      {loading ? <p>Loading...</p> : <p>Items: {items.length}</p>}
    </FeatureSection>
  );
}
