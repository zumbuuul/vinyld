import { useEffect, useState } from "react";

import type { SearchItem } from "../model/types";
import { getSearchItems } from "../model/repository";

export function useSearchController() {
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getSearchItems().then((result) => {
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
