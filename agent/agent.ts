/**
 * THE AGENT ENGINE
 *
 * Agent loop powered by Google Gemini:
 *   1. Send conversation history + available tool schemas to Gemini.
 *   2. If Gemini generates function calls -> execute each tool (including x402 signing),
 *      feed results back as function responses, and loop.
 *   3. If Gemini responds with final synthesized text -> deliver response.
 */
import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { tools } from "./tools";

const rawModel = process.env.GEMINI_MODEL;
export const MODEL = (!rawModel || rawModel === "gemini-2.5-flash") ? "gemini-3.8-flash" : rawModel;
const MAX_STEPS = 6;

const SYSTEM_PROMPT =
  "You are AgentMAXX, an elite autonomous Web3 Executive and On-Chain Intelligence Broker running on Base Sepolia. " +
  "You have full cognitive autonomy and an embedded crypto wallet capable of signing EIP-191 micropayments via the x402 protocol. " +
  "When the user requests premium intelligence (e.g. global market sentiment, token alpha signals, contract security audits, or satellite weather), " +
  "autonomously invoke the corresponding paid tool immediately—your treasury signs and settles the payment automatically without needing user permission. " +
  "For general utility queries, leverage your free tools (crypto prices, gas estimator, tokenomics calculator, wallet inspector, dice). " +
  "Always format your insights with clean Markdown, clear quantitative bullet points, and authoritative executive summaries.";

export type ChatMessage = { role: "user" | "agent"; text: string };
export type Step = { tool: string; args: unknown; result: unknown; error?: boolean };

export async function runAgent(history: ChatMessage[], ctx: { baseUrl: string }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const contents: Content[] = history.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));
  const steps: Step[] = [];

  for (let i = 0; i < MAX_STEPS; i++) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [
          {
            functionDeclarations: tools.map((t) => ({
              name: t.name,
              description: t.description,
              parametersJsonSchema: t.parameters,
            })),
          },
        ],
      },
    });

    const calls = response.functionCalls ?? [];
    if (calls.length === 0) {
      return { answer: response.text ?? "", steps };
    }

    // Preserve model turn in contents history
    contents.push(response.candidates![0].content!);
    const results: Part[] = [];

    for (const call of calls) {
      const tool = tools.find((t) => t.name === call.name);
      let result: unknown;
      let error = false;
      try {
        if (!tool) throw new Error(`No tool named ${call.name}`);
        result = await tool.run(call.args ?? {}, ctx);
      } catch (err) {
        result = { error: err instanceof Error ? err.message : String(err) };
        error = true;
      }
      steps.push({ tool: call.name!, args: call.args, result, error });
      results.push({ functionResponse: { id: call.id, name: call.name, response: { result } } });
    }

    contents.push({ role: "user", parts: results });
  }

  return {
    answer: "AgentMAXX reached the maximum autonomous execution step limit. Here is the data collected so far.",
    steps,
  };
}
