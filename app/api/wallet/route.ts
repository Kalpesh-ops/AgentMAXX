import { createWallet, getWalletAddress, getWalletBalance, getPrivateKey } from "@/agent/wallet";

// GET /api/wallet -> wallet address, balance, explorer link
export async function GET(req: Request) {
  const url = new URL(req.url);
  const showKey = url.searchParams.get("export") === "true";

  const address = getWalletAddress();
  if (!address) return Response.json({ address: null });

  const balance = await getWalletBalance().catch(() => "0.0000 ETH");
  return Response.json({
    address,
    balance,
    network: "Base Sepolia (84532)",
    explorerUrl: `https://sepolia.basescan.org/address/${address}`,
    faucetUrl: "https://faucets.chain.link/base-sepolia",
    ...(showKey ? { privateKey: getPrivateKey() } : {}),
  });
}

// POST /api/wallet -> create or ensure wallet exists
export async function POST() {
  const address = createWallet();
  const balance = await getWalletBalance().catch(() => "0.0000 ETH");
  return Response.json({
    address,
    balance,
    network: "Base Sepolia (84532)",
    explorerUrl: `https://sepolia.basescan.org/address/${address}`,
    faucetUrl: "https://faucets.chain.link/base-sepolia",
  });
}
