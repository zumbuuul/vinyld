"use server";

import {
  getPopularUsersRows,
  getSimilarTasteRows,
  getTopCriticsRows,
  mapRowsToCommunityCards,
} from "@/db/queries/community.queries";
import type { CommunityUserCardItem } from "@/features/community/community.types";

export async function getTopCritics(
  viewerId: string | null,
): Promise<CommunityUserCardItem[]> {
  const rows = await getTopCriticsRows(10, viewerId);

  return mapRowsToCommunityCards(rows, (value) =>
    value === 1 ? "1 critique like" : `${value} critique likes`,
  );
}

export async function getPopularUsers(
  viewerId: string | null,
): Promise<CommunityUserCardItem[]> {
  const rows = await getPopularUsersRows(10, viewerId);

  return mapRowsToCommunityCards(rows, (value) =>
    value === 1 ? "1 total like" : `${value} total likes`,
  );
}

export async function getSimilarTaste(
  viewerId: string | null,
): Promise<CommunityUserCardItem[]> {
  if (!viewerId) {
    return [];
  }

  const rows = await getSimilarTasteRows(viewerId, 10);

  return mapRowsToCommunityCards(rows, (value) =>
    value === 1 ? "1 shared favorite" : `${value} shared favorites`,
  );
}
