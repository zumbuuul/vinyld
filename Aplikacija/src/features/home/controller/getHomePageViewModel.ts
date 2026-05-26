import { getHomePageData } from "../model/home.repository";

export async function getHomePageViewModel() {
  return getHomePageData();
}
