import Image from "next/image";

import type { HomeFeatureItem } from "../../model/types";

interface FeaturesSectionProps {
  features: HomeFeatureItem[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="bg-[#131313] py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-12">
          {features.map((feature) => (
            <div key={feature.title}>
              <Image
                src={feature.icon}
                alt={feature.title}
                width={56}
                height={56}
                unoptimized={true}
                className="w-14 h-14 mb-6"
              />
              <h3 className="text-2xl font-serif font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-[#e6beb2] font-sans text-base leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
