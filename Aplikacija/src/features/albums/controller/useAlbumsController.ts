import { useEffect, useState } from "react";

import type { AlbumsItem } from "../model/types";
import { getAlbumsItems } from "../model/repository";

export function useAlbumsController() {
  const [items, setItems] = useState<AlbumsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getAlbumsItems().then((result) => {
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
