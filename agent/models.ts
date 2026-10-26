/**
 * GEMINI MODEL REGISTRY & DEFINITIONS
 * Decoupled from server-only Node modules (fs, path) for universal use in client & server.
 */

export type ModelInfo = {
  id: string;
  label: string;
  badge: string;
  description: string;
};

export const SUPPORTED_MODELS: ModelInfo[] = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", badge: "RECOMMENDED", description: "Default high-speed multimodal with tool calling" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", badge: "HIGH REASONING", description: "Complex multi-step auditing and reasoning" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", badge: "STABLE", description: "Reliable next-gen workhorse" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", badge: "LOW LATENCY", description: "Ultra-low latency model" },
  { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", badge: "PREVIEW", description: "Experimental bleeding-edge model" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", badge: "LEGACY", description: "Previous generation flash model" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", badge: "LEGACY PRO", description: "Previous generation complex reasoning" },
];

export const DEFAULT_MODEL = "gemini-2.5-flash";
