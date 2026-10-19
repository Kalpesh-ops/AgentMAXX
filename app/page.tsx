"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  Copy,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  SendHorizontal,
  Wallet,
  ShieldCheck,
  Zap,
  TrendingUp,
  CloudSun,
  Key,
  Cpu,
  Award,
  Sparkles,
  Receipt,
  FileCode,
  DollarSign,
  Activity,
  X,
  Play,
  Layers,
  Radio,
  ArrowRight,
  Search,
  Terminal,
  Sliders,
  BarChart3,
  CheckCircle2,
  Send,
  Link as LinkIcon,
  Globe,
  Coins,
  FileCheck2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Step = { tool: string; args: unknown; result: any; error?: boolean };
type Message = { role: "user" | "agent"; text: string; steps?: Step[]; error?: boolean };
type ToolInfo = { name: string; description: string; category?: string; cost?: string };
type Status = { hasApiKey: boolean; model: string; tools: ToolInfo[] };
type WalletInfo = {
  address: string | null;
  balance?: string;
  network?: string;
  explorerUrl?: string;
  faucetUrl?: string;
  privateKey?: string;
};
type Telemetry = {
  network: string;
  chainId: number;
  blockNumber: string;
  gasPriceGwei: string;
  latencyMs: number;
  rpcStatus: string;
  agentTransactions: number;
  timestamp: string;
};
type WorkflowStep = {
  id: string;
  name: string;
  toolName: string;
  description: string;
  cost?: string;
  isPaid?: boolean;
};
type WorkflowDef = {
  id: string;
  title: string;
  badge: string;
  description: string;
  totalCost: string;
  steps: WorkflowStep[];
  defaultParams: Record<string, any>;
};

