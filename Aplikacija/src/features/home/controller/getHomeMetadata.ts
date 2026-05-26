import type { HomeMetadata } from "../model/types";

export async function getHomeMetadata(): Promise<HomeMetadata> {
  return {
    title: "vinyld",
    description: "Discover, review, and collect music with your community.",
  };
}
