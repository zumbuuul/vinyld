import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://project-ovhcy.vercel.app";
const DURATION = __ENV.K6_AVAILABILITY_DURATION || "5m";
const SLEEP_SECONDS = Number(__ENV.K6_AVAILABILITY_SLEEP || 5);

const pages = [
  { name: "home", path: "/", expectedText: "vinyld" },
  { name: "search", path: "/search", expectedText: "Explore" },
  { name: "login", path: "/login", expectedText: "Login" },
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
];

export const options = {
  scenarios: {
    availability_smoke: {
      executor: "constant-vus",
      vus: 1,
      duration: DURATION,
    },
  },
  thresholds: {
    "http_req_duration{test_case:TS29}": ["p(95)<2000", "p(99)<5000"],
    "http_req_failed{test_case:TS29}": ["rate<0.01"],
    "checks{test_case:TS29}": ["rate>0.99"],
  },
};

function buildUrl(path) {
  return `${BASE_URL}${path}`;
}

export default function availabilitySmoke() {
  const page = pages[__ITER % pages.length];
  const response = http.get(buildUrl(page.path), {
    tags: {
      test_case: "TS29",
      page: page.name,
    },
  });

  check(
    response,
    {
      "availability status is 200": (res) => res.status === 200,
      "availability returns html": (res) =>
        String(res.headers["Content-Type"] || "").includes("text/html"),
      "availability page has expected content": (res) =>
        res.body.includes(page.expectedText),
      "availability response under 2s": (res) => res.timings.duration < 2000,
    },
    {
      test_case: "TS29",
      page: page.name,
    },
  );

  sleep(SLEEP_SECONDS);
}
