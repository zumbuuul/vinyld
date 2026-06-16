/* global __ENV, __ITER */

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://project-ovhcy.vercel.app";
const VUS = Number(__ENV.K6_CONTENT_VUS || 5);
const DURATION = __ENV.K6_CONTENT_DURATION || "1m";

const defaultAlbumPaths = ["/album/6LCtJCdRXOFzTSJkkLoLMr"];
const defaultSongPaths = ["/song/5Bjt6SnjtlVe8akgaq94FH"];

function splitPaths(value, fallback) {
  if (!value) {
    return fallback;
  }

  const paths = value
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean);

  return paths.length > 0 ? paths : fallback;
}

const pages = [
  ...splitPaths(__ENV.K6_ALBUM_PATHS, defaultAlbumPaths).map((path) => ({
    name: `album:${path}`,
    type: "album",
    path,
    expectedText: "Album",
  })),
  ...splitPaths(__ENV.K6_SONG_PATHS, defaultSongPaths).map((path) => ({
    name: `song:${path}`,
    type: "song",
    path,
    expectedText: "Song",
  })),
];

export const options = {
  scenarios: {
    content_pages_performance: {
      executor: "constant-vus",
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    "http_req_duration{test_case:TS22}": ["p(95)<2500", "p(99)<5000"],
    "http_req_failed{test_case:TS22}": ["rate<0.01"],
    "checks{test_case:TS22}": ["rate>0.99"],
  },
};

function buildUrl(path) {
  return `${BASE_URL}${path}`;
}

export default function contentPagesPerformance() {
  const page = pages[__ITER % pages.length];
  const response = http.get(buildUrl(page.path), {
    tags: {
      test_case: "TS22",
      page_type: page.type,
      page: page.name,
    },
  });

  check(
    response,
    {
      "content page status is 200": (res) => res.status === 200,
      "content page returns html": (res) =>
        String(res.headers["Content-Type"] || "").includes("text/html"),
      "content page has expected content": (res) =>
        res.body.includes(page.expectedText),
    },
    {
      test_case: "TS22",
      page_type: page.type,
      page: page.name,
    },
  );

  sleep(1);
}
