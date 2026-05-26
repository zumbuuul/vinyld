import { useEffect, useState } from "react";

import type { ActivityItem } from "../model/types";
import { getActivityItems } from "../model/repository";

export function useActivityController() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getActivityItems().then((result) => {
      if (active) {
        setItems(result);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return { items, loading };
}
