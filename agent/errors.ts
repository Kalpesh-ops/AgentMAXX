/**
 * AGENT ERROR PARSER & FORMATTER
 *
 * Converts raw JSON API exceptions, RPC errors, and upstream AI model faults
 * into structured, human-readable errors with error codes, root causes, and actionable suggestions.
 * Guarantees that raw JSON strings never leak into the user interface.
 */

export type ParsedError = {
  code: number | string;
  status: string;
  title: string;
  reason: string;
  details: string;
  suggestion: string;
  formattedText: string;
};

/**
 * Parses any thrown error or error message string into a clean, structured ParsedError object.
 */
export function parseAgentError(err: unknown): ParsedError {
  let rawStr = "";

  if (typeof err === "string") {
    rawStr = err.trim();
  } else if (err instanceof Error) {
    rawStr = err.message || String(err);
  } else if (typeof err === "object" && err !== null) {
    // If it's already an object with error fields
    const obj = err as Record<string, any>;
    if (obj.error && typeof obj.error === "object") {
      const e = obj.error;
      return buildParsedError({
        code: e.code || 500,
        status: e.status || "API_ERROR",
        message: e.message || "An API error occurred.",
      });
    }
    rawStr = JSON.stringify(err);
  } else {
    rawStr = String(err);
  }

  // Check if rawStr contains embedded JSON (e.g. from @google/genai or fetch)
  const jsonMatch = rawStr.match(/\{[\s\S]*"error"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error) {
        return buildParsedError({
          code: parsed.error.code || 500,
          status: parsed.error.status || "UPSTREAM_ERROR",
          message: parsed.error.message || rawStr,
        });
      }
    } catch {
      // Fall through to regex/pattern extraction
    }
  }

  // Direct JSON parse attempt
  try {
    const directParsed = JSON.parse(rawStr);
    if (directParsed.error) {
      const e = directParsed.error;
      return buildParsedError({
        code: e.code || 500,
        status: e.status || "UPSTREAM_ERROR",
        message: typeof e === "string" ? e : e.message || rawStr,
      });
    }
  } catch {
    // Not pure JSON
  }

  // Upstream Google Gemini / HTTP 503
  if (rawStr.includes("503") || rawStr.includes("UNAVAILABLE") || rawStr.toLowerCase().includes("high demand")) {
    return buildParsedError({
      code: 503,
      status: "UNAVAILABLE",
      message: "This model is currently experiencing high demand. Spikes in demand are usually temporary.",
    });
  }

  // HTTP 429 Rate Limit
  if (rawStr.includes("429") || rawStr.includes("RESOURCE_EXHAUSTED") || rawStr.toLowerCase().includes("quota")) {
    return buildParsedError({
      code: 429,
      status: "RESOURCE_EXHAUSTED",
      message: "Gemini API request rate limit or token quota exceeded.",
    });
  }

  // HTTP 400 / 401 / 403 Authentication
  if (rawStr.includes("401") || rawStr.includes("UNAUTHENTICATED") || rawStr.toLowerCase().includes("api key")) {
    return buildParsedError({
      code: 401,
      status: "UNAUTHENTICATED",
      message: "Invalid or missing GEMINI_API_KEY. Please verify your environment configuration.",
    });
  }

  // Base Sepolia / Viem Insufficient funds
  if (rawStr.toLowerCase().includes("insufficient funds") || rawStr.includes("exceeds the balance")) {
    return buildParsedError({
      code: "INSUFFICIENT_FUNDS",
      status: "BASE_SEPOLIA_ERROR",
      message: "Agent wallet does not have sufficient Base Sepolia ETH to complete this on-chain transaction.",
    });
  }

  // Network / Connection
  if (rawStr.toLowerCase().includes("fetch failed") || rawStr.includes("ECONNREFUSED") || rawStr.includes("ETIMEDOUT")) {
    return buildParsedError({
      code: "NETWORK_ERROR",
      status: "CONNECTION_FAILED",
      message: "Failed to connect to the upstream service. Network or RPC endpoint timed out.",
    });
  }

  // Fallback generic error
  return buildParsedError({
    code: 500,
    status: "EXECUTION_ERROR",
    message: rawStr.replace(/^[a-zA-Z]*Error:\s*/, ""),
  });
}

function buildParsedError(input: {
  code: number | string;
  status: string;
  message: string;
}): ParsedError {
  const code = input.code;
  const status = input.status || "ERROR";
  let title = "Cognitive Execution Error";
  let reason = "An unexpected error occurred during execution.";
  let suggestion = "Please retry your request in a few moments.";

  const codeNum = typeof code === "number" ? code : parseInt(String(code), 10);

  if (codeNum === 503 || status === "UNAVAILABLE") {
    title = "AI Model Service High Demand";
    reason = "The Google Gemini model infrastructure is currently handling a high volume of requests.";
    suggestion = "Spikes in demand are usually temporary. Please wait 10–20 seconds and click Retry.";
  } else if (codeNum === 429 || status === "RESOURCE_EXHAUSTED") {
    title = "API Rate Limit Exceeded";
    reason = "The allocated request quota or tokens per minute for this API key has been temporarily reached.";
    suggestion = "Please pause for 30–60 seconds before submitting another prompt.";
  } else if (codeNum === 401 || codeNum === 403 || status === "UNAUTHENTICATED") {
    title = "Authentication Failed";
    reason = "The GEMINI_API_KEY is either missing, unauthorized, or lacks permissions.";
    suggestion = "Check your GEMINI_API_KEY in the Vercel Project Settings or local .env file.";
  } else if (codeNum === 404 || status === "NOT_FOUND") {
    title = "Resource or Model Not Found";
    reason = "The requested AI model version or API endpoint does not exist.";
    suggestion = "Ensure your GEMINI_MODEL is set to a supported model such as 'gemini-2.5-flash'.";
  } else if (code === "INSUFFICIENT_FUNDS" || status === "BASE_SEPOLIA_ERROR") {
    title = "Insufficient On-Chain Funds";
    reason = "The agent treasury has insufficient Base Sepolia ETH to cover transaction gas and value.";
    suggestion = "Claim free testnet ETH from https://faucets.chain.link/base-sepolia to continue.";
  } else if (code === "NETWORK_ERROR") {
    title = "Network Connection Interrupted";
    reason = "The server was unable to reach the upstream Base Sepolia RPC or Gemini endpoint.";
    suggestion = "Check your internet connection and verify that Base Sepolia RPC is operational.";
  }

  // Clean details: remove any leftover JSON brackets/quotes
  const details = cleanMessage(input.message);

  const formattedText = `**[${code} ${status}] ${title}**\n\n- **Why it occurred:** ${reason}\n- **Details:** ${details}\n- **Recommended Action:** ${suggestion}`;

  return {
    code,
    status,
    title,
    reason,
    details,
    suggestion,
    formattedText,
  };
}

/**
 * Strips raw JSON formatting or stack traces from error messages.
 */
function cleanMessage(msg: string): string {
  if (!msg) return "No additional error details available.";
  let cleaned = msg.trim();

  // If it's a JSON string, try to get error.message
  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    try {
      const obj = JSON.parse(cleaned);
      if (obj.error?.message) return String(obj.error.message);
      if (obj.message) return String(obj.message);
    } catch {
      // ignore
    }
  }

  // Strip prefixes like "[GoogleGenerativeAI Error]: "
  cleaned = cleaned.replace(/^\[GoogleGenerativeAI Error\]:\s*/i, "");
  cleaned = cleaned.replace(/^[a-zA-Z]*Error:\s*/, "");

  return cleaned;
}
