import { useEffect, useState } from "react";

import type { PlaylistsItem } from "../model/types";
import { getPlaylistsItems } from "../model/repository";

export function usePlaylistsController() {
  const [items, setItems] = useState<PlaylistsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getPlaylistsItems().then((result) => {
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
