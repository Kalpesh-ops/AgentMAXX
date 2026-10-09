# AgentMAXX ⚡
### Autonomous Web3 Financial Executive & x402 Micropayment Engine
> **Built for the Rise In Agentmaxxing Hackathon — Week 1: "Get Agentic"**

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://agent-maxx.vercel.app)
[![Network](https://img.shields.io/badge/Network-Base%20Sepolia-blue?style=for-the-badge&logo=coinbase)](https://sepolia.basescan.org)
[![LLM](https://img.shields.io/badge/Model-Google%20Gemini%203.8%20Flash-orange?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Protocol](https://img.shields.io/badge/Protocol-x402%20Micropayments-green?style=for-the-badge)](https://github.com/Kalpesh-ops/AgentMAXX)

---

## 🚀 Executive Summary

**AgentMAXX** is an elite, autonomous on-chain AI agent with native financial agency. Rather than functioning as a passive chatbot that simply responds with static text, AgentMAXX manages its own cryptographic crypto wallet on **Base Sepolia (Chain ID: 84532)**. 

When conducting institutional market analysis, quantitative token research, smart contract vulnerability audits, or satellite climate metrics, AgentMAXX autonomously detects **HTTP 402 Payment Required** responses from premium API providers, signs **EIP-191 micropayment authorizations** using its private key, settles transactions machine-to-machine, and synthesizes high-conviction intelligence briefings.

---

## 🧠 Key Distinction: Chatbots vs. Autonomous Agents

A core requirement of Week 1 is grasping why true agents transcend traditional chatbots:

| Dimension | Standard Chatbot | AgentMAXX |
| :--- | :--- | :--- |
| **Agency** | Passive; responds only with generated text | Active; decides execution paths and invokes external tools |
| **Financial Autonomy** | Cannot own capital or execute payments | Owns its own Base Sepolia private key & treasury |
| **Machine-to-Machine Economy** | Blocked by API paywalls or requires user card entry | Autonomously settles HTTP 402 micropayments via x402 protocol |
| **Cognitive Loop** | Single-turn prompt-to-completion | Multi-step agent loop: Plan $\rightarrow$ Call Tool $\rightarrow$ Sign $\rightarrow$ Ingest $\rightarrow$ Synthesize |
| **Verification** | Black-box output | Verifiable on-chain identity & EIP-191 signature proofs |

---

## 🛠️ The Tool Arsenal

AgentMAXX ships with a dual-tier capability registry:

### 1. Autonomous x402 Micropayment Tools (Paid)
Each paid tool requires an autonomous cryptographic handshake. The agent's wallet signs the payment header with zero user intervention:
- **`get_market_intel`** *(0.05 USDC)*: Institutional global crypto sentiment, Fear & Greed index, macro liquidity flows, and top trending narrative momentum.
- **`get_crypto_alpha`** *(0.02 USDC)*: Quantitative technical alpha (RSI-14, 50/200 EMA golden cross status, MACD), whale netflow volume, and directional conviction for any token (BTC, ETH, SOL).
- **`audit_smart_contract`** *(0.03 USDC)*: Automated bytecode security auditor checking for honeypots, mint exploits, blacklist capabilities, and liquidity locking.
- **`get_weather`** *(0.01 USDC)*: High-resolution satellite meteorological intelligence (temperature, UV index, wind, humidity).

### 2. On-Chain & Financial Utilities (Free)
- **`get_my_wallet`**: Real-time Base Sepolia address, live ETH balance, BaseScan explorer URL, and network configuration.
- **`get_crypto_prices`**: Real-time spot price feeds and 24h market performance for major crypto assets.
- **`estimate_gas`**: Real-time gas price estimates for Base L2 vs. Ethereum Mainnet.
- **`calculate_tokenomics`**: Compound staking yield (APY to APR), market capitalization, and position calculator.
- **`roll_dice`**: Multi-sided cryptographic entropy roller (backward-compatible with starter kit prompts).

---

## 🔄 The x402 Micropayment Flow

```
[ User Prompt ]
      │
      ▼
[ AgentMAXX Cognitive Engine (Gemini 3.8 Flash) ]
      │
      ├── Needs Premium Data?
      │
      ▼
[ 1. HTTP GET /api/market-intel ]
      │
      ▼
[ 2. API returns HTTP 402 Payment Required ]
     Invoice: { price: "0.05", asset: "USDC", payTo: "0x...dEaD" }
      │
      ▼
[ 3. AgentMAXX Signs EIP-191 Payload with Private Key ]
     Creates Header: X-PAYMENT: base64({ payment, signature })
      │
      ▼
[ 4. Retry Request with X-PAYMENT Header ]
      │
      ▼
[ 5. Server Verifies ECDSA Signature -> HTTP 200 OK ]
      │
      ▼
[ 6. Agent Synthesizes Final Executive Briefing ]
```

---

## 💻 Tech Stack & Architecture

- **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **LLM Engine**: [Google Gemini 3.8 Flash](https://aistudio.google.com) via `@google/genai`
- **Web3 & Signer**: [viem](https://viem.sh/) (Base Sepolia Chain ID 84532, EIP-191 personal sign, RPC client)
- **Styling**: Tailwind CSS + Cyberpunk / Institutional Dark Terminal design system
- **Deployment**: [Vercel](https://vercel.com/) (Serverless-optimized with multi-tier `/tmp` wallet persistence)

---

## ⚙️ Quickstart & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Kalpesh-ops/AgentMAXX.git
cd AgentMAXX
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# (Optional) Provide an existing Base Sepolia private key (0x...)
# If omitted, AgentMAXX will auto-generate and persist one locally.
WALLET_PRIVATE_KEY=
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 Week 1 Hackathon Submission Details

- **Submission Deadline**: October 9
- **Repository**: [https://github.com/Kalpesh-ops/AgentMAXX](https://github.com/Kalpesh-ops/AgentMAXX)
- **Developer**: Kalpesh Parashar
- **Track**: Agentmaxxing — Week 1: Get Agentic

### Brief Note on Learnings & Experimentation
> *"Building AgentMAXX revealed the seismic shift from generative chat to agentic workflows. By equipping the agent with its own cryptographic keypair and hooking into the HTTP 402 status code, we demonstrated true autonomous machine-to-machine commerce. Instead of relying on centralized API keys or human checkout flows, the agent self-finances its queries on Base Sepolia in milliseconds. Designing robust tool-calling loops and verifiable EIP-191 signature verification underscored how decentralized infrastructure and frontier LLMs naturally converge."*

---

## 📜 License
MIT License. Open source for the Rise In Agentmaxxing Community.
