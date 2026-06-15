/* global __ENV, __ITER */

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const VUS = Number(__ENV.K6_SEARCH_VUS || 5);
const DURATION = __ENV.K6_SEARCH_DURATION || "1m";

const searchCases = [
  {
    name: "all_relevance",
    params: { type: "all", period: "all", sort: "relevance" },
  },
  {
    name: "albums_popularity",
    params: { type: "album", period: "all", sort: "popularity" },
  },
  {
    name: "songs_popularity",
    params: { type: "song", period: "all", sort: "popularity" },
  },
  {
    name: "albums_2020s_rating_desc",
    params: { type: "album", period: "2020s", sort: "ratingDesc" },
  },
  {
    name: "songs_2010s_rating_desc",
    params: { type: "song", period: "2010s", sort: "ratingDesc" },
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

  return `${BASE_URL}${path}?${pairs.join("&")}`;
}

export default function searchPerformance() {
  const searchCase = searchCases[__ITER % searchCases.length];
  const response = http.get(buildUrl("/api/k6/search", searchCase.params), {
    tags: {
      area: "search",
      search_case: searchCase.name,
    },
  });

  check(
    response,
    {
      "search status is 200": (res) => res.status === 200,
      "search response is json": (res) =>
        String(res.headers["Content-Type"] || "").includes("application/json"),
      "search returns item count": (res) =>
        typeof res.json("itemCount") === "number",
      "search p95 requirement sample under 2s": (res) =>
        res.timings.duration < 2000,
    },
    { area: "search", search_case: searchCase.name },
  );

  sleep(1);
}
