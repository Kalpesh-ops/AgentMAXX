/**
 * Helper script to verify agent wallet on Base Sepolia and broadcast a real transaction.
 * Run with: node scripts/fund-check-and-transfer.js
 */
const { createPublicClient, createWalletClient, http, formatEther, parseEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");
const fs = require("fs");
const path = require("path");

function getPrivateKey() {
  // 1. Env
  if (process.env.WALLET_PRIVATE_KEY && process.env.WALLET_PRIVATE_KEY.startsWith("0x")) {
    return process.env.WALLET_PRIVATE_KEY;
  }
  // 2. .env file
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
  // 3. .agent-wallet.json
  const walletJsonPath = path.join(process.cwd(), ".agent-wallet.json");
  if (fs.existsSync(walletJsonPath)) {
    const data = JSON.parse(fs.readFileSync(walletJsonPath, "utf8"));
    if (data?.privateKey) return data.privateKey;
  }
  return null;
}

async function main() {
  const privateKey = getPrivateKey();
  if (!privateKey) {
    console.error("❌ No private key found in .env or .agent-wallet.json.");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  const rpcUrl = process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(rpcUrl) });

  console.log("==================================================");
  console.log("🤖 AGENT WALLET VERIFICATION (Base Sepolia)");
  console.log("==================================================");
  console.log("Address:     ", account.address);
  console.log("Explorer:    ", `https://sepolia.basescan.org/address/${account.address}`);

  const balanceWei = await publicClient.getBalance({ address: account.address });
  const balanceEth = formatEther(balanceWei);
  console.log("Balance:     ", `${balanceEth} ETH`);
  console.log("--------------------------------------------------");

  const minRequired = parseEther("0.00005");
  if (balanceWei < minRequired) {
    console.log("⚠️ INSUFFICIENT BALANCE FOR ON-CHAIN TRANSACTION");
    console.log(`Current balance is ${balanceEth} ETH.`);
    console.log("Please fund your agent wallet with free Base Sepolia test ETH at:");
    console.log("👉 https://faucets.chain.link/base-sepolia");
    console.log("👉 https://learnweb3.io/faucets/base_sepolia");
    console.log(`Target Address: ${account.address}`);
    console.log("Once funded, re-run this script to execute a real on-chain transaction!");
    return;
  }

  console.log("🚀 Executing real on-chain transfer on Base Sepolia...");
  const targetRecipient = "0x000000000000000000000000000000000000dEaD";
  const sendAmount = parseEther("0.00001");

  try {
    const hash = await walletClient.sendTransaction({
      to: targetRecipient,
      value: sendAmount,
      chain: baseSepolia,
    });

    console.log("⏳ Transaction broadcasted! Hash:", hash);
    console.log("⏳ Waiting for Base Sepolia block confirmation...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 35000 });

    console.log("✅ TRANSACTION CONFIRMED ON-CHAIN!");
    console.log("Block Number: ", receipt.blockNumber.toString());
    console.log("Gas Used:     ", receipt.gasUsed.toString());
    console.log("BaseScan URL: ", `https://sepolia.basescan.org/tx/${hash}`);
    console.log("==================================================");
  } catch (err) {
    console.error("❌ Transaction execution failed:", err.message);
  }
}

main().catch(console.error);
