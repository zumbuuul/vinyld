import type { ActivityItem, HomeAssets } from "../../model/types";
import { ActivityCard } from "../components/ActivityCard";

interface RecentSpinsSectionProps {
  activities: ActivityItem[];
  assets: HomeAssets;
}

export function RecentSpinsSection({ activities, assets }: RecentSpinsSectionProps) {
  return (
    <section className="bg-[#1c1b1b] py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-12">
          <div>
            <h2 className="text-5xl font-serif font-bold mb-6 tracking-tight">
              Recent <span className="italic">Spins</span>
            </h2>
            <p className="text-[#e6beb2] font-sans text-lg mb-8">
              Join the conversation. See what the community is listening to and sharing right now.
            </p>
            <button className="px-6 py-3 rounded bg-[#353534] text-white font-sans hover:bg-[#3f3e3e] transition">
              Join Community
            </button>
          </div>

          <div className="col-span-2 space-y-6">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} assets={assets} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
