/* eslint-disable no-undef */
import { defaultCache } from "@serwist/next/worker";

declare const self: ServiceWorkerGlobalScope;

defaultCache(self, {
  precacheEntries: [],
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  navigationPreload: true,
});

