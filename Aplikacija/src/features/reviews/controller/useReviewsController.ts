import { useEffect, useState } from "react";

import type { ReviewsItem } from "../model/types";
import { getReviewsItems } from "../model/repository";

export function useReviewsController() {
  const [items, setItems] = useState<ReviewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getReviewsItems().then((result) => {
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
