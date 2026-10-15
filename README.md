# AgentMAXX ⚡
### Autonomous On-Chain Web3 Agent, Base Sepolia Wallet Engine & x402 Micropayments
> **Built for Rise In Agentmaxxing — Week 3: "Give It A Wallet"**  
> *(Evolved from Week 1 Prototype $\rightarrow$ Week 2 Workflow Engine $\rightarrow$ Week 3 Full Crypto-Enabled Autonomous Agent)*

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://agent-maxx.vercel.app)
[![Network](https://img.shields.io/badge/Network-Base%20Sepolia%20(Chain%20ID%2084532)-blue?style=for-the-badge&logo=coinbase)](https://sepolia.basescan.org)
[![LLM](https://img.shields.io/badge/Model-Google%20Gemini%203.8%20Flash-orange?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Crypto Engine](https://img.shields.io/badge/Crypto%20Engine-viem%20v2%20+%20BaseScan-purple?style=for-the-badge)](https://sepolia.basescan.org)
[![Protocol](https://img.shields.io/badge/Payments-x402%20EIP--191%20Settlements-green?style=for-the-badge)](https://agent-maxx.vercel.app)

---

## 💸 What&apos;s New in Week 3: "Give It A Wallet"

In Week 1 and 2, we built an AI agent capable of multi-stage workflows, live DEX telemetry, and machine-to-machine x402 signatures.

In **Week 3: Give It A Wallet**, we brought in the **on-chain crypto layer**. AgentMAXX is now an autonomous crypto agent with real wallet capabilities on **Base Sepolia (Chain ID: 84532)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AGENTMAXX v3.0 CRYPTO ARCHITECTURE                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [ User / Web3 Wallet ] ◄─── Dual-Wallet Hub ───► [ Agent Wallet ]    │
│   (MetaMask / Coinbase)                              (Base Sepolia)    │
│            │                                                │          │
│            ▼                                                ▼          │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │           COGNITIVE ENGINE & ON-CHAIN CONTROLLER             │     │
│   │             (Google Gemini 3.8 Flash + viem v2)              │     │
│   └──────────────────────┬───────────────────────┬───────────────┘     │
│                          │                       │                     │
│       On-Chain Action Router                     │                     │
│       ┌──────────────────┴──────────────────┐    │                     │
│       ▼                                     ▼    ▼                     │
│   [Live ETH Transfers]            [Calldata Notarization]              │
│   - Direct Base Sepolia tx        - Encodes audit reports              │
│   - Validates balance & gas       - Broadcasts to Base Sepolia ledger  │
│   - Returns live BaseScan link    - Permanent on-chain proof           │
│       │                                     │                          │
│       └──────────────────┬──────────────────┘                          │
│                          ▼                                             │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │          ON-CHAIN VERIFICATION & M2M PAYMENT SUITE           │     │
│   │  • Smart Contract Bytecode Inspection (Honeypot detection)   │     │
│   │  • EIP-191 Micropayment Handshakes (x402 Protocol)           │     │
│   │  • Live Base Sepolia RPC Telemetry (Block, Gas in Gwei)      │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Crypto Capabilities (Week 3 Requirements)

### 1. 💳 Dual-Wallet Architecture (User + Agent)
- **Agent Dedicated Wallet**: The agent owns an on-chain keypair initialized on **Base Sepolia** (`viem` PrivateKeyAccount), capable of signing transactions, holding ETH/tokens, paying for services, and broadcasting calldata.
- **User Web3 Connection**: Users can connect their own browser wallet (MetaMask, Coinbase Wallet, Rainbow) via standard `window.ethereum` RPC (`eth_requestAccounts`) and switch seamlessly to Base Sepolia (Chain ID: `0x14a34` / `84532`).
- **1-Click Funding**: Users can fund the agent's autonomous wallet directly with test ETH via Web3 transfer from within the UI.

### 2. 💸 Autonomous On-Chain ETH Transfers (`sendOnChainPayment`)
- AgentMAXX can initiate real on-chain native ETH transactions on Base Sepolia.
- Validates recipient checksum addresses, evaluates live gas prices from the Base Sepolia RPC, and submits the transaction with cryptographic receipts.
- Direct live links to [BaseScan Sepolia](https://sepolia.basescan.org) for instant verification.

### 3. 📜 On-Chain Calldata Notarization (`publishOnChainAttestation`)
- **Where Crypto Actually Makes Sense for AI Agents**: Rather than storing audit logs off-chain, AgentMAXX serializes its security findings, token evaluations, or verification proofs into raw hex calldata (`0x...`) and broadcasts an on-chain transaction to Base Sepolia.
- The transaction permanently etches the AI audit digest into Ethereum state, creating tamper-proof, timestamped, immutable **Proof-of-Audit**.

### 4. 🔍 Live Smart Contract Bytecode Verification (`verifyContractBytecode`)
- Connects to Base Sepolia RPC via `publicClient.getBytecode({ address })`.
- Inspects target contract bytecode on-chain, measures exact byte size, detects self-destruct opcodes (`0xff`), owner-only balance drains, or verifies whether an address is an EOA or a deployed smart contract.

### 5. 🤖 Week 3 Workflow: On-Chain Audit & Notarization Pipeline
- **Stage 1**: Query live DEX liquidity and price metrics via DexScreener.
- **Stage 2**: Inspect target smart contract bytecode live on Base Sepolia.
- **Stage 3**: Settle 0.02 USDC via x402 EIP-191 micropayment for off-chain quantitative signals.
- **Stage 4**: Synthesize executive audit findings with Gemini 3.8 Flash.
- **Stage 5**: **Broadcast immutable Proof-of-Audit calldata transaction** to Base Sepolia, returning the notarized hash!

---

## 🎬 Judge Walkthrough & Demo Guide (Under 90 Seconds)

Experience all Week 3 crypto capabilities live right now:

1. **Visit Live App**: [https://agent-maxx.vercel.app/](https://agent-maxx.vercel.app/)
2. **Explore Tab 03 — "Crypto & On-Chain Hub"**:
   - Inspect the **Agent On-Chain Wallet** address on Base Sepolia.
   - Click **"Connect User Wallet"** to pair your MetaMask/browser wallet and see your address and balance side-by-side.
   - Click **"Test Transfer"** or enter any Base Sepolia address to see the agent execute an on-chain ETH transfer.
   - Click **"Publish Proof-of-Audit"** to see the agent serialize an audit digest into UTF-8 $\rightarrow$ Hex calldata and broadcast the transaction.
   - Enter any contract address (e.g. AERO, BRETT, or the agent address) and click **"Inspect Bytecode"** to verify on-chain deployment.
3. **Explore Tab 02 — "Agentic Workflows"**:
   - Select **"⛓️ On-Chain Audit & Notarization Pipeline"**.
   - Click **"Launch Autonomous Workflow"**.
   - Watch the 5-stage pipeline execute, ending with an on-chain notarization receipt on Base Sepolia.
4. **Explore Tab 01 — "Executive Console"**:
   - Ask the agent: *"Send 0.0001 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Base Sepolia"* or *"Notarize an audit for Brett on Base Sepolia"*.
   - Watch Gemini 3.8 Flash autonomously invoke the corresponding crypto tool and return real on-chain transaction metadata.

---

## 🏆 Week 3 Hackathon Submission Details

- **Challenge**: Rise In Agentmaxxing — Week 3: Give It A Wallet
- **Submission Deadline**: October 23
- **Live Production App**: [https://agent-maxx.vercel.app/](https://agent-maxx.vercel.app/)
- **GitHub Repository**: [https://github.com/Kalpesh-ops/AgentMAXX](https://github.com/Kalpesh-ops/AgentMAXX)
- **Target Network**: Base Sepolia Testnet (Chain ID: 84532)
- **Developer**: Kalpesh Parashar

### Key Week 3 Learnings & Crypto Reflection
> *"Giving an AI agent a crypto wallet fundamentally changes its nature: it transforms from an advice-generator into an autonomous economic actor. By equipping AgentMAXX with a dedicated Base Sepolia wallet using viem, the agent can hold capital, execute native transactions, and notarize its intelligence directly into the blockchain ledger. We also discovered where crypto makes the most sense for agents: immutable audit proofs via calldata notarization, machine-to-machine x402 micropayments where credit cards are impossible, and verifiable smart contract bytecode inspection before capital allocation."*

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Blockchain**: Base Sepolia (Chain ID: 84532), `viem` v2, BaseScan API
- **AI Engine**: Google Gemini 3.8 Flash (`@google/genai`)
- **Micropayments**: HTTP 402 Payment Required + EIP-191 Personal Signatures
- **Hosting**: Vercel Serverless Edge

---

## 📜 License
MIT License. Open source for the Rise In Agentmaxxing Community.
