import { verifySettlement } from "@/agent/wallet";

const PRICE = "0.00001";
const ASSET = "ETH";
const PAY_TO = (process.env.X402_RECIPIENT_ADDRESS || "0x6A19273c50978FE8df661A05b5f212879F4Eb6Eb") as `0x${string}`;

export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get("city") ?? "Global";

  const authHeader = req.headers.get("X-PAYMENT-PROOF") || req.headers.get("X-PAYMENT");
  const { verified, proof, error } = await verifySettlement(authHeader, PRICE, PAY_TO);

  if (!verified || !proof) {
    return Response.json(
      {
        error: "402 Payment Required",
        protocol: "x402",
        message: error || "Satellite Weather Intelligence endpoint requires on-chain micropayment",
        paymentRequirements: {
          price: PRICE,
          asset: ASSET,
          network: "Base Sepolia",
          chainId: 84532,
          payTo: PAY_TO,
          resource: "/api/weather",
          description: "Satellite Weather Intelligence endpoint",
        },
      },
      { status: 402 }
    );
  }

  const conditions = ["Clear Skies", "Sunny", "Partly Cloudy", "High Humidity", "Scattered Showers", "Breezy"];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const temp = Math.round(18 + Math.random() * 14);

  return Response.json({
    city,
    temperatureC: temp,
    temperatureF: Math.round(temp * 1.8 + 32),
    condition,
    humidity: `${Math.round(40 + Math.random() * 45)}%`,
    windSpeedKmh: `${Math.round(8 + Math.random() * 25)} km/h`,
    uvIndex: Math.floor(Math.random() * 8) + 1,
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
