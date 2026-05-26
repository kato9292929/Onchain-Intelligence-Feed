import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { getSmartMoneyJpData } from "@/lib/nansen";
import { generateSmartMoneyJpSummary } from "@/lib/claude";
import { getCache, setCache, TTL } from "@/lib/cache";
import { today } from "@/lib/utils";
import { PAY_TO, BASE_NETWORK, x402Server } from "@/lib/x402";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SmartMoneyJpResponse {
  date: string;
  region: "JP";
  summary_ja: string;
  jp_exchange_flows: {
    exchange: string;
    net_flow_usd: number;
    inflow_usd: number;
    outflow_usd: number;
  }[];
  smart_money: {
    top_buys: string[];
    top_sells: string[];
    active_wallets: number;
  };
  alerts: {
    token: string;
    score: number;
    reason: string;
    volume_usd: number;
  }[];
  market_signal: "bullish" | "bearish" | "neutral";
  data_sources: string[];
}

const CACHE_KEY = "smart-money-jp";

async function handler(_req: NextRequest): Promise<NextResponse> {
  const cached = await getCache<SmartMoneyJpResponse>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": `public, max-age=${TTL.SMART_MONEY}, stale-while-revalidate=60` },
    });
  }

  const data = await getSmartMoneyJpData();
  const summary_ja = await generateSmartMoneyJpSummary(data);

  const top_buys = data.smart_money_activities.filter((a) => a.action === "buy").slice(0, 3).map((a) => a.token);
  const top_sells = data.smart_money_activities.filter((a) => a.action === "sell").slice(0, 3).map((a) => a.token);
  const active_wallets = data.smart_money_activities.reduce((sum, a) => sum + a.wallet_count, 0);
  const net_inflow_usd = data.jp_exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);
  const market_signal = net_inflow_usd > 1_000_000 ? "bullish" : net_inflow_usd < -1_000_000 ? "bearish" : "neutral";

  const response: SmartMoneyJpResponse = {
    date: today(),
    region: "JP",
    summary_ja,
    jp_exchange_flows: data.jp_exchange_flows,
    smart_money: { top_buys, top_sells, active_wallets },
    alerts: data.scored_alerts.slice(0, 5),
    market_signal,
    data_sources: ["nansen"],
  };

  await setCache(CACHE_KEY, response, TTL.SMART_MONEY);

  return NextResponse.json(response, {
    headers: { "Cache-Control": `public, max-age=${TTL.SMART_MONEY}, stale-while-revalidate=60` },
  });
}

export const GET = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      payTo: PAY_TO,
      price: "$0.15",
      network: BASE_NETWORK,
    },
    description: "日本向けスマートマネーシグナル",
  },
  x402Server,
);
