import { sleep } from "./utils";

const NANSEN_API_BASE = "https://api.nansen.ai/v1";
const NANSEN_API_KEY = process.env.NANSEN_API_KEY ?? "";

const APAC_EXCHANGES = ["binance", "okx", "bybit"];
const JP_EXCHANGES = ["bitflyer", "coincheck", "bitbank"];

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<Response> {
  const headers = {
    "x-api-key": NANSEN_API_KEY,
    "Content-Type": "application/json",
    ...options.headers,
  };

  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 429) {
      await sleep((i + 1) * 2000);
      continue;
    }
    return res;
  }
  throw new Error("Nansen API rate limit exceeded after retries");
}

export interface ExchangeFlow {
  exchange: string;
  net_flow_usd: number;
  inflow_usd: number;
  outflow_usd: number;
}

export interface SmartMoneyActivity {
  token: string;
  action: "buy" | "sell";
  volume_usd: number;
  wallet_count: number;
}

export interface WhaleTransfer {
  tx_hash: string;
  from: string;
  to: string;
  token: string;
  amount_usd: number;
  timestamp: string;
  from_label?: string;
  to_label?: string;
  is_smart_money: boolean;
}

export interface NansenApacData {
  exchange_flows: ExchangeFlow[];
  smart_money_activities: SmartMoneyActivity[];
  top_gainers: string[];
  top_losers: string[];
  fetched_at: string;
}

export interface NansenSmartMoneyJpData {
  jp_exchange_flows: ExchangeFlow[];
  smart_money_activities: SmartMoneyActivity[];
  scored_alerts: ScoredAlert[];
  fetched_at: string;
}

export interface ScoredAlert {
  token: string;
  score: number;
  reason: string;
  volume_usd: number;
}

export interface NansenWhaleData {
  transfers: WhaleTransfer[];
  fetched_at: string;
}

export interface NansenWeeklyData {
  exchange_flows: ExchangeFlow[];
  smart_money_activities: SmartMoneyActivity[];
  top_gainers: string[];
  top_losers: string[];
  total_volume_usd: number;
  active_smart_wallets: number;
  fetched_at: string;
}

// Mock fallback used when API key is absent or returns errors
function mockApacData(): NansenApacData {
  return {
    exchange_flows: [
      { exchange: "binance", net_flow_usd: 12_500_000, inflow_usd: 45_000_000, outflow_usd: 32_500_000 },
      { exchange: "okx", net_flow_usd: -3_200_000, inflow_usd: 18_000_000, outflow_usd: 21_200_000 },
      { exchange: "bybit", net_flow_usd: 5_700_000, inflow_usd: 22_000_000, outflow_usd: 16_300_000 },
    ],
    smart_money_activities: [
      { token: "ETH", action: "buy", volume_usd: 8_200_000, wallet_count: 142 },
      { token: "SOL", action: "buy", volume_usd: 4_100_000, wallet_count: 87 },
      { token: "BTC", action: "sell", volume_usd: 3_600_000, wallet_count: 63 },
      { token: "MATIC", action: "sell", volume_usd: 1_200_000, wallet_count: 31 },
    ],
    top_gainers: ["SOL", "AVAX", "ARB"],
    top_losers: ["BTC", "MATIC", "DOGE"],
    fetched_at: new Date().toISOString(),
  };
}

function mockSmartMoneyJpData(): NansenSmartMoneyJpData {
  return {
    jp_exchange_flows: [
      { exchange: "bitflyer", net_flow_usd: 2_100_000, inflow_usd: 5_500_000, outflow_usd: 3_400_000 },
      { exchange: "coincheck", net_flow_usd: -800_000, inflow_usd: 3_200_000, outflow_usd: 4_000_000 },
      { exchange: "bitbank", net_flow_usd: 1_300_000, inflow_usd: 4_100_000, outflow_usd: 2_800_000 },
    ],
    smart_money_activities: [
      { token: "ETH", action: "buy", volume_usd: 3_400_000, wallet_count: 56 },
      { token: "BTC", action: "buy", volume_usd: 2_100_000, wallet_count: 34 },
    ],
    scored_alerts: [
      { token: "ETH", score: 85, reason: "大口ウォレットが継続的に買い増し", volume_usd: 3_400_000 },
      { token: "SOL", score: 72, reason: "日本取引所への流入増加", volume_usd: 1_800_000 },
    ],
    fetched_at: new Date().toISOString(),
  };
}

