import {
  createWallet,
  getPrivateKey,
  getWalletAddress,
  getWalletBalance,
  publishOnChainAttestation,
  sendOnChainPayment,
  verifyContractBytecode,
} from "@/agent/wallet";

// GET /api/wallet -> wallet status, balance, explorer link, or bytecode
export async function GET(req: Request) {
  const url = new URL(req.url);
  const showKey = url.searchParams.get("export") === "true";
  const bytecodeAddress = url.searchParams.get("bytecode");

  if (bytecodeAddress) {
    try {
      const data = await verifyContractBytecode(bytecodeAddress);
      return Response.json(data);
    } catch (err: any) {
      return Response.json({ error: err.message }, { status: 400 });
    }
  }

  const address = getWalletAddress();
  if (!address) return Response.json({ address: null });

  const balance = await getWalletBalance().catch(() => "0.0000 ETH");
  return Response.json({
    address,
    balance,
    network: "Base Sepolia (84532)",
    explorerUrl: `https://sepolia.basescan.org/address/${address}`,
    faucetUrl: "https://faucets.chain.link/base-sepolia",
    isConfigured: Boolean(process.env.WALLET_PRIVATE_KEY),
    ...(showKey ? { privateKey: getPrivateKey() } : {}),
  });
}

// POST /api/wallet -> create wallet OR execute on-chain action (transfer/attest)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    // Action 1: On-Chain ETH Transfer
    if (action === "transfer") {
      const { to, amountEth } = body;
      if (!to) {
        return Response.json({ error: "Missing 'to' address for transfer." }, { status: 400 });
      }
      const result = await sendOnChainPayment(to, amountEth || "0.0001");
      return Response.json(result);
    }

    // Action 2: On-Chain Proof-of-Audit Attestation
    if (action === "attest") {
      const { title, summary, target } = body;
      if (!title || !summary) {
        return Response.json({ error: "Missing title or summary for attestation." }, { status: 400 });
      }
      const result = await publishOnChainAttestation(title, summary, target);
      return Response.json(result);
    }

    // Default: Create/Ensure wallet exists
    const address = createWallet();
    const balance = await getWalletBalance().catch(() => "0.0000 ETH");
    return Response.json({
      address,
      balance,
      network: "Base Sepolia (84532)",
      explorerUrl: `https://sepolia.basescan.org/address/${address}`,
      faucetUrl: "https://faucets.chain.link/base-sepolia",
    });
  } catch (err: any) {
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
}
