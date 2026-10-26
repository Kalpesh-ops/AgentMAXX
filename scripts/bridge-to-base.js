const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { sepolia } = require("viem/chains");
const { privateKeyToAccount } = require("viem/accounts");
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

async function bridge() {
  const privateKey = getPrivateKey();
  const account = privateKeyToAccount(privateKey);
  console.log("Bridging from Ethereum Sepolia to Base Sepolia...");
  console.log("Account:", account.address);

  const rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
  const publicClient = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Ethereum Sepolia L1 Balance:", formatEther(balance), "ETH");

  const L1_STANDARD_BRIDGE = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";
  const amountToBridge = parseEther("1.0"); // Bridge 1.0 ETH

  console.log("Initiating deposit of 1.0 ETH to Base Sepolia via L1StandardBridge...");
  const hash = await walletClient.writeContract({
    address: L1_STANDARD_BRIDGE,
    abi: [
      {
        name: "depositETH",
        type: "function",
        stateMutability: "payable",
        inputs: [
          { name: "_minGasLimit", type: "uint32" },
          { name: "_extraData", type: "bytes" },
        ],
        outputs: [],
      },
    ],
    functionName: "depositETH",
    args: [200000, "0x"],
    value: amountToBridge,
  });

  console.log("L1 Bridge Transaction Hash:", hash);
  console.log("Waiting for L1 confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("L1 Deposit Confirmed in block:", receipt.blockNumber.toString());
  console.log("Base Sepolia will mint the funds in ~1 to 3 minutes.");
}

bridge().catch(console.error);
