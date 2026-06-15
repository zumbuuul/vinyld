# k6 tests

These tests run locally from the terminal with `k6 run`; k6 Cloud is not required.

k6 is a standalone CLI, not a Node.js test runner. It is not installed through
`npm install` as a project dev dependency. Install the local CLI first:

```bash
sudo gpg -k
curl -s https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update
sudo apt install k6
```

Verify it:

```bash
npm run k6:version
```

## TS21 search performance

TS21 uses the local k6-only API route because the app's `/search` UI calls a
Server Action rather than a public REST endpoint.

Start the app with the k6-only API enabled:

```bash
npm run dev:k6
```

Then run TS21 from another terminal:

```bash
npm run test:k6:search
```

Optional configuration:

```bash
BASE_URL=http://localhost:3000 K6_SEARCH_VUS=5 K6_SEARCH_DURATION=1m npm run test:k6:search
```

`/api/k6/*` routes are test-only. They return `404` unless the app is started
with `K6_TEST_API=1`.

## TS29 availability

TS29 hits only the Vercel preview deployment by default:

```bash
npm run test:k6:availability
```

Optional configuration:

```bash
BASE_URL=https://project-ovhcy.vercel.app K6_AVAILABILITY_DURATION=5m npm run test:k6:availability
```

## TS30 stability

TS30 also hits only the Vercel preview deployment by default:

```bash
npm run test:k6:stability
```

Optional configuration:

```bash
BASE_URL=https://project-ovhcy.vercel.app K6_STABILITY_DURATION=10m K6_STABILITY_RATE=5 npm run test:k6:stability
```
