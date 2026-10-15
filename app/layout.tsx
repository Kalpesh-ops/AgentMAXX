import "./globals.css";
import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "AgentMAXX | Autonomous On-Chain Agent & Web3 Wallet Engine (Week 3: Give It A Wallet)",
  description:
    "Autonomous on-chain Web3 AI agent with live wallet capabilities built for Agentmaxxing Week 3. Powered by Google Gemini 3.8 Flash and viem on Base Sepolia. Features autonomous ETH transfers, on-chain calldata audit attestations, smart contract bytecode verification, dual-wallet integration, and x402 machine-to-machine settlements.",
  keywords: [
    "AI Agent",
    "Agentmaxxing",
    "Week 3 Give It A Wallet",
    "On-Chain Agent",
    "Base Sepolia",
    "Crypto Wallet",
    "Smart Contract Verification",
    "x402 Micropayments",
    "Google Gemini 3.8 Flash",
    "viem",
    "Rise In",
  ],
  authors: [{ name: "Kalpesh Parashar" }],
  openGraph: {
    title: "AgentMAXX | Autonomous On-Chain Web3 Agent",
    description: "AI Agent with a live Base Sepolia wallet, autonomous on-chain calldata notarization, smart contract verification, and x402 settlements.",
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
