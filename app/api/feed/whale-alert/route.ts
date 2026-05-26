import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { getWhaleData } from "@/lib/nansen";
import { PAY_TO, BASE_NETWORK, x402Server } from "@/lib/x402";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WhaleAlertResponse {
  fetched_at: string;
  alert_count: number;
  smart_money_alert_count: number;
  transfers: {
    tx_hash: string;
    from: string;
    to: string;
    token: string;
    amount_usd: number;
    timestamp: string;
    from_label?: string;
    to_label?: string;
    is_smart_money: boolean;
  }[];
  data_sources: string[];
}

async function handler(_req: NextRequest): Promise<NextResponse> {
  const data = await getWhaleData();

  const sorted = [...data.transfers].sort((a, b) => {
    if (a.is_smart_money !== b.is_smart_money) return a.is_smart_money ? -1 : 1;
    return b.amount_usd - a.amount_usd;
  });

  const response: WhaleAlertResponse = {
    fetched_at: data.fetched_at,
    alert_count: sorted.length,
    smart_money_alert_count: sorted.filter((t) => t.is_smart_money).length,
    transfers: sorted,
    data_sources: ["nansen"],
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}

export const GET = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      payTo: PAY_TO,
      price: "$0.20",
      network: BASE_NETWORK,
    },
    description: "クジラアラート・大口ウォレット動向（$100K以上、リアルタイム）",
  },
  x402Server,
);
