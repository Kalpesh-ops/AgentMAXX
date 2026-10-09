import "./globals.css";
import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "AgentMAXX | Autonomous Web3 AI Agent & x402 Micropayment Engine",
  description:
    "Autonomous on-chain Web3 AI agent built for Agentmaxxing Week 1. Powered by Google Gemini and viem on Base Sepolia. Capable of autonomous HTTP 402 machine-to-machine micropayments, quantitative market alpha, contract audits, and tool calling.",
  keywords: [
    "AI Agent",
    "Agentmaxxing",
    "x402",
    "Base Sepolia",
    "Google Gemini",
    "Web3 AI",
    "Micropayments",
    "Rise In",
  ],
  authors: [{ name: "Kalpesh Parashar" }],
  openGraph: {
    title: "AgentMAXX | Autonomous Web3 AI Agent",
    description: "Self-paying AI Agent with its own crypto wallet on Base Sepolia using x402 micropayments.",
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
