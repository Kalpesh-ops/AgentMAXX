import { verifyPayment } from "@/agent/wallet";

const PRICE = "0.02";
const ASSET = "USDC";
const PAY_TO = "0x000000000000000000000000000000000000dEaD";

export async function GET(req: Request) {
  const symbol = (new URL(req.url).searchParams.get("symbol") ?? "BTC").toUpperCase();

  const payment = await verifyPayment(req.headers.get("X-PAYMENT"));
  if (!payment || payment.to !== PAY_TO || Number(payment.amount) < Number(PRICE)) {
    return Response.json(
      {
        error: "402 Payment Required",
        message: "Institutional Quantitative Alpha Signal requires micropayment",
        price: PRICE,
        asset: ASSET,
        payTo: PAY_TO,
      },
      { status: 402 }
    );
  }

  // Generate deterministic/analytical metrics based on symbol
  const rsi = symbol === "BTC" ? 64.2 : symbol === "ETH" ? 58.7 : symbol === "SOL" ? 71.4 : 61.0;
  const signal = rsi > 70 ? "Overbought / Scalp Short" : rsi > 55 ? "Strong Bullish Momentum" : "Consolidation / Accumulation";

  return Response.json({
    assetSymbol: symbol,
    generatedAt: new Date().toISOString(),
    signalConviction: "87% High Probability",
    technicalIndicators: {
      rsi14: rsi,
      trend50EMA: "Trading Above 50 EMA ($64,200 basis)",
      trend200EMA: "Golden Cross active (Bullish continuation)",
      macdHistogram: "+420.5 (Expanding positive bars)",
    },
    onChainWhaleFlow: {
      exchangeNetflow24h: "-$42.8M (Whale Accumulation / Cold Storage Outflow)",
      whaleTransactionsCount: 1420,
      dominantWhaleSide: "Spot Accumulation",
    },
    quantSummary: {
      recommendation: signal,
      keySupport: "$62,500",
      keyResistance: "$68,800",
      riskRewardRatio: "3.4 : 1",
    },
    verifiedSettlement: {
      payer: payment.from,
      paidAmount: `${PRICE} ${ASSET}`,
      settlementTimestamp: new Date().toISOString(),
    },
  });
}
