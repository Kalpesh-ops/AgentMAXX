import { verifyPayment } from "@/agent/wallet";

const PRICE = "0.01";
const ASSET = "USDC";
const PAY_TO = "0x000000000000000000000000000000000000dEaD";

export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get("city") ?? "Global";

  const payment = await verifyPayment(req.headers.get("X-PAYMENT"));
  if (!payment || payment.to !== PAY_TO || Number(payment.amount) < Number(PRICE)) {
    return Response.json(
      {
        error: "402 Payment Required",
        message: "Satellite Weather Intelligence endpoint requires micropayment",
        price: PRICE,
        asset: ASSET,
        payTo: PAY_TO,
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
      payer: payment.from,
      paidAmount: `${PRICE} ${ASSET}`,
      settlementTimestamp: new Date().toISOString(),
    },
  });
}
