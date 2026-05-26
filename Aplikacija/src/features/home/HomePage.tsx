import { getHomePageViewModel } from "./controller/getHomePageViewModel";
import { HomePageView } from "./view/HomePageView";

export default async function HomePage() {
  const viewModel = await getHomePageViewModel();
  return <HomePageView {...viewModel} />;
}
