import type { FacilitatorConfig, RouteConfig } from "x402/types";

export const PAYMENT_ADDRESS = (
  process.env.PAYMENT_ADDRESS ?? "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export const FACILITATOR: FacilitatorConfig = {
  url: (process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator") as `${string}://${string}`,
};

export function routeConfig(price: string, description: string): RouteConfig {
  return {
    price: price as `$${string}`,
    network: "base",
    config: { description },
  };
}
