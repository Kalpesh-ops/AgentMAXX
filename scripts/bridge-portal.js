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

async function main() {
  const privateKey = getPrivateKey();
  const account = privateKeyToAccount(privateKey);
  console.log("Account:", account.address);

  const rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
  const publicClient = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });

  const bal = await publicClient.getBalance({ address: account.address });
  console.log("Sepolia L1 balance:", formatEther(bal), "ETH");

  // Official Base Sepolia OptimismPortalProxy on Ethereum Sepolia
  const BASE_SEPOLIA_OPTIMISM_PORTAL = "0x49f53e41452C74589E85cA1677426Ba426459e85";
  const amountToBridge = parseEther("0.45"); // Deposit 0.45 ETH to Base Sepolia

  console.log("Calling depositTransaction on Base Sepolia Portal:", BASE_SEPOLIA_OPTIMISM_PORTAL);
  const hash = await walletClient.writeContract({
    address: BASE_SEPOLIA_OPTIMISM_PORTAL,
    abi: [
      {
        inputs: [
          { internalType: "address", name: "_to", type: "address" },
          { internalType: "uint256", name: "_value", type: "uint256" },
          { internalType: "uint64", name: "_gasLimit", type: "uint64" },
          { internalType: "bool", name: "_isCreation", type: "bool" },
          { internalType: "bytes", name: "_data", type: "bytes" },
        ],
        name: "depositTransaction",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ],
    functionName: "depositTransaction",
    args: [account.address, amountToBridge, 100000n, false, "0x"],
    value: amountToBridge,
  });

  console.log("Portal deposit tx hash:", hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Portal deposit confirmed in block:", receipt.blockNumber.toString());
  console.log("Waiting for Base Sepolia minting...");
}

main().catch(console.error);
