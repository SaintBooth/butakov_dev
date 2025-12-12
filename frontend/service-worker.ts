/* eslint-disable no-undef */
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

defaultCache(self, {
  precacheEntries: [],
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  navigationPreload: true,
});

