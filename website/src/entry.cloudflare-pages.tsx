import {
  createQwikCity,
  type PlatformCloudflarePages,
} from "@builder.io/qwik-city/middleware/cloudflare-pages";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";

const onRequest = createQwikCity({ render, qwikCityPlan, manifest });

export { onRequest };
export type { PlatformCloudflarePages };
