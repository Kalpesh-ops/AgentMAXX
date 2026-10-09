import { MODEL, runAgent } from "@/agent/agent";
import { tools } from "@/agent/tools";

// GET /api/agent -> setup status + enriched list of tools
export async function GET() {
  return Response.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: MODEL,
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      category: t.category,
      cost: t.cost,
    })),
  });
}

// POST /api/agent { messages } -> the agent's answer + execution step trace
export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "Add GEMINI_API_KEY to your environment variables or .env file." },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();
    const result = await runAgent(messages, { baseUrl: new URL(req.url).origin });
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
