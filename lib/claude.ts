import Anthropic from "@anthropic-ai/sdk";
import type { NansenApacData, NansenSmartMoneyJpData, NansenWeeklyData } from "./nansen";
import { formatUsd } from "./utils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-20250514";

const DAILY_SYSTEM = `あなたはAPACの暗号資産市場を分析するアナリストです。
オンチェーンデータを元に、日本語で簡潔なマーケットサマリーを生成してください。
200文字以内で、最も重要なシグナルを1〜2点に絞って説明してください。`;

const WEEKLY_SYSTEM = `あなたはAPACの暗号資産市場を分析するシニアアナリストです。
過去7日間のオンチェーンデータを元に、詳細な週次レポートを日本語で生成してください。
マークダウン形式で、以下のセクションを含めてください：
1. 週次サマリー
2. 取引所フロー分析
3. スマートマネー動向
4. 注目トークン
5. 来週の見通し`;

function buildApacUserMessage(data: NansenApacData): string {
  const topBuys = data.smart_money_activities.filter((a) => a.action === "buy").slice(0, 3);
  const topSells = data.smart_money_activities.filter((a) => a.action === "sell").slice(0, 3);
  const netInflow = data.exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);

  return `以下のオンチェーンデータを分析してください：

取引所ネットフロー（24時間）:
${data.exchange_flows.map((f) => `- ${f.exchange}: ${formatUsd(f.net_flow_usd)}`).join("\n")}
合計ネットフロー: ${formatUsd(netInflow)}

スマートマネー買い動向:
${topBuys.map((a) => `- ${a.token}: ${formatUsd(a.volume_usd)} (${a.wallet_count}ウォレット)`).join("\n")}

スマートマネー売り動向:
${topSells.map((a) => `- ${a.token}: ${formatUsd(a.volume_usd)} (${a.wallet_count}ウォレット)`).join("\n")}

トップゲイナー: ${data.top_gainers.join(", ")}
トップルーザー: ${data.top_losers.join(", ")}`;
}

function buildSmartMoneyJpUserMessage(data: NansenSmartMoneyJpData): string {
  const topAlert = data.scored_alerts[0];
  return `日本関連スマートマネーデータを分析してください：

日本取引所フロー:
${data.jp_exchange_flows.map((f) => `- ${f.exchange}: ${formatUsd(f.net_flow_usd)}`).join("\n")}

注目アラート（スコア順）:
${data.scored_alerts
  .slice(0, 3)
  .map((a) => `- ${a.token} スコア${a.score}: ${a.reason} (${formatUsd(a.volume_usd)})`)
  .join("\n")}

最高スコアトークン: ${topAlert?.token ?? "なし"}`;
}

function buildWeeklyUserMessage(data: NansenWeeklyData): string {
  const netInflow = data.exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);
  return `過去7日間のAPACオンチェーンデータを詳細分析してください：

週間取引所フロー合計: ${formatUsd(data.total_volume_usd)}
週間ネットフロー: ${formatUsd(netInflow)}

取引所別フロー:
${data.exchange_flows.map((f) => `- ${f.exchange}: ネット ${formatUsd(f.net_flow_usd)} (流入 ${formatUsd(f.inflow_usd)} / 流出 ${formatUsd(f.outflow_usd)})`).join("\n")}

スマートマネー週間動向:
${data.smart_money_activities
  .slice(0, 5)
  .map((a) => `- ${a.token} ${a.action === "buy" ? "買い" : "売り"}: ${formatUsd(a.volume_usd)} (${a.wallet_count}ウォレット)`)
  .join("\n")}

アクティブスマートウォレット数: ${data.active_smart_wallets.toLocaleString()}

週間トップゲイナー: ${data.top_gainers.join(", ")}
週間トップルーザー: ${data.top_losers.join(", ")}`;
}

export async function generateApacSummary(data: NansenApacData): Promise<string> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: DAILY_SYSTEM,
      messages: [
        {
          role: "user",
          content: buildApacUserMessage(data),
        },
        {
          role: "assistant",
          content: "本日のAPACオンチェーンサマリー：",
        },
      ],
    });

    const text = message.content.find((c) => c.type === "text")?.text ?? "";
    return "本日のAPACオンチェーンサマリー：" + text;
  } catch {
    const netInflow = data.exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);
    const topBuy = data.smart_money_activities.find((a) => a.action === "buy");
    return `本日のAPACオンチェーンサマリー：APAC取引所ネットフロー${formatUsd(netInflow)}。${topBuy ? `スマートマネーが${topBuy.token}を積極的に買い増し（${formatUsd(topBuy.volume_usd)}）。` : ""}`;
  }
}

export async function generateSmartMoneyJpSummary(data: NansenSmartMoneyJpData): Promise<string> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: `あなたは日本の暗号資産市場を分析するアナリストです。
スマートマネーの動向を元に、日本語で簡潔なサマリーを生成してください。200文字以内。`,
      messages: [
        {
          role: "user",
          content: buildSmartMoneyJpUserMessage(data),
        },
        {
          role: "assistant",
          content: "日本関連スマートマネーサマリー：",
        },
      ],
    });

    const text = message.content.find((c) => c.type === "text")?.text ?? "";
    return "日本関連スマートマネーサマリー：" + text;
  } catch {
    const topAlert = data.scored_alerts[0];
    return `日本関連スマートマネーサマリー：${topAlert ? `${topAlert.token}に注目（スコア${topAlert.score}、${topAlert.reason}）。` : "特筆すべき動きは検出されませんでした。"}`;
  }
}

export async function generateWeeklyReport(data: NansenWeeklyData): Promise<string> {
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: WEEKLY_SYSTEM,
      messages: [
        {
          role: "user",
          content: buildWeeklyUserMessage(data),
        },
      ],
    });

    return message.content.find((c) => c.type === "text")?.text ?? "";
  } catch {
    const netInflow = data.exchange_flows.reduce((sum, f) => sum + f.net_flow_usd, 0);
    return `# APAC週次オンチェーンレポート

## 週次サマリー
今週のAPACオンチェーン活動は総額${formatUsd(data.total_volume_usd)}を記録。ネットフローは${formatUsd(netInflow)}。

## 取引所フロー分析
${data.exchange_flows.map((f) => `- **${f.exchange}**: ネット ${formatUsd(f.net_flow_usd)}`).join("\n")}

## スマートマネー動向
アクティブウォレット数: ${data.active_smart_wallets.toLocaleString()}

## 注目トークン
- 上昇: ${data.top_gainers.join(", ")}
- 下落: ${data.top_losers.join(", ")}`;
  }
}
