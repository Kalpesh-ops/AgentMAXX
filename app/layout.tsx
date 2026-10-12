import "./globals.css";
import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "AgentMAXX | Autonomous Web3 Agent & Workflow Engine (Week 2: Build & Ship)",
  description:
    "Autonomous on-chain Web3 AI agent and workflow orchestration engine built for Agentmaxxing Week 2. Powered by Google Gemini 3.8 Flash and viem on Base Sepolia. Capable of multi-stage autonomous pipelines, live DexScreener DEX queries, Base RPC telemetry, and HTTP 402 EIP-191 machine-to-machine settlements.",
  keywords: [
    "AI Agent",
    "Agentmaxxing",
    "Agent Workflows",
    "x402",
    "Base Sepolia",
    "DexScreener",
    "Google Gemini 3.8 Flash",
    "Web3 AI",
    "Micropayments",
    "Rise In",
  ],
  authors: [{ name: "Kalpesh Parashar" }],
  openGraph: {
    title: "AgentMAXX | Autonomous Web3 Agent & Workflow Engine",
    description: "Self-paying AI Agent with chained multi-stage workflows, live DEX metrics, and x402 settlements on Base Sepolia.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark font-sans antialiased", spaceGrotesk.variable, jetBrainsMono.variable)}>
      <body>{children}</body>
    </html>
  );
}
