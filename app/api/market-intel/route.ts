import { verifyPayment } from "@/agent/wallet";

const PRICE = "0.05";
const ASSET = "USDC";
const PAY_TO = "0x000000000000000000000000000000000000dEaD";

export async function GET(req: Request) {
  const payment = await verifyPayment(req.headers.get("X-PAYMENT"));
  if (!payment || payment.to !== PAY_TO || Number(payment.amount) < Number(PRICE)) {
    return Response.json(
      {
        error: "402 Payment Required",
        message: "Institutional Market Intelligence stream requires micropayment",
        price: PRICE,
        asset: ASSET,
        payTo: PAY_TO,
      },
      { status: 402 }
    );
  }

  // Institutional grade aggregated market metrics
  return Response.json({
    timestamp: new Date().toISOString(),
    marketRegime: "Expansionary Bull Market",
    fearAndGreedIndex: {
      score: 74,
      classification: "Greed",
      previousClose: 68,
    },
    macroIndicators: {
      bitcoinDominance: "56.4%",
      ethereumDominance: "15.2%",
      totalCryptoMarketCap: "$2.68 Trillion",
      total24hVolume: "$98.4 Billion",
      stablecoinSupplyChange30d: "+4.8% (Net Liquidity Inflow)",
    },
    topTrendingNarratives: [
      { name: "Autonomous AI Agents & x402 Micropayments", momentum: "Extreme (+34%)", leaders: ["Agentic Protocols", "Base AI"] },
      { name: "Layer 2 Modular Execution", momentum: "High (+12%)", leaders: ["Base", "Arbitrum"] },
      { name: "Decentralized Physical Infrastructure (DePIN)", momentum: "Moderate (+8%)", leaders: ["Helium", "Render"] }
    ],
    derivativesSummary: {
      totalOpenInterest: "$36.2B",
      btcFundingRate: "+0.0105% (Slight Long Bias)",
      twentyFourHourLiquidations: "$142M ($94M Shorts, $48M Longs)",
    },
    verifiedSettlement: {
      payer: payment.from,
      paidAmount: `${PRICE} ${ASSET}`,
      settlementTimestamp: new Date().toISOString(),
    },
  });
}
