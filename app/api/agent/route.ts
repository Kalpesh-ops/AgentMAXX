import { MODEL, SUPPORTED_MODELS, runAgent, type PersonaMode } from "@/agent/agent";
import { parseAgentError } from "@/agent/errors";
import { tools } from "@/agent/tools";

// GET /api/agent -> setup status + enriched list of tools + supported models
export async function GET() {
  return Response.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: MODEL,
    supportedModels: SUPPORTED_MODELS,
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      category: t.category,
      cost: t.cost,
    })),
  });
}

// POST /api/agent { messages, persona, model } -> the agent's answer + execution step trace
export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "Add GEMINI_API_KEY to your environment variables or .env file." },
      { status: 500 }
    );
  }

  try {
    const { messages, persona, model } = await req.json();
    const result = await runAgent(messages, {
      baseUrl: new URL(req.url).origin,
      persona: persona as PersonaMode,
      model,
    });
    return Response.json(result);
  } catch (err) {
    const parsed = parseAgentError(err);
    const statusNum = typeof parsed.code === "number" ? parsed.code : 500;
    return Response.json(
      {
        error: parsed.details || parsed.reason,
        errorDetails: parsed,
      },
      { status: statusNum >= 400 && statusNum < 600 ? statusNum : 500 }
    );
  }
}
