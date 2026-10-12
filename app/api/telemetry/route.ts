import { getChainTelemetry } from "@/agent/wallet";

// GET /api/telemetry -> Real-time Base Sepolia RPC metrics & chain health
export async function GET() {
  try {
    const data = await getChainTelemetry();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
