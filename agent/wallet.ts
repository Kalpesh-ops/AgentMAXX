/**
 * THE AGENT'S WALLET & x402 PAYMENT ENGINE
 *
 * The agent owns a cryptographic wallet (an Ethereum private key on Base Sepolia).
 * It uses it to sign payments autonomously, enabling the "x402" protocol:
 *
 *   1. Agent calls a premium API -> API responds 402 Payment Required + price & recipient
 *   2. Agent constructs payment  -> Signs payload with its private key (EIP-191)
 *   3. Agent retries with header -> API verifies signature & fulfills response with 200 OK
 *
 * Compatible with local development & Vercel serverless environments.
 */
import fs from "fs";
import path from "path";
import { createPublicClient, formatEther, http, verifyMessage, type Address, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const LOCAL_WALLET_FILE = path.join(process.cwd(), ".agent-wallet.json");
const TMP_WALLET_FILE = path.join("/tmp", ".agent-wallet.json");

const chain = createPublicClient({ chain: baseSepolia, transport: http() });

export type Payment = {
  from: Address;
  to: Address;
  amount: string;
  asset: string;
  resource: string;
  nonce: string;
  timestamp?: string;
};

// In-memory cache for serverless environments where disk is ephemeral
let inMemoryKey: Hex | null = null;

/** The wallet from .env, local disk, /tmp, or in-memory cache */
function loadAccount() {
  if (inMemoryKey) {
    return privateKeyToAccount(inMemoryKey);
  }

  // 1. Env variable takes highest precedence
  if (process.env.WALLET_PRIVATE_KEY) {
    inMemoryKey = process.env.WALLET_PRIVATE_KEY as Hex;
    return privateKeyToAccount(inMemoryKey);
  }

  // 2. Local cwd file (works in local dev)
  try {
    if (fs.existsSync(LOCAL_WALLET_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_WALLET_FILE, "utf8"));
      if (data?.privateKey) {
        inMemoryKey = data.privateKey as Hex;
        return privateKeyToAccount(inMemoryKey);
      }
    }
  } catch {
    // Ignore read errors
  }

  // 3. /tmp directory (works on Vercel serverless functions)
  try {
    if (fs.existsSync(TMP_WALLET_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_WALLET_FILE, "utf8"));
      if (data?.privateKey) {
        inMemoryKey = data.privateKey as Hex;
        return privateKeyToAccount(inMemoryKey);
      }
    }
  } catch {
    // Ignore read errors
  }

  return null;
}

export function requireAccount() {
  let account = loadAccount();
  if (!account) {
    // Auto-create wallet if not yet initialized so operations never fail
    createWallet();
    account = loadAccount();
  }
  if (!account) throw new Error("Agent wallet initialization failed.");
  return account;
}

/** Make a brand new wallet and persist it across storage backends */
export function createWallet(): Address {
  const existing = loadAccount();
  if (existing) return existing.address;

  const privateKey = generatePrivateKey();
  inMemoryKey = privateKey;

  // Attempt to write to local directory first
  try {
    fs.writeFileSync(LOCAL_WALLET_FILE, JSON.stringify({ privateKey }, null, 2));
  } catch {
    // If running in a read-only filesystem (Vercel), write to /tmp
    try {
      fs.writeFileSync(TMP_WALLET_FILE, JSON.stringify({ privateKey }, null, 2));
    } catch {
      // Memory fallback remains intact
    }
  }

  return privateKeyToAccount(privateKey).address;
}

export function getWalletAddress(): Address | null {
  return loadAccount()?.address ?? null;
}

export function getPrivateKey(): string | null {
  loadAccount();
  return inMemoryKey ?? null;
}

export async function getWalletBalance(): Promise<string> {
  const account = loadAccount();
  if (!account) return "0.0000 ETH";
  try {
    const wei = await chain.getBalance({ address: account.address });
    return `${Number(formatEther(wei)).toFixed(4)} ETH`;
  } catch {
    return "0.0000 ETH";
  }
}

/** Fetch a URL. If it asks for payment (402), sign one with the agent's wallet and retry. */
export async function payAndFetch(url: string) {
  const first = await fetch(url);
  if (first.status !== 402) {
    return { data: await first.json() };
  }

  const account = requireAccount();
  const { price, asset, payTo } = await first.json();
  const payment: Payment = {
    from: account.address,
    to: payTo,
    amount: price,
    asset,
    resource: new URL(url).pathname,
    nonce: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  const signature = await account.signMessage({ message: JSON.stringify(payment) });
  const header = Buffer.from(JSON.stringify({ payment, signature })).toString("base64");

  const paid = await fetch(url, { headers: { "X-PAYMENT": header } });
  return {
    data: await paid.json(),
    payment: {
      status: paid.status,
      amount: `${price} ${asset}`,
      to: payTo,
      from: account.address,
      resource: new URL(url).pathname,
      signatureShort: `${signature.slice(0, 14)}...${signature.slice(-8)}`,
      signatureFull: signature,
      nonce: payment.nonce,
      timestamp: payment.timestamp,
      verified: paid.status === 200,
    },
  };
}

/** Used by paid API routes: verify the X-PAYMENT cryptographic signature */
export async function verifyPayment(header: string | null) {
  if (!header) return null;
  try {
    const { payment, signature } = JSON.parse(Buffer.from(header, "base64").toString()) as {
      payment: Payment;
      signature: Hex;
    };
    const valid = await verifyMessage({ address: payment.from, message: JSON.stringify(payment), signature });
    return valid ? payment : null;
  } catch {
    return null;
  }
}
