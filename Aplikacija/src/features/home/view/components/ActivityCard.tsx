import Image from "next/image";

import type { ActivityItem, HomeAssets } from "../../model/types";
import { StarRating } from "./StarRating";

interface ActivityCardProps {
  activity: ActivityItem;
  assets: HomeAssets;
}

export function ActivityCard({ activity, assets }: ActivityCardProps) {
  return (
    <div className="bg-[#131313] rounded-lg p-6 flex gap-6">
      <Image
        src={activity.avatar}
        alt={activity.user}
        width={48}
        height={48}
        unoptimized={true}
        className="w-12 h-12 rounded-full flex-shrink-0"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-white font-sans font-bold text-sm">{activity.user}</p>
          <p className="text-[#e6beb2] font-sans text-xs uppercase tracking-wide">{activity.action}</p>
        </div>
        {activity.rating > 0 && <StarRating rating={activity.rating} starSrc={assets.star} />}
        <p className="text-[#e6beb2] font-sans text-sm mt-2">{activity.content}</p>
        <div className="flex gap-4 mt-3">
          <button className="flex items-center gap-1 text-[#e6beb2] font-sans text-xs hover:text-white">
            <Image
              src={assets.like}
              alt="like"
              width={12}
              height={12}
              unoptimized={true}
              className="w-3 h-3"
            />
            {activity.likes}
          </button>
          <button className="flex items-center gap-1 text-[#e6beb2] font-sans text-xs hover:text-white">
            <Image
              src={assets.comment}
              alt="comment"
              width={12}
              height={12}
              unoptimized={true}
              className="w-3 h-3"
            />
            {activity.comments}
          </button>
        </div>
      </div>
    </div>
  );
}
