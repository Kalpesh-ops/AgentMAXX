# AgentMAXX ⚡
### Autonomous Web3 Financial Executive, Workflow Engine & x402 Micropayments
> **Built for Rise In Agentmaxxing — Week 2: "Build & Ship"**  
> *(Upgraded from Week 1 Prototype to v2.0 Production Workflow Engine)*

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://agent-maxx.vercel.app)
[![Network](https://img.shields.io/badge/Network-Base%20Sepolia%20RPC-blue?style=for-the-badge&logo=coinbase)](https://sepolia.basescan.org)
[![LLM](https://img.shields.io/badge/Model-Google%20Gemini%203.8%20Flash-orange?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Protocol](https://img.shields.io/badge/Protocol-x402%20Micropayments-green?style=for-the-badge)](https://github.com/Kalpesh-ops/AgentMAXX)
[![Workflows](https://img.shields.io/badge/Workflows-Multi--Stage%20DAG-purple?style=for-the-badge)](https://agent-maxx.vercel.app)

---

## 🚀 What&apos;s New in Week 2: Build & Ship

In Week 1, we proved the foundational concept: an AI agent with an embedded cryptographic wallet on Base Sepolia capable of 1-shot tool execution and x402 payment signing.

In **Week 2: Build & Ship**, we took the agent from a basic prototype to an **orchestrated multi-stage workflow engine** connected to live external financial APIs and real-time on-chain RPC nodes:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AGENTMAXX v2.0 ARCHITECTURE                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ User / Judge ]                                                     │
│          │                                                             │
│          ▼                                                             │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │               COGNITIVE & WORKFLOW ORCHESTRATOR              │     │
│   │            (Google Gemini 3.8 Flash + viem Engine)           │     │
│   │   [Executive Mode]  [Alpha Hunter Mode]  [Auditor Mode]      │     │
│   └──────────────────────┬──────────────────────────────┬────────┘     │
│                          │                              │              │
│        Sequential Chained Workflows                     │              │
│        ┌─────────────────┴─────────────────┐            │              │
│        ▼                                   ▼            ▼              │
│   [Live DexScreener DEX]        [Contract Bytecode] [Base Sepolia RPC] │
│   - AERO, BRETT, VIRTUAL        - Static Honeypot   - Block Height     │
│   - Liquidity USD, 24h Vol      - Mint & Blacklist  - Gas Price (Gwei) │
│        │                                   │            │              │
│        └─────────────────┬─────────────────┘            │              │
│                          ▼                              │              │
│        [ Autonomous x402 Micropayment Engine ]          │              │
│        - Detects HTTP 402 Payment Required              │              │
│        - Signs EIP-191 with Base Sepolia Private Key    │              │
│        - Settles 0.05 / 0.02 / 0.03 USDC in ms          │              │
│                          │                              │              │
│                          ▼                              ▼              │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │              FINAL SYNTHESIS & AUDIT DOSSIER                 │     │
│   │         (Multi-Stage Verified Evidence Briefing)             │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ New Capabilities & Workflow Innovations

### 1. 🔄 Multi-Stage Autonomous Workflow Pipelines (`agent/workflows.ts`)
Instead of answering isolated prompts, AgentMAXX orchestrates multi-step sequential execution pipelines:
- **🔎 Pipeline A: Autonomous Token & Contract Due Diligence**:
  - *Stage 1*: Queries real-time DEX liquidity, pool depth, and 24h volume via DexScreener.
  - *Stage 2*: Audits contract bytecode for honeypot vectors, hidden mint privileges, and liquidity locks.
  - *Stage 3*: Autonomously pays 0.02 USDC via x402 for quantitative momentum and whale cold-storage flows.
  - *Stage 4*: Gemini 3.8 Flash synthesizes all collected evidence into an institutional Due Diligence Dossier.
- **⚡ Pipeline B: Global Macro Regime & Cross-Domain Alpha**:
  - *Stage 1*: Autonomously pays 0.05 USDC via x402 for Fear & Greed index and narrative momentum.
  - *Stage 2*: Pulls live benchmark spot prices for BTC, ETH, and SOL.
  - *Stage 3*: Autonomously pays 0.01 USDC via x402 for data center cooling and weather energy metrics.
  - *Stage 4*: Synthesizes a cross-domain macroeconomic liquidity report.
- **🛡️ Pipeline C: Autonomous Treasury & Gas Optimization**:
  - *Stage 1*: Queries live Base Sepolia RPC for real-time gas fees in Gwei and block height.
  - *Stage 2*: Inspects agent wallet balance, address, and on-chain nonce.
  - *Stage 3*: Models tokenomics compound runway for 5,000 future autonomous x402 payments.
  - *Stage 4*: Generates an actionable Treasury Management Directive.

### 2. 🌐 Connected Live External Services & On-Chain RPC
- **DexScreener API Integration (`search_dex_pairs`)**: Real-time liquidity, price USD, 24h volume, FDV, and price changes for any DEX pair across Base, Ethereum, and Solana.
- **Live Base Sepolia RPC Integration (`get_chain_telemetry`)**: Direct connection to Base Sepolia via Viem public client, reporting live block height, gas price in Gwei, and network latency.

### 3. 🎭 Multi-Agent Persona Profiles
Toggle between customized agent cognitive personalities on the fly:
- **Executive Mode 💼**: Institutional, risk-adjusted, Wall-Street-grade synthesis.
- **Alpha Hunter Mode ⚡**: High-tempo on-chain degen scout hunting for DEX volume surges and whale breakouts.
- **Security Auditor Mode 🛡️**: Zero-trust bytecode vulnerability analyzer and exploit simulator.

### 4. 🎬 In-App Interactive Demo & Walkthrough Guide
A dedicated interactive tour designed specifically for competition judges:
- **Act 1**: Autonomous Financial Agency
- **Act 2**: Machine-to-Machine HTTP 402 Handshake & EIP-191 Signing
- **Act 3**: Multi-Stage Chained Agentic Workflows
- **Act 4**: Live On-Chain Base Sepolia Telemetry

---

## 🎬 Judge Walkthrough & Demo Guide

To experience AgentMAXX in under 60 seconds:

1. **Visit the Live Production App**: [https://agent-maxx.vercel.app/](https://agent-maxx.vercel.app/)
2. **Tab 02 (Agentic Workflows)**:
   - Select **&ldquo;Autonomous Token & Contract Due Diligence&rdquo;**.
   - Click **&ldquo;Launch Autonomous Workflow&rdquo;**.
   - Watch the agent sequentially execute Stage 1 (DexScreener) $\rightarrow$ Stage 2 (Contract Audit) $\rightarrow$ Stage 3 (x402 Alpha Payment) $\rightarrow$ Stage 4 (Executive Synthesis) with real-time timers and cryptographic payment receipts.
3. **Tab 01 (Executive Console)**:
   - Click the prompt chip **&ldquo;🔎 Live DEX Query (AERO)&rdquo;** or **&ldquo;📊 Market Intel (0.05 USDC)&rdquo;**.
   - Watch the agent autonomously sign the payment with its Base Sepolia wallet and render the response.
4. **Tab 03 (Live Base RPC Telemetry)**:
   - Observe live Base Sepolia block height updating in real time with live gas price in Gwei.
5. **Tab 04 (Demo & Walkthrough Guide)**:
   - Click **&ldquo;Run Guided Demo&rdquo;** to run the 4-act capability demonstration.

---

## 🏆 Week 2 Hackathon Submission Details

- **Submission Deadline**: October 16
- **Live Agent Link**: [https://agent-maxx.vercel.app/](https://agent-maxx.vercel.app/)
- **GitHub Repository**: [https://github.com/Kalpesh-ops/AgentMAXX](https://github.com/Kalpesh-ops/AgentMAXX)
- **Developer**: Kalpesh Parashar
- **Track**: Rise In Agentmaxxing — Week 2: Build & Ship

### Brief Note on Week 2 Iterations & Learnings
> *"In Week 2, we transitioned AgentMAXX from a reactive tool-caller to an autonomous workflow orchestrator. We learned how to chain multi-stage pipelines where intermediate outputs become inputs for subsequent stages—such as feeding live DEX liquidity into bytecode security analysis before paying for quantitative alpha. We integrated live external services (DexScreener DEX queries) and synchronized with live Base Sepolia RPC nodes. Building the in-app interactive walkthrough demonstrated that an agent's true power lies in explainability, transparent cryptographic verification, and end-to-end multi-step agency."*

---

## 📜 License
MIT License. Open source for the Rise In Agentmaxxing Community.
