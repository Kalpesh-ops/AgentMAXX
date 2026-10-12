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
    const { workflowId, params = {} } = await req.json();

    if (!workflowId) {
      return Response.json({ error: "Missing workflowId parameter." }, { status: 400 });
    }

    const baseUrl = new URL(req.url).origin;
    const result = await executeWorkflow(workflowId, params, { baseUrl });

    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
