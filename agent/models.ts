/**
 * GEMINI MODEL REGISTRY & DEFINITIONS (2026 Active Production Models)
 *
 * Queried and validated directly against Google Generative Language ModelService (ai.models.list()).
 * Legacy/deprecated models (1.5 series, 2.0 series, 2.5-pro) have been removed.
 */

export type ModelInfo = {
  id: string;
  label: string;
  badge: string;
  description: string;
};

export const SUPPORTED_MODELS: ModelInfo[] = [
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 Flash (Preview)",
    badge: "FAST 3.x",
    description: "Next-gen Gemini 3 Flash with high speed and tool execution",
  },
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    badge: "ADVANCED 3.5",
    description: "High-intelligence Gemini 3.5 generation Flash engine",
  },
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    badge: "HIGH SPEED",
    description: "Optimized Gemini 3.6 generation high-throughput model",
  },
  {
    id: "gemini-3.7-flash",
    label: "Gemini 3.7 Flash",
    badge: "LATEST 3.7",
    description: "Enhanced Gemini 3.7 generation with deeper reasoning",
  },
  {
    id: "gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    badge: "PREVIEW",
    description: "Bleeding-edge 3.8 generation Flash preview",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    badge: "RECOMMENDED",
    description: "Stable, verified workhorse with autonomous on-chain tools",
  },
  {
    id: "gemini-4-argon",
    label: "Gemini 4 Argon",
    badge: "EXPERIMENTAL",
    description: "Next-era Gemini 4 experimental architecture",
  },
];

export const DEFAULT_MODEL = "gemini-3-flash-preview";
