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
  Eye,
  EyeOff,
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

const PRESET_PROMPTS = [
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
    label: "🌦️ Tokyo Weather (0.01 USDC)",
    prompt: "What is the high-resolution satellite weather in Tokyo?",
    type: "paid",
  },
  {
    label: "💰 Treasury & Wallet",
    prompt: "What is your wallet address, Base Sepolia balance, and explorer link?",
    type: "free",
  },
  {
    label: "📈 Live Crypto Prices",
    prompt: "Fetch live spot market prices and 24h change for Bitcoin, Ethereum, and Solana.",
    type: "free",
  },
  {
    label: "⛽ Base Gas Fees",
    prompt: "Estimate current gas fees on Base L2 versus Ethereum Mainnet.",
    type: "free",
  },
  {
    label: "🧮 Staking Yield (12% APY)",
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
  const [status, setStatus] = useState<Status | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "free">("all");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadWallet = () =>
    fetch("/api/wallet")
      .then((r) => r.json())
      .then(setWallet)
      .catch(() => {});

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
    loadWallet();
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

  const ready = Boolean(status?.hasApiKey);

  const filteredTools = status?.tools.filter((t) => {
    if (activeTab === "paid") return t.category === "x402-paid";
    if (activeTab === "free") return t.category === "free-utility";
    return true;
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-8 px-4 py-6 md:px-10 md:py-10">
      {/* Top Banner / Ticker */}
      <header className="flex flex-col gap-6">
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
              <span className="text-muted-foreground text-[10px]">WEEK 1</span>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              ⚡ Base Sepolia
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
              <Award className="size-3.5 mr-1" /> Week 1 Submission
            </Button>
          </div>
        </div>

        {/* Hero Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold tracking-wider text-primary uppercase">
                Autonomous Intelligence Broker
              </span>
              <span className="rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                x402 ENABLED
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight uppercase md:text-7xl">
              AGENT<span className="text-primary">MAXX</span>
            </h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground md:text-lg">
              Autonomous Web3 AI Agent with native Base Sepolia crypto treasury. Autonomously signs EIP-191 micropayments via HTTP 402 and executes financial toolchains.
            </p>
          </div>

          <div className="flex flex-col gap-1 border-l-2 border-primary pl-4 font-mono text-xs text-muted-foreground">
            <div>PROTOCOL: <span className="text-foreground">x402 Micropayments</span></div>
            <div>CHAIN: <span className="text-foreground">Base Sepolia (84532)</span></div>
            <div>RUNTIME: <span className="text-foreground">Google Gemini 2.5 Flash</span></div>
          </div>
        </div>
      </header>

      {/* Main Grid: Left Setup + Right Chat */}
      <div className="grid flex-1 gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left Column */}
        <aside className="flex flex-col gap-6">
          {/* Card 1: Setup & Wallet */}
          <Card className="border-border">
            <CardHeader className="border-b border-border/80">
              <SectionTitle num="01" title="Agent Treasury & Environment" />
            </CardHeader>
            <CardContent className="flex flex-col pt-4">
              <SetupStep number={1} title="Gemini 2.5 Flash LLM" done={ready}>
                {status && !ready && (
                  <p className="text-muted-foreground text-xs">
                    Set <Code>GEMINI_API_KEY</Code> in <Code>.env</Code> or environment variables.
                  </p>
                )}
                {ready && <p className="text-xs text-muted-foreground">Active & Responsive with cognitive tool loop.</p>}
              </SetupStep>

              <SetupStep number={2} title="Agent Wallet (Base Sepolia)" done={Boolean(wallet?.address)}>
                {wallet && !wallet.address && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground">
                      Initialize the agent&apos;s cryptographic wallet to enable autonomous x402 signing.
                    </p>
                    <Button onClick={createWallet} disabled={creating} className="w-fit font-mono tracking-wider uppercase text-xs">
                      <Wallet className="size-3.5 mr-1" /> {creating ? "Generating Key..." : "Create Agent Wallet"}
                    </Button>
                  </div>
                )}
                {wallet?.address && (
                  <WalletDetails
                    wallet={wallet}
                    onRefresh={loadWallet}
                    onExportKey={fetchPrivateKey}
                  />
                )}
              </SetupStep>

              <SetupStep number={3} title="x402 Autonomous Payments" done={Boolean(wallet?.address)} last>
                <p className="text-xs text-muted-foreground">
                  The agent autonomously inspects HTTP 402 invoices, signs payloads with its private key, and settles paid APIs.
                </p>
              </SetupStep>
            </CardContent>
          </Card>

          {/* Card 2: Tool Arsenal */}
          <Card className="border-border">
            <CardHeader className="border-b border-border/80">
              <div className="flex items-center justify-between">
                <SectionTitle num="02" title="Tool Arsenal" />
                <div className="flex gap-1 font-mono text-[11px]">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={cn(
                      "px-2 py-0.5 transition-colors",
                      activeTab === "all" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("paid")}
                    className={cn(
                      "px-2 py-0.5 transition-colors",
                      activeTab === "paid" ? "bg-blue text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    x402
                  </button>
                  <button
                    onClick={() => setActiveTab("free")}
                    className={cn(
                      "px-2 py-0.5 transition-colors",
                      activeTab === "free" ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Free
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3.5 pt-4">
              {filteredTools?.map((t) => (
                <div key={t.name} className="group border border-border/60 bg-muted/30 p-2.5 transition-colors hover:border-primary/60">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-xs font-semibold text-foreground">
                      <span className="text-primary">&gt;</span> {t.name}
                    </p>
                    {t.category === "x402-paid" ? (
                      <Badge className="bg-blue/80 font-mono text-[10px] text-foreground">
                        {t.cost || "PAID"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                        FREE
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Right Column: Chat Console */}
        <Card className="flex h-[calc(100vh-5rem)] min-h-[640px] flex-col border-border">
          <CardHeader className="border-b border-border/80">
            <div className="flex items-center justify-between">
              <SectionTitle num="03" title="Executive Agent Console" />
              <div className="flex items-center gap-2">
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
            </div>

            {/* Quick Prompt Carousel */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => send(p.prompt)}
                  disabled={!ready || thinking}
                  className="shrink-0 rounded-none border border-border/80 bg-background px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-foreground active:scale-95 disabled:opacity-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </CardHeader>

          {/* Chat Messages */}
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
                      Deploying autonomous tool chains, EIP-191 micropayment verification, and quantitative intelligence on Base Sepolia.
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

          {/* Chat Footer / Input Form */}
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
                  agentmaxx:~$
                </span>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={ready ? "Enter command or ask AgentMAXX to execute tools..." : "Configure GEMINI_API_KEY to start"}
                  disabled={!ready}
                  className="h-11 border-0 bg-transparent font-mono text-xs focus-visible:ring-0"
                />
              </div>
              <Button
                type="submit"
                className="h-auto px-6 font-mono text-xs uppercase"
                disabled={!ready || thinking || !input.trim()}
              >
                <SendHorizontal className="size-4 mr-1.5" /> Run
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      {/* Week 1 Submission Brief Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setShowSubmissionModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase mb-2">
              <Award className="size-4" /> Agentmaxxing Week 1: Get Agentic
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Submission Package</h2>

            <div className="mt-4 flex flex-col gap-4 text-xs text-muted-foreground leading-relaxed">
              <div className="border border-border/80 bg-muted/40 p-3">
                <span className="font-bold text-foreground block font-mono mb-1">1. AGENT DESCRIPTION</span>
                <strong>AgentMAXX</strong> is an autonomous Web3 Executive AI agent built for the Rise In Agentmaxxing hackathon. Unlike traditional chatbots that simply answer queries, AgentMAXX manages its own cryptographic crypto wallet on Base Sepolia. When querying premium intelligence endpoints (crypto market sentiment, quantitative alpha, contract security audits, satellite weather), AgentMAXX autonomously detects HTTP 402 Payment Required, signs EIP-191 micropayment authorizations with its private key, settles the payment machine-to-machine, and synthesizes institutional-grade research.
              </div>

              <div className="border border-border/80 bg-muted/40 p-3">
                <span className="font-bold text-foreground block font-mono mb-1">2. KEY LEARNINGS & EXPERIMENTATION</span>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li><strong>Chatbots vs Autonomous Agents:</strong> Chatbots are reactive text generators; agents possess an iterative loop consisting of instructions, multi-step tool execution, treasury state, and autonomous external action.</li>
                  <li><strong>The x402 Micropayment Protocol:</strong> Explored how AI agents can operate in the machine-to-machine economy by programmatically handling HTTP 402 payment requirements via cryptographic signatures without human intervention.</li>
                  <li><strong>Tool Function Calling with Google Gemini:</strong> Implemented typed function declarations where the LLM chooses tools dynamically, handles arguments, and ingests multi-turn tool responses back into context.</li>
                  <li><strong>Base Sepolia & viem Integration:</strong> Managed key generation, EIP-191 personal signing, on-chain RPC balance fetching, and fallback serverless persistence.</li>
                </ul>
              </div>

              <div className="border border-border/80 bg-muted/40 p-3">
                <span className="font-bold text-foreground block font-mono mb-1">3. REPOSITORY & REQUISITES</span>
                <p>GitHub: <a href="https://github.com/Kalpesh-ops/AgentMAXX" target="_blank" rel="noreferrer" className="text-primary underline">https://github.com/Kalpesh-ops/AgentMAXX</a></p>
                <p>Base Sepolia Network: Chain ID 84532</p>
                <p>Gemini Model: Gemini 2.5 Flash</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowSubmissionModal(false)} className="font-mono text-xs uppercase">
                Close Brief
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
              This private key controls the agent&apos;s Base Sepolia testnet wallet. You can import this into MetaMask or Coinbase Wallet to fund with test ETH.
            </p>
            <div className="mt-4 border border-border bg-background p-3">
              <code className="break-all font-mono text-xs text-primary">{privateKey}</code>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs uppercase"
                onClick={() => {
                  navigator.clipboard.writeText(privateKey);
                }}
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

/**
 * Lightweight, beautiful markdown renderer for agent insights
 */
function MarkdownText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 font-sans text-xs">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith("### ")) {
          return <h4 key={idx} className="font-bold text-foreground text-sm uppercase mt-3 mb-1 border-b border-border/40 pb-0.5">{line.slice(4)}</h4>;
        }
        if (line.startsWith("## ")) {
          return <h3 key={idx} className="font-black text-primary text-base uppercase mt-3 mb-1">{line.slice(3)}</h3>;
        }
        if (line.startsWith("# ")) {
          return <h2 key={idx} className="font-black text-primary text-lg uppercase mt-3 mb-1">{line.slice(2)}</h2>;
        }
        // Horizontal Rule
        if (line.trim() === "---") {
          return <hr key={idx} className="border-border my-2" />;
        }
        // Unordered list
        if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
          const itemText = line.trim().slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-primary font-bold mt-0.5">•</span>
              <div>{renderFormattedText(itemText)}</div>
            </div>
          );
        }
        // Ordered list item (e.g., "1. ")
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
  // Simple parser for bold **text**, inline `code`, and links [text](url)
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
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}
