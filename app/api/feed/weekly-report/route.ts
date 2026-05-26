import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { getWeeklyData } from "@/lib/nansen";
import { generateWeeklyReport } from "@/lib/claude";
import { getCache, setCache, TTL } from "@/lib/cache";
import { today } from "@/lib/utils";
import { PAY_TO, BASE_NETWORK, x402Server } from "@/lib/x402";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WeeklyReportResponse {
  week_ending: string;
  region: "APAC";
  report_md: string;
  summary: {
    total_volume_usd: number;
    net_inflow_usd: number;
    active_smart_wallets: number;
    top_gainers: string[];
    top_losers: string[];
  };
  data_sources: string[];
}

const CACHE_KEY = "weekly-report";

async function handler(_req: NextRequest): Promise<NextResponse> {
  const cached = await getCache<WeeklyReportResponse>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": `public, max-age=${TTL.WEEKLY}, stale-while-revalidate=300` },
    });
  }

  const data = await getWeeklyData();
  const report_md = await generateWeeklyReport(data);
  const net_inflow_usd = data.exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);

  const response: WeeklyReportResponse = {
    week_ending: today(),
    region: "APAC",
    report_md,
    summary: {
      total_volume_usd: data.total_volume_usd,
      net_inflow_usd,
      active_smart_wallets: data.active_smart_wallets,
      top_gainers: data.top_gainers,
      top_losers: data.top_losers,
    },
    data_sources: ["nansen", "dune"],
  };

  await setCache(CACHE_KEY, response, TTL.WEEKLY);

  return NextResponse.json(response, {
    headers: { "Cache-Control": `public, max-age=${TTL.WEEKLY}, stale-while-revalidate=300` },
  });
}

export const GET = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      payTo: PAY_TO,
      price: "$0.50",
      network: BASE_NETWORK,
    },
    description: "週次オンチェーンレポート（詳細分析、24時間キャッシュ）",
  },
  x402Server,
);