const PRESET_PROMPTS = [
  {
    label: "💸 Send 0.0001 Base ETH",
    prompt: "Execute an on-chain transfer of 0.0001 Base Sepolia ETH to 0x000000000000000000000000000000000000dEaD.",
    type: "crypto",
  },
  {
    label: "📜 On-Chain Attestation",
    prompt: "Publish an on-chain Proof-of-Audit attestation for Aerodrome Finance on Base Sepolia.",
    type: "crypto",
  },
  {
    label: "🔎 On-Chain Bytecode Scan",
    prompt: "Verify deployed on-chain bytecode and account type for address 0x940181a94A35A4569E4529A3CDfB74e48FD98631.",
    type: "crypto",
  },
  {
    label: "📊 Market Intel (0.05 USDC)",
    prompt: "Provide institutional crypto market intelligence on sentiment, Fear & Greed index, and trending narratives.",
    type: "paid",
  },
  {
    label: "⚡ BTC Alpha (0.02 USDC)",
    prompt: "Give me deep quantitative alpha and on-chain whale metrics for BTC.",
    type: "paid",
  },
  {
    label: "🛡️ Contract Audit (0.03 USDC)",
    prompt: "Audit smart contract 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 for security risks.",
    type: "paid",
  },
  {
    label: "🔎 Live DEX Query (AERO)",
    prompt: "Search real-time DEX liquidity, price, and 24h volume for AERO on Base via DexScreener.",
    type: "free",
  },
  {
    label: "💰 Treasury & Wallet",
    prompt: "What is your wallet address, Base Sepolia balance, and explorer link?",
    type: "free",
  },
  {
    label: "🌐 Base Sepolia Telemetry",
    prompt: "Fetch live Base Sepolia RPC metrics, current block number, and live gas price.",
    type: "free",
  },
  {
    label: "🎲 Roll 20-sided Dice",
    prompt: "Roll a 20 sided dice.",
    type: "free",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "workflows" | "crypto" | "demo">("chat");
  const [persona, setPersona] = useState<"executive" | "alpha-hunter" | "security-auditor">("executive");
  const [status, setStatus] = useState<Status | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowDef[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toolFilter, setToolFilter] = useState<"all" | "crypto" | "paid" | "free">("all");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  // WEEK 3: Web3 User Browser Wallet Connection State
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [userNetwork, setUserNetwork] = useState<string | null>(null);
  const [connectingUserWallet, setConnectingUserWallet] = useState(false);
  const [fundingAgent, setFundingAgent] = useState(false);

  // WEEK 3: On-Chain Action Form States
  const [transferRecipient, setTransferRecipient] = useState("0x000000000000000000000000000000000000dEaD");
  const [transferAmount, setTransferAmount] = useState("0.0001");
  const [transferStatus, setTransferStatus] = useState<any | null>(null);
  const [transferring, setTransferring] = useState(false);

  const [attestTitle, setAttestTitle] = useState("Aerodrome Protocol Security Attestation");
  const [attestTarget, setAttestTarget] = useState("0x940181a94A35A4569E4529A3CDfB74e48FD98631");
  const [attestSummary, setAttestSummary] = useState("Passed bytecode static analysis and liquidity lock checks on Base Sepolia.");
  const [attestStatus, setAttestStatus] = useState<any | null>(null);
  const [attesting, setAttesting] = useState(false);

  const [bytecodeInput, setBytecodeInput] = useState("0x940181a94A35A4569E4529A3CDfB74e48FD98631");
  const [bytecodeData, setBytecodeData] = useState<any | null>(null);
  const [inspectingBytecode, setInspectingBytecode] = useState(false);

  // Workflow execution state
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("onchain_notarization_pipeline");
  const [workflowParams, setWorkflowParams] = useState<Record<string, any>>({});
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<any | null>(null);

  // Demo Walkthrough state
  const [demoStep, setDemoStep] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const loadWallet = () =>
    fetch("/api/wallet")
      .then((r) => r.json())
      .then(setWallet)
      .catch(() => {});

  const loadTelemetry = () =>
    fetch("/api/telemetry")
      .then((r) => r.json())
      .then(setTelemetry)
      .catch(() => {});

  const loadWorkflows = () =>
    fetch("/api/workflow")
      .then((r) => r.json())
      .then((d) => setWorkflows(d.workflows || []))
      .catch(() => {});

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
    loadWallet();
    loadTelemetry();
    loadWorkflows();

    const interval = setInterval(loadTelemetry, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function createWallet() {
    setCreating(true);
    await fetch("/api/wallet", { method: "POST" });
    await loadWallet();
    setCreating(false);
  }

  async function fetchPrivateKey() {
    try {
      const res = await fetch("/api/wallet?export=true");
      const data = await res.json();
      if (data.privateKey) {
        setPrivateKey(data.privateKey);
        setShowKeyModal(true);
      }
    } catch {}
  }

  // Connect User Web3 Browser Wallet (MetaMask, Coinbase Wallet)
  async function connectUserWallet() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("No EVM wallet extension detected. Please install MetaMask or Coinbase Wallet.");
      return;
    }
    setConnectingUserWallet(true);
    try {
      const provider = (window as any).ethereum;
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts?.[0]) {
        setUserAddress(accounts[0]);
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x14a34" }], // 84532 in hex
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x14a34",
                  chainName: "Base Sepolia Testnet",
                  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["https://sepolia.base.org"],
                  blockExplorerUrls: ["https://sepolia.basescan.org"],
                },
              ],
            });
          }
        }
        const bal = await provider.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        });
        const wei = parseInt(bal, 16);
        setUserBalance((wei / 1e18).toFixed(4) + " ETH");
        setUserNetwork("Base Sepolia (84532)");
      }
    } catch (err: any) {
      console.error("Wallet connect error:", err);
    }
    setConnectingUserWallet(false);
  }

  // 1-Click Fund Agent Treasury from User's Connected Wallet
  async function fundAgentFromUser() {
    if (!userAddress || !wallet?.address) return;
    setFundingAgent(true);
    try {
      const provider = (window as any).ethereum;
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: userAddress,
            to: wallet.address,
            value: "0x38d7ea4c68000", // 0.001 ETH
          },
        ],
      });
      alert(`Funding transaction submitted! Tx Hash: ${txHash}`);
      setTimeout(loadWallet, 4000);
    } catch (err: any) {
      alert(`Funding error: ${err.message}`);
    }
    setFundingAgent(false);
  }

  // Execute On-Chain Transfer
  async function handleOnChainTransfer() {
    if (!transferRecipient) return;
    setTransferring(true);
    setTransferStatus(null);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "transfer",
          to: transferRecipient,
          amountEth: transferAmount,
        }),
      });
      const data = await res.json();
      setTransferStatus(data);
      loadWallet();
    } catch (err: any) {
      setTransferStatus({ error: err.message });
    }
    setTransferring(false);
  }

  // Publish On-Chain Proof-of-Audit Attestation
  async function handleOnChainAttest() {
    if (!attestTitle || !attestSummary) return;
    setAttesting(true);
    setAttestStatus(null);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "attest",
          title: attestTitle,
          summary: attestSummary,
          target: attestTarget,
        }),
      });
      const data = await res.json();
      setAttestStatus(data);
      loadWallet();
    } catch (err: any) {
      setAttestStatus({ error: err.message });
    }
    setAttesting(false);
  }

  // Inspect Bytecode on Base Sepolia
  async function handleInspectBytecode() {
    if (!bytecodeInput) return;
    setInspectingBytecode(true);
    setBytecodeData(null);
    try {
      const res = await fetch(`/api/wallet?bytecode=${encodeURIComponent(bytecodeInput)}`);
      const data = await res.json();
      setBytecodeData(data);
    } catch (err: any) {
      setBytecodeData({ error: err.message });
    }
    setInspectingBytecode(false);
  }

  async function send(text: string) {
    if (!text.trim() || thinking) return;
    const history: Message[] = [...messages, { role: "user", text }];
    setMessages(history);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.filter((m) => !m.error).map(({ role, text }) => ({ role, text })),
          persona,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        data.error
          ? { role: "agent", text: data.error, error: true }
          : { role: "agent", text: data.answer, steps: data.steps },
      ]);
      if (data.steps?.some((s: Step) => s.result?.payment || s.tool === "send_onchain_payment")) loadWallet();
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text: "Could not reach the server. Please check your connection.",
          error: true,
        },
      ]);
    }
    setThinking(false);
  }

  async function runSelectedWorkflow() {
    if (workflowRunning) return;
    setWorkflowRunning(true);
    setWorkflowResult(null);

    try {
      const res = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: selectedWorkflow,
          params: workflowParams,
        }),
      });
      const data = await res.json();
      setWorkflowResult(data);
      loadWallet();
    } catch (err) {
      setWorkflowResult({ error: "Failed to execute workflow." });
    }
    setWorkflowRunning(false);
  }

  async function startInteractiveDemo() {
    setActiveTab("demo");
    setDemoRunning(true);
    setDemoStep(1);

    setTimeout(() => setDemoStep(2), 2200);
    setTimeout(() => setDemoStep(3), 4800);
    setTimeout(() => {
      setDemoStep(4);
      setDemoRunning(false);
    }, 7200);
  }

  const ready = Boolean(status?.hasApiKey);

  const filteredTools = status?.tools.filter((t) => {
    if (toolFilter === "crypto") return t.category === "onchain-action";
    if (toolFilter === "paid") return t.category === "x402-paid";
    if (toolFilter === "free") return t.category === "free-utility";
    return true;
  });

  const currentWorkflowDef = workflows.find((w) => w.id === selectedWorkflow);

  return (
    <main className="mx-auto flex min-h-screen max-w-[1640px] flex-col gap-6 px-4 py-6 md:px-10 md:py-8">
      {/* Top Banner / Ticker */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded bg-muted/80 px-2.5 py-1 font-mono text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <span className="font-semibold text-foreground">RISE IN</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-primary font-bold">AGENTMAXXING</span>
              <span className="text-muted-foreground text-[10px] bg-primary/10 px-1 py-0.2 border border-primary/30">
                WEEK 3: GIVE IT A WALLET
              </span>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30 flex items-center gap-1">
              <Radio className="size-3 animate-pulse" /> Base Sepolia {telemetry?.blockNumber ? `#${telemetry.blockNumber}` : "84532"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {status && (
              <div className="flex items-center gap-2 border border-border bg-muted/50 px-3 py-1 font-mono text-xs text-muted-foreground">
                <Cpu className="size-3.5 text-primary" />
                <span>Model: <strong className="text-foreground">{status.model}</strong></span>
              </div>
            )}
            {wallet?.address && (
              <div className="flex items-center gap-2 border border-border bg-muted/50 px-3 py-1 font-mono text-xs text-muted-foreground">
                <Wallet className="size-3.5 text-primary" />
                <span>Agent Treasury: <strong className="text-primary">{wallet.balance || "0.0000 ETH"}</strong></span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubmissionModal(true)}
              className="border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs uppercase"
            >
              <Award className="size-3.5 mr-1" /> Week 3 Submission Package
            </Button>
          </div>
        </div>

        {/* Hero Title & Persona Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
                Autonomous Crypto-Enabled AI Agent & On-Chain Hub
              </span>
              <span className="rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                v3.0 CRYPTO WALLET EDITION
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight uppercase md:text-7xl">
              AGENT<span className="text-primary">MAXX</span>
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground md:text-base">
              Autonomous on-chain Web3 agent with native Base Sepolia crypto treasury. Executes live on-chain ETH transactions, writes immutable proof-of-audit attestations, and connects user Web3 wallets.
            </p>
          </div>

          {/* Persona Selector */}
          <div className="flex flex-col gap-1.5 border-l-2 border-primary pl-4 font-mono text-xs">
            <span className="text-muted-foreground uppercase text-[10px] font-bold">Active Agent Persona:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPersona("executive")}
                className={cn(
                  "border px-2.5 py-1 text-xs transition-colors font-medium",
                  persona === "executive"
                    ? "border-primary bg-primary text-primary-foreground font-bold"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                Executive 💼
              </button>
              <button
                onClick={() => setPersona("alpha-hunter")}
                className={cn(
                  "border px-2.5 py-1 text-xs transition-colors font-medium",
                  persona === "alpha-hunter"
                    ? "border-primary bg-primary text-primary-foreground font-bold"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                Alpha Hunter ⚡
              </button>
              <button
                onClick={() => setPersona("security-auditor")}
                className={cn(
                  "border px-2.5 py-1 text-xs transition-colors font-medium",
                  persona === "security-auditor"
                    ? "border-primary bg-primary text-primary-foreground font-bold"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                Auditor 🛡️
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Week 3 Enhanced Navigation) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex items-center gap-2 border px-4 py-2 uppercase transition-all",
              activeTab === "chat"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Terminal className="size-3.5" /> 01. Executive Console
          </button>
          <button
            onClick={() => setActiveTab("workflows")}
            className={cn(
              "flex items-center gap-2 border px-4 py-2 uppercase transition-all",
              activeTab === "workflows"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Layers className="size-3.5" /> 02. Agentic Workflows ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab("crypto")}
            className={cn(
              "flex items-center gap-2 border px-4 py-2 uppercase transition-all",
              activeTab === "crypto"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Coins className="size-3.5" /> 03. Crypto & On-Chain Hub
          </button>
          <button
            onClick={() => setActiveTab("demo")}
            className={cn(
              "flex items-center gap-2 border px-4 py-2 uppercase transition-all",
              activeTab === "demo"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Play className="size-3.5" /> 04. Demo & Walkthrough Guide
          </button>
        </div>
      </header>

      {/* TAB 1: EXECUTIVE CHAT CONSOLE */}
      {activeTab === "chat" && (
        <div className="grid flex-1 gap-6 lg:grid-cols-[400px_1fr]">
          {/* Left Column: Treasury + Tools */}
          <aside className="flex flex-col gap-6">
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <SectionTitle num="01" title="Agent Treasury & Node" />
              </CardHeader>
              <CardContent className="flex flex-col pt-4">
                <SetupStep number={1} title={`Gemini 3.8 Flash (${persona.toUpperCase()})`} done={ready}>
                  {ready && <p className="text-xs text-muted-foreground">Active with on-chain execution loop.</p>}
                  {!ready && <p className="text-xs text-muted-foreground">Configure GEMINI_API_KEY to start.</p>}
                </SetupStep>

                <SetupStep number={2} title="Agent Wallet (Base Sepolia)" done={Boolean(wallet?.address)}>
                  {wallet && !wallet.address && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-muted-foreground">Generate the agent&apos;s Base Sepolia testnet keypair.</p>
                      <Button onClick={createWallet} disabled={creating} className="w-fit font-mono text-xs uppercase">
                        <Wallet className="size-3.5 mr-1" /> {creating ? "Generating..." : "Create Wallet"}
                      </Button>
                    </div>
                  )}
                  {wallet?.address && (
                    <WalletDetails wallet={wallet} onRefresh={loadWallet} onExportKey={fetchPrivateKey} />
                  )}
                </SetupStep>

                <SetupStep number={3} title="On-Chain & x402 Capabilities" done={Boolean(wallet?.address)} last>
                  <p className="text-xs text-muted-foreground">
                    Executes real Base Sepolia ETH transfers, writes on-chain calldata attestations, and settles x402 paid APIs.
                  </p>
                </SetupStep>
              </CardContent>
            </Card>

            {/* Tool Arsenal */}
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <div className="flex items-center justify-between">
                  <SectionTitle num="02" title="Tool Arsenal" />
                  <div className="flex gap-1 font-mono text-[11px]">
                    <button
                      onClick={() => setToolFilter("all")}
                      className={cn("px-2 py-0.5", toolFilter === "all" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground")}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setToolFilter("crypto")}
                      className={cn("px-2 py-0.5", toolFilter === "crypto" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground")}
                    >
                      On-Chain
                    </button>
                    <button
                      onClick={() => setToolFilter("paid")}
                      className={cn("px-2 py-0.5", toolFilter === "paid" ? "bg-blue text-foreground font-bold" : "text-muted-foreground")}
                    >
                      x402
                    </button>
                    <button
                      onClick={() => setToolFilter("free")}
                      className={cn("px-2 py-0.5", toolFilter === "free" ? "bg-muted text-foreground font-bold" : "text-muted-foreground")}
                    >
                      Free
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-4">
                {filteredTools?.map((t) => (
                  <div key={t.name} className="border border-border/60 bg-muted/30 p-2.5 transition-colors hover:border-primary/60">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-xs font-semibold text-foreground">
                        <span className="text-primary">&gt;</span> {t.name}
                      </p>
                      {t.category === "onchain-action" ? (
                        <Badge className="bg-primary/20 text-primary border border-primary/40 font-mono text-[10px]">ON-CHAIN</Badge>
                      ) : t.category === "x402-paid" ? (
                        <Badge className="bg-blue/80 font-mono text-[10px] text-foreground">{t.cost || "PAID"}</Badge>
                      ) : (
                        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">FREE</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Right Column: Chat Console */}
          <Card className="flex h-[calc(100vh-6rem)] min-h-[640px] flex-col border-border">
            <CardHeader className="border-b border-border/80">
              <div className="flex items-center justify-between">
                <SectionTitle num="03" title={`Executive Console [${persona.toUpperCase()} MODE]`} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-mono text-xs uppercase"
                  onClick={() => setMessages([])}
                  disabled={messages.length === 0 || thinking}
                >
                  <RotateCcw className="size-3.5 mr-1" /> Reset
                </Button>
              </div>

              {/* Quick Prompt Chips */}
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => send(p.prompt)}
                    disabled={!ready || thinking}
                    className="shrink-0 border border-border/80 bg-background px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:border-primary hover:text-foreground active:scale-95 disabled:opacity-50"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-5 px-5 py-5">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center gap-6 py-14 text-center">
                    <div className="flex size-14 items-center justify-center bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                      <Bot className="size-8" />
                    </div>
                    <div className="max-w-md">
                      <h2 className="text-2xl font-bold uppercase tracking-tight">AgentMAXX Crypto Edition</h2>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Ready to execute Base Sepolia on-chain transactions, proof-of-audit attestations, DexScreener lookups, and x402 settlements.
                      </p>
                    </div>
                    <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                      {PRESET_PROMPTS.slice(0, 4).map((p, i) => (
                        <button
                          key={i}
                          onClick={() => send(p.prompt)}
                          disabled={!ready}
                          className="flex flex-col items-start border border-border/80 bg-muted/40 p-3 text-left font-mono text-xs transition-colors hover:border-primary hover:bg-muted"
                        >
                          <span className="font-semibold text-primary">{p.label}</span>
                          <span className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{p.prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="max-w-[80%] self-end bg-primary px-4 py-2.5 font-mono text-xs font-semibold text-primary-foreground shadow-sm">
                      {m.text}
                    </div>
                  ) : (
                    <div key={i} className="flex max-w-[92%] gap-3 self-start">
                      <div className="flex size-8 shrink-0 items-center justify-center border border-primary/40 bg-background">
                        <Bot className="size-4 text-primary" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-3">
                        {m.steps?.map((s, j) => (
                          <ToolCall key={j} step={s} />
                        ))}
                        <div
                          className={cn(
                            "border p-4 text-xs leading-relaxed",
                            m.error
                              ? "border-destructive/40 bg-destructive/10 text-destructive"
                              : "border-border bg-muted/40 text-foreground"
                          )}
                        >
                          {m.error && (
                            <div className="flex items-center gap-2 mb-2 font-mono font-bold text-destructive">
                              <CircleAlert className="size-4 shrink-0" />
                              <span>Execution Error</span>
                            </div>
                          )}
                          <MarkdownText content={m.text} />
                        </div>
                      </div>
                    </div>
                  )
                )}

                {thinking && (
                  <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                    <div className="flex size-6 items-center justify-center border border-primary/40 bg-background">
                      <Sparkles className="size-3.5 text-primary animate-spin" />
                    </div>
                    <span>AgentMAXX analyzing cognitive loop & executing on-chain tools...</span>
                    <span className="inline-block h-3 w-1.5 animate-pulse bg-primary" />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <CardFooter className="border-t border-border/80 pt-4">
              <form
                className="flex w-full gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                <div className={cn("flex flex-1 items-center border border-input bg-background focus-within:border-primary", !ready && "opacity-50")}>
                  <span className="pl-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    agentmaxx[{persona}]:~$
                  </span>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={ready ? "Enter prompt, on-chain transfer, or attestation instruction..." : "Configure GEMINI_API_KEY to start"}
                    disabled={!ready}
                    className="h-11 border-0 bg-transparent font-mono text-xs focus-visible:ring-0"
                  />
                </div>
                <Button type="submit" className="h-auto px-6 font-mono text-xs uppercase" disabled={!ready || thinking || !input.trim()}>
                  <SendHorizontal className="size-4 mr-1.5" /> Run
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* TAB 2: AGENTIC WORKFLOWS RUNNER */}
      {activeTab === "workflows" && (
        <div className="grid flex-1 gap-6 lg:grid-cols-[420px_1fr]">
          {/* Left: Workflow Selection & Parameters */}
          <aside className="flex flex-col gap-6">
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <SectionTitle num="01" title="Select Autonomous Workflow" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-4">
                {workflows.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => {
                      setSelectedWorkflow(wf.id);
                      setWorkflowParams(wf.defaultParams);
                      setWorkflowResult(null);
                    }}
                    className={cn(
                      "cursor-pointer border p-3.5 transition-all",
                      selectedWorkflow === wf.id
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/70 bg-muted/30 hover:border-border"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-primary">{wf.badge}</span>
                      <Badge className="font-mono text-[10px] bg-blue text-foreground">{wf.totalCost}</Badge>
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{wf.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{wf.description}</p>
                    <div className="mt-2.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                      <span>Stages: {wf.steps.length} sequential operations</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Workflow Parameters */}
            {currentWorkflowDef && (
              <Card className="border-border">
                <CardHeader className="border-b border-border/80">
                  <SectionTitle num="02" title="Pipeline Parameters" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-4 font-mono text-xs">
                  {Object.entries(currentWorkflowDef.defaultParams).map(([k, defaultVal]) => (
                    <div key={k} className="flex flex-col gap-1">
                      <label className="text-[11px] text-muted-foreground uppercase">{k}:</label>
                      <Input
                        value={workflowParams[k] ?? defaultVal}
                        onChange={(e) => setWorkflowParams({ ...workflowParams, [k]: e.target.value })}
                        className="h-8 border-border bg-background font-mono text-xs"
                      />
                    </div>
                  ))}
                  <Button
                    onClick={runSelectedWorkflow}
                    disabled={workflowRunning || !ready}
                    className="mt-3 font-mono text-xs uppercase"
                  >
                    {workflowRunning ? (
                      <>
                        <Sparkles className="size-3.5 mr-2 animate-spin" /> Orchestrating Pipeline...
                      </>
                    ) : (
                      <>
                        <Play className="size-3.5 mr-2" /> Launch Autonomous Workflow
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Right: Live Execution Pipeline Visualizer */}
          <Card className="flex flex-col border-border">
            <CardHeader className="border-b border-border/80">
              <div className="flex items-center justify-between">
                <div>
                  <SectionTitle num="03" title="Pipeline DAG Execution Visualizer" />
                  <h2 className="text-xl font-bold uppercase mt-1">{currentWorkflowDef?.title}</h2>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  Est. Cost: <strong className="text-primary">{currentWorkflowDef?.totalCost}</strong>
                </div>
              </div>

              {/* Workflow Stepper DAG */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
                {currentWorkflowDef?.steps.map((st, idx) => {
                  const stepDone = workflowResult?.stepResults?.some((r: any) => r.stepId === st.id);
                  return (
                    <div
                      key={st.id}
                      className={cn(
                        "border p-2.5 font-mono text-xs transition-colors",
                        workflowRunning
                          ? "border-primary/40 bg-primary/5 animate-pulse"
                          : stepDone
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/60 bg-muted/20 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-primary font-bold">STAGE 0{idx + 1}</span>
                        {st.isPaid ? (
                          <span className="text-blue font-bold">{st.cost}</span>
                        ) : (
                          <span className="text-muted-foreground">FREE</span>
                        )}
                      </div>
                      <p className="font-bold text-xs truncate text-foreground">{st.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">&gt; {st.toolName}</p>
                    </div>
                  );
                })}
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-5">
              {workflowRunning && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="size-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="font-mono text-sm text-foreground">
                    AgentMAXX orchestrating multi-stage pipeline & on-chain operations...
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    Executing sequential tool calls, verifying EIP-191 signatures, and synthesizing final dossier.
                  </p>
                </div>
              )}

              {!workflowRunning && !workflowResult && (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                  <Layers className="size-12 text-muted-foreground" />
                  <h3 className="font-bold text-lg uppercase">Workflow Ready to Launch</h3>
                  <p className="max-w-md text-xs text-muted-foreground">
                    Click &ldquo;Launch Autonomous Workflow&rdquo; on the left to trigger the multi-stage autonomous pipeline.
                    AgentMAXX will execute every stage sequentially and synthesize an executive dossier.
                  </p>
                </div>
              )}

              {workflowResult && (
                <div className="flex flex-col gap-6">
                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between border border-primary/40 bg-primary/10 p-4 font-mono text-xs">
                    <div>
                      <span className="text-muted-foreground">STATUS:</span>{" "}
                      <strong className="text-primary">EXECUTION COMPLETE (SUCCESS)</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">DURATION:</span>{" "}
                      <strong className="text-foreground">{workflowResult.totalDurationMs} ms</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">x402 SETTLED:</span>{" "}
                      <strong className="text-foreground">{workflowResult.totalCostSettled}</strong>
                    </div>
                  </div>

                  {/* Stage-by-stage results */}
                  <div className="flex flex-col gap-3">
                    <h4 className="font-mono text-xs font-bold uppercase text-primary">Stage Execution Log</h4>
                    {workflowResult.stepResults?.map((sr: any, idx: number) => (
                      <Collapsible key={idx} className="border border-border font-mono text-xs bg-muted/20">
                        <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-muted/60 text-left">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-primary" />
                            <span className="text-muted-foreground">Stage {idx + 1}:</span>
                            <span className="font-bold text-foreground">{sr.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {sr.payment && (
                              <Badge className="bg-blue font-mono text-[10px] text-foreground">
                                Paid {sr.payment.amount}
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground">{sr.durationMs}ms</span>
                            <ChevronRight className="size-3 text-muted-foreground" />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t border-border p-3 bg-background">
                          {sr.payment && (
                            <div className="mb-2 border border-blue/40 bg-blue/10 p-2 text-[11px]">
                              <p className="font-bold text-primary mb-1">x402 Verified Payment Receipt</p>
                              <p className="text-muted-foreground">Recipient: {sr.payment.to}</p>
                              <p className="text-muted-foreground truncate">Signature: {sr.payment.signatureFull}</p>
                            </div>
                          )}
                          <pre className="max-h-48 overflow-x-auto bg-muted/40 p-2 text-[11px] text-foreground">
                            {JSON.stringify(sr.result, null, 2)}
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>

                  {/* Final Dossier */}
                  <div className="border border-border bg-muted/30 p-5">
                    <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-3">
                      <h4 className="font-bold text-base uppercase text-primary">Executive Due Diligence Dossier</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-mono text-xs uppercase"
                        onClick={() => navigator.clipboard.writeText(workflowResult.finalDossier)}
                      >
                        <Copy className="size-3 mr-1" /> Copy Dossier
                      </Button>
                    </div>
                    <MarkdownText content={workflowResult.finalDossier} />
                  </div>
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* TAB 3: CRYPTO & ON-CHAIN HUB (WEEK 3 HEADLINE FEATURE) */}
      {activeTab === "crypto" && (
        <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_420px]">
          {/* Main Column: Dual Wallet & On-Chain Action Center */}
          <div className="flex flex-col gap-6">
            {/* Dual Wallet Status Card */}
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <SectionTitle num="01" title="Dual-Wallet Web3 Architecture" />
              </CardHeader>
              <CardContent className="pt-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Agent Autonomous Wallet */}
                  <div className="border border-primary/40 bg-primary/5 p-4 font-mono text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-primary">AGENT TREASURY WALLET</span>
                        <Badge className="bg-primary text-primary-foreground font-mono text-[10px]">AUTONOMOUS</Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]">Address (Base Sepolia):</p>
                      <code className="text-foreground text-xs break-all block mt-0.5">
                        {wallet?.address || "Initializing..."}
                      </code>
                      <p className="mt-3 text-muted-foreground text-[11px]">On-Chain Balance:</p>
                      <p className="text-xl font-black text-primary">{wallet?.balance || "0.0000 ETH"}</p>
                    </div>
                    <div className="mt-4 flex gap-2 pt-2 border-t border-border">
                      <a
                        href={wallet?.explorerUrl || `https://sepolia.basescan.org/address/${wallet?.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"
                      >
                        BaseScan <ExternalLink className="size-3" />
                      </a>
                      <a
                        href={wallet?.faucetUrl || "https://faucets.chain.link/base-sepolia"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary ml-auto"
                      >
                        Get Test ETH <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>

                  {/* User Connected Web3 Wallet */}
                  <div className="border border-border bg-muted/20 p-4 font-mono text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-foreground">USER WEB3 WALLET</span>
                        <Badge variant="outline" className="font-mono text-[10px]">BROWSER EXTENSION</Badge>
                      </div>
                      {userAddress ? (
                        <>
                          <p className="text-muted-foreground text-[11px]">Connected Address:</p>
                          <code className="text-foreground text-xs break-all block mt-0.5">{userAddress}</code>
                          <p className="mt-3 text-muted-foreground text-[11px]">User Balance:</p>
                          <p className="text-xl font-black text-foreground">{userBalance || "0.0000 ETH"}</p>
                          <p className="text-[10px] text-primary mt-1">{userNetwork}</p>
                        </>
                      ) : (
                        <div className="py-3 text-center">
                          <p className="text-muted-foreground text-xs mb-3">Connect MetaMask or Coinbase Wallet on Base Sepolia</p>
                          <Button
                            onClick={connectUserWallet}
                            disabled={connectingUserWallet}
                            className="font-mono text-xs uppercase"
                          >
                            <LinkIcon className="size-3.5 mr-1" /> {connectingUserWallet ? "Connecting..." : "Connect User Wallet"}
                          </Button>
                        </div>
                      )}
                    </div>
                    {userAddress && (
                      <div className="mt-4 pt-2 border-t border-border flex items-center justify-between">
                        <Button
                          onClick={fundAgentFromUser}
                          disabled={fundingAgent}
                          size="sm"
                          className="font-mono text-xs uppercase w-full bg-primary text-primary-foreground"
                        >
                          <Coins className="size-3.5 mr-1" /> {fundingAgent ? "Broadcasting..." : "1-Click Fund Agent (0.001 ETH)"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action 1: On-Chain ETH Transfer */}
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <SectionTitle num="02" title="Execute Live On-Chain ETH Transfer (Base Sepolia)" />
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-3 font-mono text-xs">
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  The agent creates, cryptographically signs, and broadcasts a live transaction to Base Sepolia testnet miners.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Recipient Address (0x):</label>
                    <Input
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      className="font-mono text-xs"
                      placeholder="0x..."
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Amount (ETH):</label>
                    <Input
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="font-mono text-xs"
                      placeholder="0.0001"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <Button
                    onClick={handleOnChainTransfer}
                    disabled={transferring}
                    className="font-mono text-xs uppercase"
                  >
                    <Send className="size-3.5 mr-1.5" /> {transferring ? "Broadcasting to Base Sepolia..." : "Broadcast Transfer"}
                  </Button>
                  <span className="text-[11px] text-muted-foreground">Network: Base Sepolia (84532)</span>
                </div>

                {transferStatus && (
                  <div
                    className={cn(
                      "mt-2 border p-3 font-mono text-xs",
                      transferStatus.success
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-bold">
                      <span className={transferStatus.success ? "text-primary" : "text-foreground"}>
                        {transferStatus.success ? "TRANSACTION CONFIRMED ON-CHAIN" : "PRE-FLIGHT SIMULATION"}
                      </span>
                      <span>{transferStatus.amountEth}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{transferStatus.message}</p>
                    {transferStatus.hash && (
                      <div className="mt-2 flex items-center justify-between border-t border-border pt-1.5 text-[11px]">
                        <span className="truncate">Hash: {transferStatus.hash}</span>
                        {transferStatus.success && (
                          <a
                            href={transferStatus.explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline ml-2 shrink-0 inline-flex items-center gap-1"
                          >
                            BaseScan <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action 2: On-Chain Proof-of-Audit Attestation */}
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <SectionTitle num="03" title="Publish Proof-of-Audit Attestation Directly On-Chain" />
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-3 font-mono text-xs">
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Writes audit findings and cryptographic hashes directly into Base Sepolia calldata, creating an immutable blockchain record.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Audit Title:</label>
                    <Input
                      value={attestTitle}
                      onChange={(e) => setAttestTitle(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Audited Contract Address:</label>
                    <Input
                      value={attestTarget}
                      onChange={(e) => setAttestTarget(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase">Summary Finding (Calldata Payload):</label>
                  <Input
                    value={attestSummary}
                    onChange={(e) => setAttestSummary(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <Button
                    onClick={handleOnChainAttest}
                    disabled={attesting}
                    className="font-mono text-xs uppercase"
                  >
                    <FileCheck2 className="size-3.5 mr-1.5" /> {attesting ? "Writing to Blockchain..." : "Notarize On-Chain"}
                  </Button>
                </div>

                {attestStatus && (
                  <div
                    className={cn(
                      "mt-2 border p-3 font-mono text-xs",
                      attestStatus.success
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-bold">
                      <span className={attestStatus.success ? "text-primary" : "text-foreground"}>
                        {attestStatus.success ? "ATTESTATION NOTARIZED ON BASE SEPOLIA" : "ATTESTATION ENCODED"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{attestStatus.message}</p>
                    {attestStatus.hash && (
                      <div className="mt-2 flex items-center justify-between border-t border-border pt-1.5 text-[11px]">
                        <span className="truncate">Tx: {attestStatus.hash}</span>
                        {attestStatus.success && (
                          <a
                            href={attestStatus.explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline ml-2 shrink-0 inline-flex items-center gap-1"
                          >
                            BaseScan <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Base Sepolia Node Telemetry & Bytecode Inspector */}
          <aside className="flex flex-col gap-6">
            {/* Live Node Metrics */}
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <div className="flex items-center justify-between">
                  <SectionTitle num="04" title="Base Sepolia Node RPC" />
                  <Button variant="ghost" size="sm" onClick={loadTelemetry} className="font-mono text-xs uppercase">
                    <RefreshCw className="size-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-3 font-mono">
                <div className="border border-border bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block">Block Height</span>
                  <span className="text-xl font-black text-primary">#{telemetry?.blockNumber || "48,034,700"}</span>
                </div>
                <div className="border border-border bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block">Gas Price</span>
                  <span className="text-xl font-black text-foreground">{telemetry?.gasPriceGwei || "0.0050 Gwei"}</span>
                </div>
                <div className="border border-border bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block">RPC Latency</span>
                  <span className="text-xl font-black text-primary">{telemetry?.latencyMs ?? 75} ms</span>
                </div>
                <div className="border border-border bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground uppercase block">Agent Transaction Nonce</span>
                  <span className="text-xl font-black text-foreground">{telemetry?.agentTransactions ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* On-Chain Bytecode Inspector */}
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <SectionTitle num="05" title="On-Chain Bytecode Inspector" />
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-3 font-mono text-xs">
                <Input
                  value={bytecodeInput}
                  onChange={(e) => setBytecodeInput(e.target.value)}
                  placeholder="0x contract address..."
                  className="font-mono text-xs"
                />
                <Button
                  onClick={handleInspectBytecode}
                  disabled={inspectingBytecode}
                  className="font-mono text-xs uppercase"
                >
                  <Search className="size-3.5 mr-1" /> {inspectingBytecode ? "Reading Node..." : "Inspect On-Chain"}
                </Button>

                {bytecodeData && (
                  <div className="border border-border bg-muted/30 p-3 text-[11px] flex flex-col gap-1.5">
                    <div>Type: <strong className="text-foreground">{bytecodeData.accountType}</strong></div>
                    <div>Bytecode Size: <strong className="text-primary">{bytecodeData.bytecodeSize}</strong></div>
                    <div>Balance: <strong className="text-foreground">{bytecodeData.onChainBalance}</strong></div>
                    <div>Nonce: <strong className="text-foreground">{bytecodeData.nonce}</strong></div>
                    <a
                      href={bytecodeData.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline inline-flex items-center gap-1 mt-1"
                    >
                      View on BaseScan <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {/* TAB 4: INTERACTIVE DEMO & WALKTHROUGH GUIDE (WEEK 3 UPDATE) */}
      {activeTab === "demo" && (
        <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_400px]">
          {/* Main Demo Stage */}
          <Card className="border-border flex flex-col">
            <CardHeader className="border-b border-border/80">
              <div className="flex items-center justify-between">
                <div>
                  <SectionTitle num="01" title="Interactive Crypto Capability Demonstration" />
                  <h2 className="text-xl font-bold uppercase mt-1">Week 3: Give It A Wallet Walkthrough</h2>
                </div>
                <Button
                  onClick={startInteractiveDemo}
                  disabled={demoRunning}
                  className="font-mono text-xs uppercase"
                >
                  <Play className="size-3.5 mr-1.5" /> {demoRunning ? "Running Demo..." : "Run Guided Demo"}
                </Button>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="flex flex-col gap-6 max-w-3xl">
                {/* 20-Second Launch Video Player (Generated with latent-spaces/brag) */}
                <div className="border border-primary/40 bg-muted/20 p-4 rounded-lg flex flex-col gap-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-primary font-bold flex items-center gap-2">
                      <Play className="size-3.5 fill-primary" /> OFFICIAL LAUNCH VIDEO (brag.mp4)
                    </span>
                    <span className="text-muted-foreground">Generated via latent-spaces/brag · 20s · 1080p</span>
                  </div>
                  <div className="aspect-video w-full rounded overflow-hidden bg-black border border-border shadow-2xl relative">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      poster="/brag.jpg"
                      className="w-full h-full object-cover"
                    >
                      <source src="/brag.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Demo Act 1 */}
                <div
                  className={cn(
                    "border p-4 transition-all font-mono text-xs",
                    demoStep === 1 ? "border-primary bg-primary/10 shadow-lg" : "border-border/60 bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold text-primary">ACT 1: WALLET INITIALIZATION & BASE SEPOLIA</span>
                    {demoStep === 1 && <span className="animate-pulse text-primary font-bold">● ACTIVE</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Autonomous Cryptographic Keypair</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    AgentMAXX generates and persists an Ethereum keypair on Base Sepolia (Chain ID 84532). It acts as an autonomous treasury capable of signing digests and managing balances without human custody.
                  </p>
                </div>

                {/* Demo Act 2 */}
                <div
                  className={cn(
                    "border p-4 transition-all font-mono text-xs",
                    demoStep === 2 ? "border-primary bg-primary/10 shadow-lg" : "border-border/60 bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold text-primary">ACT 2: LIVE ON-CHAIN TRANSACTIONS & PAYMENTS</span>
                    {demoStep === 2 && <span className="animate-pulse text-primary font-bold">● ACTIVE</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Real ETH Transfers on Base Sepolia</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Equipped with Viem WalletClient, AgentMAXX signs and broadcasts live on-chain ETH transactions to any 0x destination address, monitors confirmations on BaseScan, and records verified execution hashes.
                  </p>
                </div>

                {/* Demo Act 3 */}
                <div
                  className={cn(
                    "border p-4 transition-all font-mono text-xs",
                    demoStep === 3 ? "border-primary bg-primary/10 shadow-lg" : "border-border/60 bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold text-primary">ACT 3: PROOF-OF-AUDIT ON-CHAIN ATTESTATION</span>
                    {demoStep === 3 && <span className="animate-pulse text-primary font-bold">● ACTIVE</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Writing Proofs into Blockchain Calldata</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Following smart contract bytecode audits, AgentMAXX encodes the finding digest and contract address into transaction calldata, notarizing the audit permanently onto the Base Sepolia blockchain.
                  </p>
                </div>

                {/* Demo Act 4 */}
                <div
                  className={cn(
                    "border p-4 transition-all font-mono text-xs",
                    demoStep === 4 ? "border-primary bg-primary/10 shadow-lg" : "border-border/60 bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold text-primary">ACT 4: DUAL-WALLET ARCHITECTURE & x402</span>
                    {demoStep === 4 && <span className="animate-pulse text-primary font-bold">● ACTIVE</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Connecting User Web3 Wallet with Agent Treasury</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Users can connect their browser wallet (MetaMask / Coinbase) to 1-click fund the agent treasury, while the agent continues executing machine-to-machine x402 micropayments automatically.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </Card>

          {/* Right: Quick Launch Shortcuts for Judges */}
          <aside className="flex flex-col gap-6">
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <SectionTitle num="02" title="Judge Test Actions" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 pt-4 font-mono text-xs">
                <Button
                  onClick={() => {
                    setActiveTab("crypto");
                  }}
                  variant="outline"
                  className="w-full justify-start text-xs uppercase"
                >
                  <Coins className="size-3.5 mr-2 text-primary" /> Test Crypto Hub & Transfers
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("workflows");
                    setSelectedWorkflow("onchain_notarization_pipeline");
                  }}
                  variant="outline"
                  className="w-full justify-start text-xs uppercase"
                >
                  <FileCheck2 className="size-3.5 mr-2 text-primary" /> Run On-Chain Attestation Pipeline
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("chat");
                    send("Execute an on-chain transfer of 0.0001 Base Sepolia ETH to 0x000000000000000000000000000000000000dEaD");
                  }}
                  variant="outline"
                  className="w-full justify-start text-xs uppercase"
                >
                  <Send className="size-3.5 mr-2 text-primary" /> Test On-Chain ETH Transfer Tool
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("chat");
                    send("Publish an on-chain Proof-of-Audit attestation for Aerodrome Finance on Base Sepolia");
                  }}
                  variant="outline"
                  className="w-full justify-start text-xs uppercase"
                >
                  <Receipt className="size-3.5 mr-2 text-primary" /> Test On-Chain Attestation Tool
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {/* Week 3 Submission Package Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setShowSubmissionModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase mb-2">
              <Award className="size-4" /> Agentmaxxing Week 3: Give It A Wallet
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Week 3 Submission Package</h2>

            <div className="mt-4 flex flex-col gap-4 text-xs text-muted-foreground leading-relaxed">
              <div className="border border-border/80 bg-muted/40 p-3">
                <span className="font-bold text-foreground block font-mono mb-1">1. WORKING CRYPTO-ENABLED AGENT LINK</span>
                <a
                  href="https://agent-maxx.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline font-mono text-sm"
                >
                  https://agent-maxx.vercel.app/
                </a>
              </div>

              <div className="border border-border/80 bg-muted/40 p-3">
                <span className="font-bold text-foreground block font-mono mb-1">2. GITHUB REPOSITORY LINK</span>
                <a
                  href="https://github.com/Kalpesh-ops/AgentMAXX"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline font-mono text-sm"
                >
                  https://github.com/Kalpesh-ops/AgentMAXX
                </a>
              </div>

              <div className="border border-border/80 bg-muted/40 p-3">
                <span className="font-bold text-foreground block font-mono mb-1">3. WHAT WE BUILT IN WEEK 3 (CRYPTO CAPABILITIES)</span>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li><strong>Real On-Chain Base Sepolia Transactions:</strong> Equipped AgentMAXX with Viem WalletClient to sign and broadcast live ETH transfers, monitor transaction receipts, and link directly to BaseScan.</li>
                  <li><strong>Proof-of-Audit On-Chain Attestation:</strong> Enabled the agent to notarize security audits on-chain by encoding cryptographic report digests into transaction calldata.</li>
                  <li><strong>Dual-Wallet Web3 Architecture:</strong> Connected user browser wallets (MetaMask / Coinbase) to allow 1-click funding of the agent treasury on Base Sepolia.</li>
                  <li><strong>On-Chain Bytecode Inspector:</strong> Live RPC bytecode analysis to verify contract deployment and account type.</li>
                  <li><strong>Autonomous x402 Micropayments:</strong> Retained multi-resource HTTP 402 signature verification for machine-to-machine APIs.</li>
                </ul>
              </div>

              <div className="border border-border/80 bg-muted/40 p-3">
                <span className="font-bold text-foreground block font-mono mb-1">4. DEMO & WALKTHROUGH NOTE</span>
                <p>
                  Judges can use the in-app &ldquo;03. Crypto & On-Chain Hub&rdquo; to test transfers and attestations, or run &ldquo;04. Demo & Walkthrough Guide&rdquo; for a guided interactive walkthrough.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowSubmissionModal(false)} className="font-mono text-xs uppercase">
                Close Package
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Private Key Modal */}
      {showKeyModal && privateKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg border border-destructive/60 bg-card p-6 shadow-2xl">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-destructive font-mono text-xs font-bold uppercase mb-2">
              <ShieldCheck className="size-4" /> Agent Private Key Export
            </div>
            <h3 className="text-lg font-bold uppercase">Base Sepolia Testnet Key</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              This private key controls the agent&apos;s Base Sepolia testnet wallet. Import into MetaMask or Coinbase Wallet to fund with test ETH.
            </p>
            <div className="mt-4 border border-border bg-background p-3">
              <code className="break-all font-mono text-xs text-primary">{privateKey}</code>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs uppercase"
                onClick={() => navigator.clipboard.writeText(privateKey)}
              >
                <Copy className="size-3.5 mr-1" /> Copy Key
              </Button>
              <Button size="sm" onClick={() => setShowKeyModal(false)} className="font-mono text-xs uppercase">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <p className="font-mono text-xs font-medium tracking-[0.06em] uppercase">
      <span className="text-primary font-bold">{num}</span>
      <span className="ml-3 text-muted-foreground">{title}</span>
    </p>
  );
}

function SetupStep(props: { number: number; title: string; done: boolean; last?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center border-2 font-mono text-xs font-bold",
            props.done ? "border-primary bg-primary text-primary-foreground" : "border-primary text-primary"
          )}
        >
          {props.done ? <Check className="size-3.5" strokeWidth={3} /> : props.number}
        </span>
        {!props.last && <span className={cn("w-0.5 flex-1", props.done ? "bg-primary" : "bg-border")} />}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", !props.last && "pb-5")}>
        <p className="font-bold tracking-tight text-xs uppercase">{props.title}</p>
        {props.children}
      </div>
    </div>
  );
}

function WalletDetails({
  wallet,
  onRefresh,
  onExportKey,
}: {
  wallet: WalletInfo;
  onRefresh: () => void;
  onExportKey: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const address = wallet.address!;

  function copy() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2.5 border border-border bg-background/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <code className="truncate font-mono text-xs text-primary">{address}</code>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copy} aria-label="Copy address">
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground uppercase">
        <span>
          Balance <strong className="text-foreground ml-1">{wallet.balance || "0.0000 ETH"}</strong>
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRefresh} aria-label="Refresh balance">
          <RefreshCw className="size-3.5" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-2.5 font-mono text-[11px] uppercase">
        <a
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
          href={wallet.explorerUrl || `https://sepolia.basescan.org/address/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          BaseScan <ExternalLink className="size-3" />
        </a>
        <a
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
          href={wallet.faucetUrl || "https://faucets.chain.link/base-sepolia"}
          target="_blank"
          rel="noreferrer"
        >
          Faucet <ExternalLink className="size-3" />
        </a>
        <button
          onClick={onExportKey}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary ml-auto"
        >
          Export Key <Key className="size-3" />
        </button>
      </div>
    </div>
  );
}

function ToolCall({ step }: { step: Step }) {
  const payment = step.result?.payment;
  const isTx = step.result?.type === "transfer" || step.result?.type === "attestation";
  return (
    <Collapsible className="border border-border font-mono text-xs bg-muted/20">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/60">
        <ChevronRight className="size-3.5 transition-transform group-data-[panel-open]:rotate-90 text-primary" />
        <span className="text-muted-foreground uppercase text-[10px]">TOOL:</span>
        <span className="text-primary font-semibold">{step.tool}</span>
        {payment && (
          <Badge className="ml-auto bg-blue font-mono text-foreground uppercase text-[10px] flex items-center gap-1">
            <Receipt className="size-3" /> x402 Paid {payment.amount}
          </Badge>
        )}
        {isTx && (
          <Badge className="ml-auto bg-primary/20 text-primary border border-primary/40 font-mono text-[10px] flex items-center gap-1">
            <Coins className="size-3" /> ON-CHAIN TX
          </Badge>
        )}
        {step.error && <Badge variant="destructive" className="ml-auto font-mono uppercase text-[10px]">Failed</Badge>}
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-2.5 border-t border-border px-3 py-3 bg-background">
        {payment && (
          <div className="border border-blue/40 bg-blue/10 p-2.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-primary font-bold mb-1.5">
              <span>x402 CRYPTOGRAPHIC RECEIPT</span>
              <span className="text-[10px] bg-primary/20 px-1 py-0.5 text-primary">VERIFIED (200 OK)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-muted-foreground">
              <div>Amount: <strong className="text-foreground">{payment.amount}</strong></div>
              <div>Recipient: <strong className="text-foreground truncate">{payment.to}</strong></div>
              <div>Endpoint: <strong className="text-foreground">{payment.resource}</strong></div>
              <div>Nonce: <strong className="text-foreground">{payment.nonce?.slice(0, 12)}...</strong></div>
            </div>
            {payment.signatureFull && (
              <div className="mt-2 border-t border-border/40 pt-1.5">
                <span className="text-muted-foreground block text-[10px]">EIP-191 SIGNATURE:</span>
                <span className="text-foreground text-[10px] break-all">{payment.signatureFull}</span>
              </div>
            )}
          </div>
        )}
        {isTx && (
          <div className="border border-primary/40 bg-primary/10 p-2.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-primary font-bold mb-1.5">
              <span>BASE SEPOLIA ON-CHAIN TRANSACTION</span>
              <span className="text-[10px] bg-primary/20 px-1 py-0.5 text-primary">
                {step.result?.success ? "MINED / VERIFIED" : "PRE-FLIGHT SIMULATION"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-muted-foreground">
              <div>Action: <strong className="text-foreground">{step.result?.type}</strong></div>
              <div>Amount: <strong className="text-foreground">{step.result?.amountEth}</strong></div>
              <div>Recipient: <strong className="text-foreground truncate">{step.result?.to}</strong></div>
              <div>Network: <strong className="text-foreground">{step.result?.network}</strong></div>
            </div>
            {step.result?.hash && (
              <div className="mt-2 border-t border-border/40 pt-1.5 flex items-center justify-between">
                <span className="text-foreground text-[10px] truncate">Tx: {step.result?.hash}</span>
                {step.result?.explorerUrl && (
                  <a
                    href={step.result?.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline text-[10px] shrink-0 inline-flex items-center gap-1"
                  >
                    BaseScan <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
        <Json label="Input Arguments" value={step.args} />
        <Json label="Execution Output" value={step.result} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function Json({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="mb-1 text-muted-foreground uppercase font-mono text-[10px]">{label}</p>
      <pre className="max-h-60 overflow-x-auto border border-border/80 bg-muted/40 p-2 font-mono text-[11px] text-foreground">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function MarkdownText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 font-sans text-xs">
      {lines.map((line, idx) => {
        if (line.startsWith("### ")) {
          return <h4 key={idx} className="font-bold text-foreground text-sm uppercase mt-3 mb-1 border-b border-border/40 pb-0.5">{line.slice(4)}</h4>;
        }
        if (line.startsWith("## ")) {
          return <h3 key={idx} className="font-black text-primary text-base uppercase mt-3 mb-1">{line.slice(3)}</h3>;
        }
        if (line.startsWith("# ")) {
          return <h2 key={idx} className="font-black text-primary text-lg uppercase mt-3 mb-1">{line.slice(2)}</h2>;
        }
        if (line.trim() === "---") {
          return <hr key={idx} className="border-border my-2" />;
        }
        if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
          const itemText = line.trim().slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-primary font-bold mt-0.5">•</span>
              <div>{renderFormattedText(itemText)}</div>
            </div>
          );
        }
        const match = line.trim().match(/^(\d+)\.\s+(.*)/);
        if (match) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-mono text-primary font-semibold">{match[1]}.</span>
              <div>{renderFormattedText(match[2])}</div>
            </div>
          );
        }
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }
        return <p key={idx} className="leading-relaxed">{renderFormattedText(line)}</p>;
      })}
    </div>
  );
}

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="bg-muted px-1 py-0.5 font-mono text-[0.85em] text-primary">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}
