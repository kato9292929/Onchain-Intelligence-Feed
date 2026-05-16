import { NextRequest, NextResponse } from "next/server";
import { getApacData, getSmartMoneyJpData, getWeeklyData } from "@/lib/nansen";
import { generateApacSummary, generateSmartMoneyJpSummary, generateWeeklyReport } from "@/lib/claude";
import { setCache, TTL } from "@/lib/cache";
import { today } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called by Vercel Cron Jobs - protected by CRON_SECRET
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};

  // Refresh APAC daily (every hour)
  try {
    const apacData = await getApacData();
    const summary_ja = await generateApacSummary(apacData);
    const net_inflow_usd = apacData.exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);
    const topInflow = apacData.exchange_flows.reduce((prev, cur) => (cur.net_flow_usd > prev.net_flow_usd ? cur : prev));
    const topOutflow = apacData.exchange_flows.reduce((prev, cur) => (cur.net_flow_usd < prev.net_flow_usd ? cur : prev));
    const top_buys = apacData.smart_money_activities.filter((a) => a.action === "buy").slice(0, 3).map((a) => a.token);
    const top_sells = apacData.smart_money_activities.filter((a) => a.action === "sell").slice(0, 3).map((a) => a.token);
    const active_wallets = apacData.smart_money_activities.reduce((sum, a) => sum + a.wallet_count, 0);

    await setCache("apac-daily", {
      date: today(),
      region: "APAC",
      summary_ja,
      exchange_flows: {
        net_inflow_usd,
        top_inflow_exchange: topInflow.exchange,
        top_outflow_exchange: topOutflow.exchange,
      },
      smart_money: { top_buys, top_sells, active_wallets },
      market_signal: net_inflow_usd > 5_000_000 ? "bullish" : net_inflow_usd < -5_000_000 ? "bearish" : "neutral",
      data_sources: ["nansen", "dune"],
    }, TTL.DAILY);
    results["apac-daily"] = "ok";
  } catch (e) {
    results["apac-daily"] = `error: ${e}`;
  }

  // Refresh smart-money-jp every 30 min (cron runs hourly, so just refresh every time)
  try {
    const jpData = await getSmartMoneyJpData();
    const summary_ja = await generateSmartMoneyJpSummary(jpData);
    const top_buys = jpData.smart_money_activities.filter((a) => a.action === "buy").slice(0, 3).map((a) => a.token);
    const top_sells = jpData.smart_money_activities.filter((a) => a.action === "sell").slice(0, 3).map((a) => a.token);
    const active_wallets = jpData.smart_money_activities.reduce((sum, a) => sum + a.wallet_count, 0);
    const net_inflow_usd = jpData.jp_exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);

    await setCache("smart-money-jp", {
      date: today(),
      region: "JP",
      summary_ja,
      jp_exchange_flows: jpData.jp_exchange_flows,
      smart_money: { top_buys, top_sells, active_wallets },
      alerts: jpData.scored_alerts.slice(0, 5),
      market_signal: net_inflow_usd > 1_000_000 ? "bullish" : net_inflow_usd < -1_000_000 ? "bearish" : "neutral",
      data_sources: ["nansen"],
    }, TTL.SMART_MONEY);
    results["smart-money-jp"] = "ok";
  } catch (e) {
    results["smart-money-jp"] = `error: ${e}`;
  }

  // Refresh weekly report only on Sundays (check day of week)
  const dayOfWeek = new Date().getDay(); // 0 = Sunday
  if (dayOfWeek === 0) {
    try {
      const weeklyData = await getWeeklyData();
      const report_md = await generateWeeklyReport(weeklyData);
      const net_inflow_usd = weeklyData.exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);

      await setCache("weekly-report", {
        week_ending: today(),
        region: "APAC",
        report_md,
        summary: {
          total_volume_usd: weeklyData.total_volume_usd,
          net_inflow_usd,
          active_smart_wallets: weeklyData.active_smart_wallets,
          top_gainers: weeklyData.top_gainers,
          top_losers: weeklyData.top_losers,
        },
        data_sources: ["nansen", "dune"],
      }, TTL.WEEKLY);
      results["weekly-report"] = "ok";
    } catch (e) {
      results["weekly-report"] = `error: ${e}`;
    }
  } else {
    results["weekly-report"] = "skipped (not Sunday)";
  }

  return NextResponse.json({ refreshed_at: new Date().toISOString(), results });
}
