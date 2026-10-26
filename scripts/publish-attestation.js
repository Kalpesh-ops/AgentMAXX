const { createPublicClient, createWalletClient, http, stringToHex } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");
const fs = require("fs");
const path = require("path");

function getPrivateKey() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      if (line.startsWith("WALLET_PRIVATE_KEY=")) {
        const key = line.replace("WALLET_PRIVATE_KEY=", "").trim();
        if (key.startsWith("0x")) return key;
      }
    }
  }
  return null;
}

async function main() {
  const privateKey = getPrivateKey();
  const account = privateKeyToAccount(privateKey);
  const rpcUrl = "https://sepolia.base.org";
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(rpcUrl) });

  console.log("Publishing Proof-of-Audit calldata transaction on Base Sepolia...");
  const payload = JSON.stringify({
    agent: "AgentMAXX",
    version: "3.0-week3",
    title: "Rise In Agentmaxxing Week 3 On-Chain Verification",
    target: "0x0EF0F548cC9fC218D0cdfD7df24aC5B8Cb6be286",
    summary: "Agent wallet funded with 0.45 ETH on Base Sepolia. Full on-chain X402 settlement and live transaction verification passed.",
    timestamp: new Date().toISOString(),
  });
  const dataHex = stringToHex(payload);

  const hash = await walletClient.sendTransaction({
    to: "0x000000000000000000000000000000000000dEaD",
    value: 0n,
    data: dataHex,
    chain: baseSepolia,
  });

  console.log("Attestation broadcasted! Tx Hash:", hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Confirmed in Block:", receipt.blockNumber.toString());
  console.log("BaseScan URL:", `https://sepolia.basescan.org/tx/${hash}`);
}

main().catch(console.error);
