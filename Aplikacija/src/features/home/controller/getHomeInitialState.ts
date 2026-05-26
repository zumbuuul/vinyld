import type { HomeInitialState } from "../model/types";

import { getHomePageViewModel } from "./getHomePageViewModel";

export async function getHomeInitialState(): Promise<HomeInitialState> {
  const viewModel = await getHomePageViewModel();

  return {
    hasFeaturedAlbums: viewModel.albums.length > 0,
    hasCommunityActivity: viewModel.activities.length > 0,
  };
}
