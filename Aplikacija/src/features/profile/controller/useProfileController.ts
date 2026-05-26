import { useEffect, useState } from "react";

import type { ProfileItem } from "../model/types";
import { getProfileItems } from "../model/repository";

export function useProfileController() {
  const [items, setItems] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getProfileItems().then((result) => {
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
