import { useEffect, useState } from "react";

import type { AuthItem } from "../model/types";
import { getAuthItems } from "../model/repository";

export function useAuthController() {
  const [items, setItems] = useState<AuthItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getAuthItems().then((result) => {
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
