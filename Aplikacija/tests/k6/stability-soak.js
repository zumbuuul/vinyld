/* global __ENV, __ITER */

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://project-ovhcy.vercel.app";
const DURATION = __ENV.K6_STABILITY_DURATION || "10m";
const RATE = Number(__ENV.K6_STABILITY_RATE || 5);
const PRE_ALLOCATED_VUS = Number(__ENV.K6_STABILITY_PRE_ALLOCATED_VUS || 10);
const MAX_VUS = Number(__ENV.K6_STABILITY_MAX_VUS || 30);

const weightedPages = [
  { name: "home", path: "/", expectedText: "vinyld" },
  { name: "home", path: "/", expectedText: "vinyld" },
  { name: "search", path: "/search", expectedText: "Explore" },
  { name: "search", path: "/search", expectedText: "Explore" },
  { name: "community", path: "/community", expectedText: "Community" },
  {
    name: "album",
    path: "/album/6LCtJCdRXOFzTSJkkLoLMr",
    expectedText: "Album",
  },
  {
    name: "song",
    path: "/song/5Bjt6SnjtlVe8akgaq94FH",
    expectedText: "Song",
  },
  { name: "login", path: "/login", expectedText: "Login" },
];

export const options = {
  scenarios: {
    stability_soak: {
      executor: "constant-arrival-rate",
      rate: RATE,
      timeUnit: "1s",
      duration: DURATION,
      preAllocatedVUs: PRE_ALLOCATED_VUS,
      maxVUs: MAX_VUS,
    },
  },
  thresholds: {
    "http_req_duration{test_case:TS30}": ["p(95)<2500", "p(99)<5000"],
    "http_req_failed{test_case:TS30}": ["rate<0.01"],
    "checks{test_case:TS30}": ["rate>0.99"],
  },
};

function buildUrl(path) {
  return `${BASE_URL}${path}`;
}

export default function stabilitySoak() {
  const page = weightedPages[__ITER % weightedPages.length];
  const response = http.get(buildUrl(page.path), {
    tags: {
      test_case: "TS30",
      page: page.name,
    },
  });

  check(
    response,
    {
      "stability status is 200": (res) => res.status === 200,
      "stability returns html": (res) =>
        String(res.headers["Content-Type"] || "").includes("text/html"),
      "stability page has expected content": (res) =>
        res.body.includes(page.expectedText),
      "stability response under 5s": (res) => res.timings.duration < 5000,
    },
    {
      test_case: "TS30",
      page: page.name,
    },
  );

  sleep(1);
}