function mockWhaleData(): NansenWhaleData {
  const now = new Date();
  return {
    transfers: [
      {
        tx_hash: "0xabc123",
        from: "0x1234...5678",
        to: "0x9abc...def0",
        token: "ETH",
        amount_usd: 450_000,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        from_label: "Smart Money Whale",
        to_label: "Binance",
        is_smart_money: true,
      },
      {
        tx_hash: "0xdef456",
        from: "0x2345...6789",
        to: "0xabcd...ef01",
        token: "USDT",
        amount_usd: 220_000,
        timestamp: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        to_label: "OKX",
        is_smart_money: false,
      },
    ],
    fetched_at: now.toISOString(),
  };
}

function mockWeeklyData(): NansenWeeklyData {
  return {
    exchange_flows: [
      { exchange: "binance", net_flow_usd: 85_000_000, inflow_usd: 310_000_000, outflow_usd: 225_000_000 },
      { exchange: "okx", net_flow_usd: -22_000_000, inflow_usd: 126_000_000, outflow_usd: 148_000_000 },
      { exchange: "bybit", net_flow_usd: 38_000_000, inflow_usd: 154_000_000, outflow_usd: 116_000_000 },
    ],
    smart_money_activities: [
      { token: "ETH", action: "buy", volume_usd: 57_000_000, wallet_count: 892 },
      { token: "SOL", action: "buy", volume_usd: 28_000_000, wallet_count: 541 },
      { token: "BTC", action: "sell", volume_usd: 25_000_000, wallet_count: 415 },
    ],
    top_gainers: ["SOL", "AVAX", "ARB", "OP", "INJ"],
    top_losers: ["BTC", "MATIC", "DOGE", "SHIB"],
    total_volume_usd: 590_000_000,
    active_smart_wallets: 2847,
    fetched_at: new Date().toISOString(),
  };
}

export async function getApacData(): Promise<NansenApacData> {
  if (!NANSEN_API_KEY) return mockApacData();

  try {
    const [flowsRes, smartRes] = await Promise.all([
      fetchWithRetry(`${NANSEN_API_BASE}/exchange-flows?exchanges=${APAC_EXCHANGES.join(",")}&period=24h`),
      fetchWithRetry(`${NANSEN_API_BASE}/smart-money/token-movements?region=APAC&period=24h`),
    ]);

    if (!flowsRes.ok || !smartRes.ok) return mockApacData();

    const flows = await flowsRes.json();
    const smart = await smartRes.json();

    const exchange_flows: ExchangeFlow[] = (flows.data ?? []).map((f: Record<string, unknown>) => ({
      exchange: f.exchange as string,
      net_flow_usd: (f.inflow_usd as number) - (f.outflow_usd as number),
      inflow_usd: f.inflow_usd as number,
      outflow_usd: f.outflow_usd as number,
    }));

    const activities: SmartMoneyActivity[] = (smart.data ?? []).map((s: Record<string, unknown>) => ({
      token: s.token as string,
      action: s.action as "buy" | "sell",
      volume_usd: s.volume_usd as number,
      wallet_count: s.wallet_count as number,
    }));

    const top_gainers = activities.filter((a) => a.action === "buy").slice(0, 3).map((a) => a.token);
    const top_losers = activities.filter((a) => a.action === "sell").slice(0, 3).map((a) => a.token);

    return {
      exchange_flows,
      smart_money_activities: activities,
      top_gainers,
      top_losers,
      fetched_at: new Date().toISOString(),
    };
  } catch {
    return mockApacData();
  }
}

