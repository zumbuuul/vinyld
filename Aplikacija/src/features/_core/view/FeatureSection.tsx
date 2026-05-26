import { PropsWithChildren } from "react";

interface FeatureSectionProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
}

export function FeatureSection({ title, subtitle, children }: FeatureSectionProps) {
  return (
    <section className="space-y-2 rounded-lg border p-4">
      <header>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
