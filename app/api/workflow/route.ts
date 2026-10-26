import { parseAgentError } from "@/agent/errors";
import { executeWorkflow, REGISTERED_WORKFLOWS } from "@/agent/workflows";

// GET /api/workflow -> List available multi-stage workflows
export async function GET() {
  return Response.json({
    workflows: REGISTERED_WORKFLOWS,
  });
}

// POST /api/workflow { workflowId, params } -> Execute multi-stage autonomous workflow
export async function POST(req: Request) {
  try {
    const { workflowId, params = {}, model } = await req.json();

    if (!workflowId) {
      return Response.json({ error: "Missing workflowId parameter." }, { status: 400 });
    }

    const baseUrl = new URL(req.url).origin;
    const result = await executeWorkflow(workflowId, params, { baseUrl, model });

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