export async function getSmartMoneyJpData(): Promise<NansenSmartMoneyJpData> {
  if (!NANSEN_API_KEY) return mockSmartMoneyJpData();

  try {
    const [flowsRes, smartRes] = await Promise.all([
      fetchWithRetry(`${NANSEN_API_BASE}/exchange-flows?exchanges=${JP_EXCHANGES.join(",")}&period=24h`),
      fetchWithRetry(`${NANSEN_API_BASE}/smart-money/token-movements?region=JP&period=24h`),
    ]);

    if (!flowsRes.ok || !smartRes.ok) return mockSmartMoneyJpData();

    const flows = await flowsRes.json();
    const smart = await smartRes.json();

    const jp_exchange_flows: ExchangeFlow[] = (flows.data ?? []).map((f: Record<string, unknown>) => ({
      exchange: f.exchange as string,
      net_flow_usd: (f.inflow_usd as number) - (f.outflow_usd as number),
      inflow_usd: f.inflow_usd as number,
      outflow_usd: f.outflow_usd as number,
    }));

    const activities: SmartMoneyActivity[] = (smart.data ?? []).map((s: Record<string, unknown>) => ({
      token: s.token as string,
      action: s.action as "buy" | "sell",
      volume_usd: s.volume_usd as number,
      wallet_count: s.wallet_count as number,
    }));

    const scored_alerts: ScoredAlert[] = activities
      .filter((a) => a.volume_usd > 1_000_000)
      .map((a) => ({
        token: a.token,
        score: Math.min(100, Math.floor((a.volume_usd / 1_000_000) * 10 + a.wallet_count / 10)),
        reason: a.action === "buy" ? "スマートマネーによる大口買い" : "スマートマネーによる大口売り",
        volume_usd: a.volume_usd,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      jp_exchange_flows,
      smart_money_activities: activities,
      scored_alerts,
      fetched_at: new Date().toISOString(),
    };
  } catch {
    return mockSmartMoneyJpData();
  }
}

export async function getWhaleData(): Promise<NansenWhaleData> {
  if (!NANSEN_API_KEY) return mockWhaleData();

  try {
    const res = await fetchWithRetry(
      `${NANSEN_API_BASE}/token-god-mode/large-transfers?min_usd=100000&smart_money_priority=true`
    );

    if (!res.ok) return mockWhaleData();

    const data = await res.json();
    const transfers: WhaleTransfer[] = (data.data ?? []).map((t: Record<string, unknown>) => ({
      tx_hash: t.tx_hash as string,
      from: t.from as string,
      to: t.to as string,
      token: t.token as string,
      amount_usd: t.amount_usd as number,
      timestamp: t.timestamp as string,
      from_label: t.from_label as string | undefined,
      to_label: t.to_label as string | undefined,
      is_smart_money: (t.from_labels as string[] | undefined)?.includes("Smart Money") ?? false,
    }));

    return { transfers, fetched_at: new Date().toISOString() };
  } catch {
    return mockWhaleData();
  }
}

export async function getWeeklyData(): Promise<NansenWeeklyData> {
  if (!NANSEN_API_KEY) return mockWeeklyData();

  try {
    const [flowsRes, smartRes] = await Promise.all([
      fetchWithRetry(`${NANSEN_API_BASE}/exchange-flows?exchanges=${APAC_EXCHANGES.join(",")}&period=7d`),
      fetchWithRetry(`${NANSEN_API_BASE}/smart-money/token-movements?region=APAC&period=7d`),
    ]);

    if (!flowsRes.ok || !smartRes.ok) return mockWeeklyData();

    const flows = await flowsRes.json();
    const smart = await smartRes.json();

    const exchange_flows: ExchangeFlow[] = (flows.data ?? []).map((f: Record<string, unknown>) => ({
      exchange: f.exchange as string,
      net_flow_usd: (f.inflow_usd as number) - (f.outflow_usd as number),
      inflow_usd: f.inflow_usd as number,
      outflow_usd: f.outflow_usd as number,
    }));

    const activities: SmartMoneyActivity[] = (smart.data ?? []).map((s: Record<string, unknown>) => ({
      token: s.token as string,
      action: s.action as "buy" | "sell",
      volume_usd: s.volume_usd as number,
      wallet_count: s.wallet_count as number,
    }));

    const total_volume_usd = exchange_flows.reduce((sum, f) => sum + f.inflow_usd + f.outflow_usd, 0);
    const active_smart_wallets = activities.reduce((sum, a) => sum + a.wallet_count, 0);

    return {
      exchange_flows,
      smart_money_activities: activities,
      top_gainers: activities.filter((a) => a.action === "buy").slice(0, 5).map((a) => a.token),
      top_losers: activities.filter((a) => a.action === "sell").slice(0, 4).map((a) => a.token),
      total_volume_usd,
      active_smart_wallets,
      fetched_at: new Date().toISOString(),
    };
  } catch {
    return mockWeeklyData();
  }
}
