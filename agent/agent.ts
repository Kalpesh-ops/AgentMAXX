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

import { parseAgentError } from "./errors";
import { SUPPORTED_MODELS, DEFAULT_MODEL } from "./models";

const rawModel = process.env.GEMINI_MODEL?.trim();
// Default to the stable, fast gemini-2.5-flash
export const MODEL = rawModel || DEFAULT_MODEL;
export { SUPPORTED_MODELS };

/** Helper to execute Gemini calls with automatic transient retry */
async function callGeminiWithRetry(
  ai: GoogleGenAI,
  req: { model: string; contents: Content[]; config: any },
  retries = 2
) {
  let lastError: any = null;
  const targetModel = req.model;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent({
        ...req,
        model: targetModel,
      });
    } catch (err: any) {
      lastError = err;
      const parsed = parseAgentError(err);

      // If it's a 503 spike, wait and retry
      if (parsed.code === 503 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1200));
        continue;
      }

      break;
    }
  }

  throw lastError;
}

export type PersonaMode = "executive" | "alpha-hunter" | "security-auditor";

const PERSONA_PROMPTS: Record<PersonaMode, string> = {
  executive:
    "You are AgentMAXX, an elite autonomous Web3 Executive and On-Chain Intelligence Broker running on Base Sepolia. " +
    "You have full cognitive autonomy and an embedded crypto wallet capable of signing EIP-191 micropayments via the x402 protocol. " +
    "When the user requests premium intelligence (e.g. global market sentiment, token alpha signals, contract security audits, or satellite weather), " +
    "autonomously invoke the corresponding paid tool immediately—your treasury signs and settles the payment automatically without needing user permission. " +
    "Leverage all registered tools including DexScreener live DEX queries, Base Sepolia live RPC telemetry, crypto prices, gas estimator, and tokenomics. " +
    "Format your insights with clean Markdown, clear quantitative bullet points, and authoritative executive summaries.",

  "alpha-hunter":
    "You are AgentMAXX in ALPHA HUNTER mode: a high-tempo on-chain quantitative degen scout on Base. " +
    "You hunt for DEX momentum breakout signals, whale netflows, pool liquidity depth, and early token metrics. " +
    "Autonomously pay for x402 alpha signals and market intel without hesitation. " +
    "Provide aggressive, high-signal, quantitative technical analysis with RSI levels, EMA crossovers, risk/reward ratios, and DEX volume surges.",

  "security-auditor":
    "You are AgentMAXX in PARANOID SECURITY AUDITOR mode: a ruthless smart contract security expert and bytecode threat analyst. " +
    "Your objective is zero-trust bytecode verification. Examine contracts for honeypots, hidden mint exploits, blacklist privileges, ownership centralization, and liquidity rugpull risks. " +
    "Autonomously pay for x402 contract audits. Deliver zero-tolerance, uncompromising vulnerability ratings.",
};

export type ChatMessage = { role: "user" | "agent"; text: string };
export type Step = { tool: string; args: unknown; result: unknown; error?: boolean };

export async function runAgent(
  history: ChatMessage[],
  ctx: { baseUrl: string; persona?: PersonaMode; model?: string }
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const personaKey: PersonaMode = ctx.persona && PERSONA_PROMPTS[ctx.persona] ? ctx.persona : "executive";
  const systemInstruction = PERSONA_PROMPTS[personaKey];
  const chosenModel = ctx.model?.trim() || MODEL;

  const ai = new GoogleGenAI({ apiKey });
  const contents: Content[] = history.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));
  const steps: Step[] = [];

  for (let i = 0; i < MAX_STEPS; i++) {
    const response = await callGeminiWithRetry(ai, {
      model: chosenModel,
      contents,
      config: {
        systemInstruction,
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
