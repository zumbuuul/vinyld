"use client";

import { FeatureSection } from "@/features/_core";

import { useAuthController } from "../controller/useAuthController";

export function AuthFeature() {
  const { items, loading } = useAuthController();

  return (
    <FeatureSection
      title="Auth"
      subtitle="MVC feature skeleton: controller orchestrates model data for the view."
    >
      {loading ? <p>Loading...</p> : <p>Items: {items.length}</p>}
    </FeatureSection>
  );
}
