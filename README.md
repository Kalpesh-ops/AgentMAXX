# ⚡ AgentMAXX

```text
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗███╗   ███╗ █████╗ ██╗  ██╗██╗  ██╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝████╗ ████║██╔══██╗╚██╗██╔╝╚██╗██╔╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██╔████╔██║███████║ ╚███╔╝  ╚███╔╝ 
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║╚██╔╝██║██╔══██║ ██╔██╗  ██╔██╗ 
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║ ╚═╝ ██║██║  ██║██╔╝ ██╗██╔╝ ██╗
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
              AUTONOMOUS WEB3 AI AGENT • X402 ON-CHAIN SETTLEMENTS
```

> **Built for Rise In Agentmaxxing — 3-Week Journey (Week 1 $\rightarrow$ Week 2 $\rightarrow$ Week 3)**  
> *Autonomous Multi-Tool Agent with Embedded Base Sepolia Wallet & On-Chain X402 Micropayment Settlement Engine.*

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://agent-maxx.vercel.app)
[![Network](https://img.shields.io/badge/Network-Base%20Sepolia%20(84532)-blue?style=for-the-badge&logo=coinbase)](https://sepolia.basescan.org)
[![LLM](https://img.shields.io/badge/Model-Google%20Gemini%203.8%20Flash-orange?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Protocol](https://img.shields.io/badge/Payments-X402%20On--Chain%20Settlement-green?style=for-the-badge)](https://x402.org)
[![Explorer](https://img.shields.io/badge/Explorer-BaseScan%20Sepolia-purple?style=for-the-badge)](https://sepolia.basescan.org)
[![Launch Video](https://img.shields.io/badge/Video-Launch%20Demo%20(brag.mp4)-red?style=for-the-badge&logo=youtube)](https://agent-maxx.vercel.app/brag.mp4)

---

## 📌 Project Description: What Problem is AgentMAXX Solving?

Traditional AI agents are **passive text generators locked out of the global digital economy**. When an AI agent needs to access premium real-time data feeds, institutional quantitative alpha, or specialized compute APIs, it is stopped dead by Web2 paywalls that require:
1. Manual human account registration,
2. Credit card approvals with monthly recurring subscriptions,
3. Fragile API keys exposed to security breaches.

Furthermore, when AI agents produce high-value intelligence (such as smart contract security audits), their findings are stored in ephemeral databases with **no cryptographic proof, timestamping, or on-chain accountability**.

### The AgentMAXX Solution:
AgentMAXX transforms the AI agent into an **autonomous economic actor**:
- **X402 Protocol Integration**: Operates machine-to-machine payments using HTTP `402 Payment Required`. When encountering a monetized resource, the agent's embedded wallet signs and broadcasts an **actual on-chain transaction** on Base Sepolia, obtains the mined block receipt, and provides cryptographic proof to unlock the API.
- **On-Chain Audit Attestation**: Serializes executive findings into raw Ethereum calldata, permanently notarizing proof-of-audit reports on Base Sepolia.
- **Dual-Wallet Architecture**: Bridges user Web3 wallets (MetaMask, Coinbase) and the autonomous agent treasury, allowing seamless 1-click funding while preserving the agent's independent agency.

---

## 🛠️ Tech Stack & Dependencies

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `v16.3.6` (App Router) | High-performance fullstack framework & API routes |
| **React** | `v19.3.0` | Modern reactive UI components |
| **TypeScript** | `v5.9.3` | End-to-end type safety & contract schemas |
| **viem** | `v2.56.9` | Low-level EVM wallet client, transaction broadcasting & RPC engine |
| **@google/genai** | `v2.24.0` | Official Google Gemini GenAI SDK for autonomous function calling |
| **Tailwind CSS** | `v4.3.3` | Responsive glassmorphic cyber-terminal styling |
| **Lucide React** | `v1.48.0` | Clean iconography |
| **Network** | Base Sepolia (`84532`) | Fast, low-fee Ethereum Layer 2 testnet |
| **Explorer** | BaseScan Sepolia | Independent on-chain transaction verification |

---

## 🤖 Supported AI Models & Versioning

AgentMAXX supports Google's newest multimodal reasoning models, configured via `GEMINI_MODEL`:

1. **Google Gemini 3.8 Flash** (`gemini-3.8-flash`) — *Default Flagship*
   - Ultra-fast reasoning and autonomous tool calling latency.
   - Handles multi-turn function call loops and complex on-chain transaction orchestration.
2. **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) — *Fallback / Compatible*
   - Supported for standard tool calling and high-volume batch processing.

*Model Switching*: Configured via the `GEMINI_MODEL` environment variable in `.env`.

---

## 🧰 Complete Arsenal of Agent Tools

AgentMAXX equips Gemini with 12 typed capabilities across three categories:

### 1. X402 On-Chain Micropayment Tools (Week 3 Feature)
| Tool Name | Cost | Description | On-Chain Verification |
| :--- | :--- | :--- | :--- |
| `get_crypto_alpha` | `0.00002 ETH` | Fetches quantitative technical indicators (RSI-14, 50/200 EMA, MACD) and whale flows. | Base Sepolia on-chain tx with BaseScan link |
| `get_market_intel` | `0.00005 ETH` | Institutional crypto sentiment, Fear & Greed index, and narrative momentum. | Base Sepolia on-chain tx with BaseScan link |
| `audit_smart_contract`| `0.00003 ETH` | Automated static bytecode audit for honeypots, mint functions, and liquidity locks. | Base Sepolia on-chain tx with BaseScan link |
| `get_weather` | `0.00001 ETH` | High-resolution satellite climate metrics for mining data center efficiency. | Base Sepolia on-chain tx with BaseScan link |

### 2. On-Chain Base Sepolia Actions (Week 3 Feature)
| Tool Name | Cost | Description |
| :--- | :--- | :--- |
| `send_onchain_payment` | Gas + Amount | Executes native ETH transfer from the agent's wallet to any 0x recipient on Base Sepolia. Returns live BaseScan explorer link. |
| `publish_audit_attestation`| Gas only | Serializes audit findings into raw hex calldata and broadcasts an immutable on-chain Proof-of-Audit transaction. |
| `verify_contract_onchain` | Free | Queries Base Sepolia node to inspect deployed bytecode, contract byte size, balance, and EOA vs Smart Contract status. |

### 3. Real-Time Market & Utility Tools
| Tool Name | Cost | Description |
| :--- | :--- | :--- |
| `search_dex_pairs` | Free | Queries live spot liquidity, pool depth, 24h volume, and FDV via DexScreener. |
| `get_crypto_prices` | Free | Real-time spot prices and 24h percentage changes for benchmark crypto assets. |
| `get_chain_telemetry` | Free | Live Base Sepolia RPC metrics: block height, gas price in Gwei, and node latency. |
| `get_my_wallet` | Free | Reports agent treasury address, live ETH balance, and BaseScan explorer URL. |
| `calculate_tokenomics` | Free | Staking yield, compounding APY, and runway calculations. |

---

## ⚡ Key Features & How X402 On-Chain Settlement Works

### 1. True X402 On-Chain Payment Protocol Flow
Unlike naive templates that merely sign an off-chain text message without transferring any value, AgentMAXX implements **actual on-chain settlement on Base Sepolia**:

```
[AgentMAXX Client]                [Resource Endpoint / Provider]
        │                                       │
        │─── 1. GET /api/crypto-alpha ─────────►│
        │                                       │
        │◄── 2. HTTP 402 Payment Required ──────│
        │       { price: "0.00002 ETH",         │
        │         payTo: "0x6A19...",           │
        │         network: "Base Sepolia" }     │
        │                                       │
  [Agent Wallet signs & broadcasts              │
   tx on Base Sepolia, waits for receipt]       │
        │                                       │
        │─── 3. GET with X-PAYMENT-PROOF ──────►│
        │       { txHash: "0xabc...",           │
        │         payer: "0x0EF...",            │
        │         amount: "0.00002 ETH" }       │
        │                                       │
        │                        [Endpoint verifies tx & receipt
        │                         directly on Base Sepolia node]
        │                                       │
        │◄── 4. HTTP 200 OK + Data ─────────────│
        │       { verifiedSettlement: {         │
        │           txHash: "0xabc...",         │
        │           explorerUrl: "https://..."  │
        │       }}                              │
```

1. **Challenge (402)**: Protected API routes return HTTP 402 with structured `paymentRequirements` (recipient address, price in ETH, chainId `84532`).
2. **Autonomous Execution**: The agent's wallet client initiates an on-chain transfer to the recipient address on Base Sepolia.
3. **Mining & Confirmation**: The agent waits for the transaction receipt mined on Base Sepolia.
4. **Settlement Proof**: The agent attaches `X-PAYMENT-PROOF` (containing `txHash`, payer, recipient, amount) in the HTTP headers.
5. **On-Chain Verification**: The API endpoint queries Base Sepolia RPC (`chain.getTransactionReceipt` and `chain.getTransaction`), verifies the value transferred, matches the recipient, and ensures replay protection.
6. **Delivery & Explorer Display**: The response includes verified settlement data, and the UI provides a direct clickable link to **BaseScan Sepolia**.

### 2. Dual-Wallet Web3 Hub
- **User Wallet**: Connect MetaMask, Coinbase Wallet, or Rainbow using standard Web3 EIP-1193 provider.
- **Agent Treasury**: Autonomous Viem keypair on Base Sepolia with persistent, secure environment variable backing.
- **1-Click Funding**: Transfer test ETH from browser wallet directly into the agent's treasury.

### 3. Immutable On-Chain Calldata Attestation
- Rather than leaving audit trails in private logs, AgentMAXX encodes audit findings into UTF-8 $\rightarrow$ Hex calldata and broadcasts it directly to Base Sepolia, creating a permanent, tamper-proof record.

---

## 🔍 On-Chain Transaction Verification Guide

Every on-chain action executed by AgentMAXX displays the transaction hash and a direct BaseScan link:

1. **Agent Wallet on BaseScan**:
   `https://sepolia.basescan.org/address/{AGENT_WALLET_ADDRESS}`
2. **Sample Transaction Link**:
   `https://sepolia.basescan.org/tx/{TRANSACTION_HASH}`
3. **How to Verify**:
   - In the AgentMAXX UI, open the **Tool Execution Log** or **Crypto Hub**.
   - Click the **"BaseScan"** link next to the confirmed transaction.
   - BaseScan will confirm:
     - **Status**: `Success`
     - **Block**: Current Base Sepolia block height
     - **From**: Agent Wallet
     - **To**: Recipient / Attestation target
     - **Value**: Amount of ETH transferred

---

## 🔗 Demo Links & Submissions

| Week | Submission | Link |
| :--- | :--- | :--- |
| **Week 1** (`agentmaxx.v1`) | Interactive Autonomous Agent Prototype | [https://agent-maxx.vercel.app](https://agent-maxx.vercel.app) |
| **Week 2** (`agentmaxx.v2`) | Multi-Stage Agentic Workflow Engine | [https://agent-maxx.vercel.app](https://agent-maxx.vercel.app) |
| **Week 3** (`agentmaxx.v3`) | Full X402 On-Chain Settlement & Wallet Engine | [https://agent-maxx.vercel.app](https://agent-maxx.vercel.app) |

### 🎬 Demo Video
- **Launch Demo Video**: [Watch `brag.mp4`](https://agent-maxx.vercel.app/brag.mp4)
- **Demo Walkthrough**: Available directly in the **"Demo & Guide"** tab of the live application.

---

## 🚀 Setup & Local Installation

### Prerequisites
- Node.js 18+
- Base Sepolia testnet ETH from [Chainlink Faucet](https://faucets.chain.link/base-sepolia) or [Alchemy Base Sepolia Faucet](https://alchemy.com/faucets/base-sepolia).

### 1. Clone & Install
```bash
git clone https://github.com/Kalpesh-ops/AgentMAXX.git
cd AgentMAXX
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# Provide your Base Sepolia wallet private key (0x...)
WALLET_PRIVATE_KEY=0x_your_private_key_here

# (Optional) RPC URL
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

> **Security Note**: Never commit `.env` or any private key to source control. Both `.env` and `.agent-wallet.json` are strictly gitignored.

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔮 Future Scope

- **Multi-Chain X402 Routing**: Expand on-chain settlement to Base Mainnet, Arbitrum, Optimism, and Solana.
- **EIP-7702 Account Abstraction**: Upgrade the agent's wallet with session keys and programmable spending limits.
- **Decentralized Agent Marketplace**: Enable peer-to-peer x402 payment discovery where multiple AI agents can hire and pay each other on-chain.
- **Streaming Micropayments**: Integrate Superfluid / Sablier for continuous token streaming per second of compute.

---

## 🌐 Social Media & Community

- **Developer**: Kalpesh Parashar
- **GitHub**: [@Kalpesh-ops](https://github.com/Kalpesh-ops)
- **Rise In Community**: [@riseinweb3](https://x.com/riseinweb3)
- **Project Repository**: [https://github.com/Kalpesh-ops/AgentMAXX](https://github.com/Kalpesh-ops/AgentMAXX)

---

## 📜 License

MIT License. Open source for the Rise In Agentmaxxing Community.
