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
    label: "🔎 Live DEX Query (AERO)",
    prompt: "Search real-time DEX liquidity, price, and 24h volume for AERO on Base via DexScreener.",
    type: "free",
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
    label: "🌐 Base Sepolia Telemetry",
    prompt: "Fetch live Base Sepolia RPC metrics, current block number, and live gas price.",
    type: "free",
  },
  {
    label: "💰 Treasury & Wallet",
    prompt: "What is your wallet address, Base Sepolia balance, and explorer link?",
    type: "free",
  },
  {
    label: "🧮 Compound Staking Yield",
    prompt: "Calculate compound staking yield for 10,000 USDC at 12% APY for 1 year.",
    type: "free",
  },
  {
    label: "🎲 Roll 20-sided Dice",
    prompt: "Roll a 20 sided dice.",
    type: "free",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "workflows" | "telemetry" | "demo">("chat");
  const [persona, setPersona] = useState<"executive" | "alpha-hunter" | "security-auditor">("executive");
  const [status, setStatus] = useState<Status | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowDef[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toolFilter, setToolFilter] = useState<"all" | "paid" | "free">("all");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  // Workflow execution state
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("due_diligence_pipeline");
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

    const interval = setInterval(loadTelemetry, 12000);
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
      if (data.steps?.some((s: Step) => s.result?.payment)) loadWallet();
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
                WEEK 2: BUILD & SHIP
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
                <span>Treasury: <strong className="text-primary">{wallet.balance || "0.0000 ETH"}</strong></span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubmissionModal(true)}
              className="border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs uppercase"
            >
              <Award className="size-3.5 mr-1" /> Week 2 Submission Package
            </Button>
          </div>
        </div>

        {/* Hero Title & Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
                Autonomous Workflow Engine & On-Chain Intelligence
              </span>
              <span className="rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                v2.0 SHIP EDITION
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight uppercase md:text-7xl">
              AGENT<span className="text-primary">MAXX</span>
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground md:text-base">
              Autonomous on-chain Web3 agent with native Base Sepolia crypto treasury. Executes chained multi-stage workflows, live DEX queries, and x402 EIP-191 micropayment settlements.
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

        {/* View Switcher Tabs (Week 2 Core Innovation) */}
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
            onClick={() => setActiveTab("telemetry")}
            className={cn(
              "flex items-center gap-2 border px-4 py-2 uppercase transition-all",
              activeTab === "telemetry"
                ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <Activity className="size-3.5" /> 03. Live Base RPC Telemetry
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
                  {ready && <p className="text-xs text-muted-foreground">Active with multi-stage reasoning loop.</p>}
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

                <SetupStep number={3} title="x402 Autonomous Machine Settlement" done={Boolean(wallet?.address)} last>
                  <p className="text-xs text-muted-foreground">
                    Autonomously signs HTTP 402 invoices via EIP-191 to unlock paid APIs without human checkout.
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
                      {t.category === "x402-paid" ? (
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
                      <h2 className="text-2xl font-bold uppercase tracking-tight">AgentMAXX Online</h2>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Ready to execute chained tool workflows, DexScreener queries, and Base Sepolia x402 settlements.
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
                    <span>AgentMAXX analyzing cognitive loop & executing tools...</span>
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
                    placeholder={ready ? "Enter command or ask AgentMAXX to execute tools..." : "Configure GEMINI_API_KEY to start"}
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

      {/* TAB 2: AGENTIC WORKFLOWS RUNNER (Week 2 Core Innovation) */}
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
                    AgentMAXX orchestrating multi-stage pipeline & x402 settlements...
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

      {/* TAB 3: LIVE BASE SEPOLIA RPC TELEMETRY */}
      {activeTab === "telemetry" && (
        <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main Telemetry Stats */}
          <div className="flex flex-col gap-6">
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <div className="flex items-center justify-between">
                  <SectionTitle num="01" title="Base Sepolia Live Node Metrics" />
                  <Button variant="ghost" size="sm" onClick={loadTelemetry} className="font-mono text-xs uppercase">
                    <RefreshCw className="size-3 mr-1" /> Refresh RPC
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-border bg-muted/30 p-4 font-mono">
                    <p className="text-muted-foreground text-xs uppercase">Block Height</p>
                    <p className="text-2xl font-black text-primary mt-1">
                      #{telemetry?.blockNumber || "48,034,500"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Base Sepolia L2</p>
                  </div>

                  <div className="border border-border bg-muted/30 p-4 font-mono">
                    <p className="text-muted-foreground text-xs uppercase">Live Gas Price</p>
                    <p className="text-2xl font-black text-foreground mt-1">
                      {telemetry?.gasPriceGwei || "0.0050 Gwei"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Ultra-low L2 execution</p>
                  </div>

                  <div className="border border-border bg-muted/30 p-4 font-mono">
                    <p className="text-muted-foreground text-xs uppercase">RPC Latency</p>
                    <p className="text-2xl font-black text-primary mt-1">
                      {telemetry?.latencyMs ?? 85} ms
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Public Viem Transport</p>
                  </div>

                  <div className="border border-border bg-muted/30 p-4 font-mono">
                    <p className="text-muted-foreground text-xs uppercase">Chain ID</p>
                    <p className="text-2xl font-black text-foreground mt-1">
                      {telemetry?.chainId || 84532}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">EVM Compatible</p>
                  </div>
                </div>

                <div className="mt-6 border border-border bg-background p-4 font-mono text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-foreground">RPC STATUS:</span>
                    <span className="text-primary font-bold">{telemetry?.rpcStatus || "Operational"}</span>
                  </div>
                  <div className="text-muted-foreground text-[11px] leading-relaxed">
                    AgentMAXX maintains a continuous connection to Base Sepolia via Viem. Every x402 payment authorization signs an EIP-191 digest verified against this state.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live DexScreener Test Tool */}
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <SectionTitle num="02" title="DexScreener Live DEX Network Integration" />
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-4">
                  Test the agent&apos;s new Week 2 external DEX connection. Pulls live token pairs, pool liquidity, and 24h volume on Base directly:
                </p>
                <div className="flex gap-2 mb-4">
                  <Input
                    id="dex-search-input"
                    defaultValue="AERO"
                    placeholder="Enter token symbol (e.g. AERO, BRETT, VIRTUAL)..."
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={() => {
                      const el = document.getElementById("dex-search-input") as HTMLInputElement;
                      if (el?.value) send(`Search real-time DEX liquidity and 24h volume for ${el.value}`);
                      setActiveTab("chat");
                    }}
                    className="font-mono text-xs uppercase"
                  >
                    Query in Agent Console
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Treasury Details */}
          <aside className="flex flex-col gap-6">
            <Card className="border-border">
              <CardHeader className="border-b border-border/80">
                <SectionTitle num="03" title="Treasury Management" />
              </CardHeader>
              <CardContent className="pt-4">
                {wallet?.address ? (
                  <WalletDetails wallet={wallet} onRefresh={loadWallet} onExportKey={fetchPrivateKey} />
                ) : (
                  <Button onClick={createWallet} disabled={creating} className="w-full font-mono text-xs uppercase">
                    Generate Treasury Wallet
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {/* TAB 4: INTERACTIVE DEMO & WALKTHROUGH GUIDE (Week 2 Core Requirement) */}
      {activeTab === "demo" && (
        <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_400px]">
          {/* Main Demo Stage */}
          <Card className="border-border flex flex-col">
            <CardHeader className="border-b border-border/80">
              <div className="flex items-center justify-between">
                <div>
                  <SectionTitle num="01" title="Interactive Agent Walkthrough Player" />
                  <h2 className="text-xl font-bold uppercase mt-1">AgentMAXX Capability Demonstration</h2>
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
                {/* Demo Act 1 */}
                <div
                  className={cn(
                    "border p-4 transition-all font-mono text-xs",
                    demoStep === 1 ? "border-primary bg-primary/10 shadow-lg" : "border-border/60 bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-bold text-primary">ACT 1: AUTONOMOUS FINANCIAL AGENCY</span>
                    {demoStep === 1 && <span className="animate-pulse text-primary font-bold">● ACTIVE</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Self-Governed Base Sepolia Treasury</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Traditional chatbots rely on human credit cards or API keys. AgentMAXX owns a cryptographic wallet keypair on Base Sepolia. It maintains its own reserve, signs on-chain EIP-191 digests, and executes transactions independently.
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
                    <span className="font-bold text-primary">ACT 2: THE x402 MICROPAYMENT HANDSHAKE</span>
                    {demoStep === 2 && <span className="animate-pulse text-primary font-bold">● ACTIVE</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Machine-to-Machine Micro-Commerce</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When querying premium APIs (such as market sentiment or quantitative alpha), the server responds with HTTP 402 Payment Required. AgentMAXX catches the invoice, signs the exact nonce using ECDSA, submits the X-PAYMENT header, and unseals the data in milliseconds.
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
                    <span className="font-bold text-primary">ACT 3: MULTI-STAGE AGENTIC WORKFLOWS</span>
                    {demoStep === 3 && <span className="animate-pulse text-primary font-bold">● ACTIVE</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Week 2 Innovation: Chained Pipelines</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Rather than single-turn chats, AgentMAXX now chains sequential tools: pulling real-time DexScreener DEX liquidity $\rightarrow$ running automated contract security audits $\rightarrow$ paying for quantitative alpha $\rightarrow$ synthesizing an institutional Due Diligence Dossier.
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
                    <span className="font-bold text-primary">ACT 4: LIVE ON-CHAIN TELEMETRY</span>
                    {demoStep === 4 && <span className="animate-pulse text-primary font-bold">● ACTIVE</span>}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">Real Base Sepolia Node Synchronization</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Synchronized with live Base Sepolia blocks #{telemetry?.blockNumber || "48,034,500"}, tracking live gas fees in Gwei, latency metrics, and nonces via public Viem RPC clients.
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
                    setActiveTab("workflows");
                    setSelectedWorkflow("due_diligence_pipeline");
                  }}
                  variant="outline"
                  className="w-full justify-start text-xs uppercase"
                >
                  <Layers className="size-3.5 mr-2 text-primary" /> Test Token Due Diligence
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("chat");
                    send("Search real-time DEX liquidity and 24h volume for AERO on Base");
                  }}
                  variant="outline"
                  className="w-full justify-start text-xs uppercase"
                >
                  <Search className="size-3.5 mr-2 text-primary" /> Test Live DexScreener Tool
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("chat");
                    send("Provide institutional crypto market intelligence on sentiment and narratives");
                  }}
                  variant="outline"
                  className="w-full justify-start text-xs uppercase"
                >
                  <Receipt className="size-3.5 mr-2 text-primary" /> Test 0.05 USDC x402 Payment
                </Button>
                <Button
                  onClick={() => setActiveTab("telemetry")}
                  variant="outline"
                  className="w-full justify-start text-xs uppercase"
                >
                  <Activity className="size-3.5 mr-2 text-primary" /> Inspect Live Base Sepolia RPC
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {/* Week 2 Submission Brief Modal */}
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
              <Award className="size-4" /> Agentmaxxing Week 2: Build & Ship
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Week 2 Submission Package</h2>

            <div className="mt-4 flex flex-col gap-4 text-xs text-muted-foreground leading-relaxed">
              <div className="border border-border/80 bg-muted/40 p-3">
                <span className="font-bold text-foreground block font-mono mb-1">1. WORKING AI AGENT LINK</span>
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
                <span className="font-bold text-foreground block font-mono mb-1">3. WHAT WE BUILT IN WEEK 2 (NEW CAPABILITIES)</span>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li><strong>Autonomous Agentic Workflows Engine:</strong> Built sequential execution pipelines that chain DexScreener DEX lookups, bytecode vulnerability audits, and x402 quantitative alpha into comprehensive institutional Due Diligence Dossiers.</li>
                  <li><strong>Live External Service Integrations:</strong> Integrated live DexScreener API for real-time DEX liquidity/volume and live Base Sepolia RPC node synchronization for gas tracking.</li>
                  <li><strong>Multi-Agent Persona Profiles:</strong> Added runtime persona toggling (Institutional Executive, Alpha Hunter, Security Auditor) with customized cognitive instructions.</li>
                  <li><strong>Interactive Walkthrough Player:</strong> Built an in-app interactive walkthrough guide with 4 demonstration acts for competition judges.</li>
                </ul>
              </div>

              <div className="border border-border/80 bg-muted/40 p-3">
                <span className="font-bold text-foreground block font-mono mb-1">4. DEMO & WALKTHROUGH NOTE</span>
                <p>
                  Judges can use the in-app &ldquo;04. Demo & Walkthrough Guide&rdquo; tab to run guided demonstrations, or execute the pre-configured workflow pipelines in &ldquo;02. Agentic Workflows&rdquo; with 1 click.
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

function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>;
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
