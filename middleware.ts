import { paymentMiddleware } from "x402-next";

const FACILITATOR_URL = (process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator") as `${string}://${string}`;
const PAYMENT_ADDRESS = (process.env.PAYMENT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

export default paymentMiddleware(
  PAYMENT_ADDRESS,
  {
    "/api/feed/apac-daily": {
      price: "$0.10",
      network: "base",
      config: { description: "APAC日次オンチェーンサマリー" },
    },
    "/api/feed/smart-money-jp": {
      price: "$0.15",
      network: "base",
      config: { description: "日本関連スマートマネー動向" },
    },
    "/api/feed/whale-alert": {
      price: "$0.20",
      network: "base",
      config: { description: "クジラアラート（リアルタイム）" },
    },
    "/api/feed/weekly-report": {
      price: "$0.50",
      network: "base",
      config: { description: "週次詳細レポート" },
    },
  },
  { url: FACILITATOR_URL }
);

export const config = {
  matcher: [
    "/api/feed/apac-daily",
    "/api/feed/smart-money-jp",
    "/api/feed/whale-alert",
    "/api/feed/weekly-report",
  ],
};
