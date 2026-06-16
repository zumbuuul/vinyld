/* global __ENV, __ITER */

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://project-ovhcy.vercel.app";
const VUS = Number(__ENV.K6_SEARCH_VUS || 5);
const DURATION = __ENV.K6_SEARCH_DURATION || "1m";

const searchCases = [
  {
    name: "search_default",
    params: {},
  },
  {
    name: "search_all_relevance",
    params: { type: "all", period: "all", sort: "relevance" },
  },
  {
    name: "search_album_popularity",
    params: { type: "album", period: "all", sort: "popularity" },
  },
  {
    name: "search_song_popularity",
    params: { type: "song", period: "all", sort: "popularity" },
  },
  {
    name: "search_2020s",
    params: { period: "2020s" },
  },
];

export const options = {
  scenarios: {
    search_performance: {
      executor: "constant-vus",
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    "http_req_duration{area:search}": ["p(95)<2000", "p(99)<3000"],
    "http_req_failed{area:search}": ["rate<0.01"],
    "checks{area:search}": ["rate>0.99"],
  },
};

function buildUrl(path, params) {
  const pairs = Object.entries(params).map(
    ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
  );

  return pairs.length > 0 ? `${BASE_URL}${path}?${pairs.join("&")}` : `${BASE_URL}${path}`;
}

export default function searchPerformance() {
  const searchCase = searchCases[__ITER % searchCases.length];
  const response = http.get(buildUrl("/search", searchCase.params), {
    tags: {
      area: "search",
      search_case: searchCase.name,
    },
  });

  check(
    response,
    {
      "search status is 200": (res) => res.status === 200,
      "search response is html": (res) =>
        String(res.headers["Content-Type"] || "").includes("text/html"),
      "search page has expected content": (res) => res.body.includes("Explore"),
    },
    { area: "search", search_case: searchCase.name },
  );

  sleep(1);
}
