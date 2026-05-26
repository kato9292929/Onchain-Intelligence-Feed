import { NextResponse } from "next/server";
import {
  PAY_TO_BASE,
  PAY_TO_SOLANA,
  BASE_NETWORK,
  SOLANA_NETWORK,
  USDC_BASE,
  USDC_SOLANA,
} from "@/lib/x402";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://onchain-intelligence-feed.vercel.app";

const ENDPOINTS = [
  { path: "/api/feed/apac-daily", price: "$0.10", description: "APAC日次スマートマネーサマリー（Claude日本語生成）" },
  { path: "/api/feed/smart-money-jp", price: "$0.15", description: "日本向けスマートマネーシグナル" },
  { path: "/api/feed/whale-alert", price: "$0.20", description: "クジラアラート・大口ウォレット動向" },
  { path: "/api/feed/weekly-report", price: "$0.50", description: "週次オンチェーンレポート（詳細分析）" },
];

export async function GET() {
  // 4 endpoints × 2 legs (Base + Solana) = 8 entries
  const routes = ENDPOINTS.flatMap((ep) => [
    {
      resource: `${BASE_URL}${ep.path}`,
      description: ep.description,
      accepts: [
        {
          scheme: "exact",
          network: BASE_NETWORK,
          price: ep.price,
          asset: USDC_BASE,
          payTo: PAY_TO_BASE,
        },
        {
          scheme: "exact",
          network: SOLANA_NETWORK,
          price: ep.price,
          asset: USDC_SOLANA,
          payTo: PAY_TO_SOLANA,
        },
      ],
    },
  ]);

  return NextResponse.json(
    { routes },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
