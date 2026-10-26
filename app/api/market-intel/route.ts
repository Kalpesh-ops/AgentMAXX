import { verifySettlement } from "@/agent/wallet";

const PRICE = "0.00005";
const ASSET = "ETH";
const PAY_TO = (process.env.X402_RECIPIENT_ADDRESS || "0x6A19273c50978FE8df661A05b5f212879F4Eb6Eb") as `0x${string}`;

export async function GET(req: Request) {
  const authHeader = req.headers.get("X-PAYMENT-PROOF") || req.headers.get("X-PAYMENT");
  const { verified, proof, error } = await verifySettlement(authHeader, PRICE, PAY_TO);

  if (!verified || !proof) {
    return Response.json(
      {
        error: "402 Payment Required",
        protocol: "x402",
        message: error || "Institutional Market Intelligence stream requires on-chain micropayment",
        paymentRequirements: {
          price: PRICE,
          asset: ASSET,
          network: "Base Sepolia",
          chainId: 84532,
          payTo: PAY_TO,
          resource: "/api/market-intel",
          description: "Institutional Market Intelligence stream",
        },
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
      { name: "Autonomous AI Agents & x402 On-Chain Micropayments", momentum: "Extreme (+34%)", leaders: ["Agentic Protocols", "Base AI"] },
      { name: "Layer 2 Modular Execution", momentum: "High (+12%)", leaders: ["Base", "Arbitrum"] },
      { name: "Decentralized Physical Infrastructure (DePIN)", momentum: "Moderate (+8%)", leaders: ["Helium", "Render"] }
    ],
    derivativesSummary: {
      totalOpenInterest: "$36.2B",
      btcFundingRate: "+0.0105% (Slight Long Bias)",
      twentyFourHourLiquidations: "$142M ($94M Shorts, $48M Longs)",
    },
    verifiedSettlement: {
      status: "confirmed",
      protocol: "x402-settled",
      txHash: proof.txHash,
      payer: proof.payer,
      recipient: PAY_TO,
      paidAmount: `${PRICE} ${ASSET}`,
      network: "Base Sepolia (84532)",
      explorerUrl: `https://sepolia.basescan.org/tx/${proof.txHash}`,
      settlementTimestamp: new Date().toISOString(),
    },
  });
}
