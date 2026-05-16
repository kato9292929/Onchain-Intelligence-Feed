import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import { getApacData } from "@/lib/nansen";
import { generateApacSummary } from "@/lib/claude";
import { getCache, setCache, TTL } from "@/lib/cache";
import { today } from "@/lib/utils";
import { PAYMENT_ADDRESS, FACILITATOR, routeConfig } from "@/lib/x402";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ApacDailyResponse {
  date: string;
  region: string;
  summary_ja: string;
  exchange_flows: {
    net_inflow_usd: number;
    top_inflow_exchange: string;
    top_outflow_exchange: string;
  };
  smart_money: {
    top_buys: string[];
    top_sells: string[];
    active_wallets: number;
  };
  market_signal: "bullish" | "bearish" | "neutral";
  data_sources: string[];
}

const CACHE_KEY = "apac-daily";

function deriveMarketSignal(net: number, buys: number, sells: number): "bullish" | "bearish" | "neutral" {
  if (net > 5_000_000 && buys > sells) return "bullish";
  if (net < -5_000_000 || sells > buys + 1) return "bearish";
  return "neutral";
}

async function handler(_req: NextRequest): Promise<NextResponse> {
  const cached = await getCache<ApacDailyResponse>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": `public, max-age=${TTL.DAILY}, stale-while-revalidate=60` },
    });
  }

  const data = await getApacData();
  const summary_ja = await generateApacSummary(data);

  const net_inflow_usd = data.exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);
  const topInflow = data.exchange_flows.reduce((p, c) => (c.net_flow_usd > p.net_flow_usd ? c : p));
  const topOutflow = data.exchange_flows.reduce((p, c) => (c.net_flow_usd < p.net_flow_usd ? c : p));
  const top_buys = data.smart_money_activities.filter((a) => a.action === "buy").slice(0, 3).map((a) => a.token);
  const top_sells = data.smart_money_activities.filter((a) => a.action === "sell").slice(0, 3).map((a) => a.token);
  const active_wallets = data.smart_money_activities.reduce((sum, a) => sum + a.wallet_count, 0);

  const response: ApacDailyResponse = {
    date: today(),
    region: "APAC",
    summary_ja,
    exchange_flows: {
      net_inflow_usd,
      top_inflow_exchange: topInflow.exchange,
      top_outflow_exchange: topOutflow.exchange,
    },
    smart_money: { top_buys, top_sells, active_wallets },
    market_signal: deriveMarketSignal(net_inflow_usd, top_buys.length, top_sells.length),
    data_sources: ["nansen", "dune"],
  };

  await setCache(CACHE_KEY, response, TTL.DAILY);

  return NextResponse.json(response, {
    headers: { "Cache-Control": `public, max-age=${TTL.DAILY}, stale-while-revalidate=60` },
  });
}

export const GET = withX402(handler, PAYMENT_ADDRESS, routeConfig("$0.10", "APAC日次オンチェーンサマリー"), FACILITATOR);
