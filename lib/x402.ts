import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import type { FacilitatorConfig } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import { registerExactSvmScheme } from "@x402/svm/exact/server";
import { createFacilitatorConfig } from "@coinbase/x402";

const DEFAULT_PAY_TO_BASE = "0xC67d94504696960bA0f2e7C3FeE703950734c00A";
const DEFAULT_PAY_TO_SOLANA = "4s8XQC2WzRfgH8Xiep7ybnCW11VKRCMwxQF6jknx3VPf";

export const PAY_TO_BASE = (
  process.env.WALLET_ADDRESS_BASE ?? process.env.WALLET_ADDRESS ?? DEFAULT_PAY_TO_BASE
) as `0x${string}`;

export const PAY_TO_SOLANA =
  process.env.WALLET_ADDRESS_SOLANA ?? DEFAULT_PAY_TO_SOLANA;

export const BASE_NETWORK = "eip155:8453" as const;
export const SOLANA_NETWORK = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as const;

// USDC on Base
export const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
// USDC on Solana
export const USDC_SOLANA = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as const;

function buildFacilitatorConfig(): FacilitatorConfig {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  if (apiKeyId && apiKeySecret) {
    return createFacilitatorConfig(apiKeyId, apiKeySecret);
  }
  const url = process.env.FACILITATOR_URL;
  if (url && /^https?:\/\//.test(url)) {
    return { url };
  }
  return {};
}

const facilitatorClient = new HTTPFacilitatorClient(buildFacilitatorConfig());

export const x402Server = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(x402Server);
registerExactSvmScheme(x402Server);
