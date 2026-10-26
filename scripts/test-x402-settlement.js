/**
 * Script to test real on-chain x402 payment settlement on Base Sepolia
 * Run with: node scripts/test-x402-settlement.js
 */
const { payAndFetch, requireAccount, getWalletBalance } = require("../agent/wallet");

async function testX402() {
  const account = requireAccount();
  console.log("==================================================");
  console.log("🤖 TESTING LIVE ON-CHAIN X402 SETTLEMENT");
  console.log("==================================================");
  console.log("Agent Address: ", account.address);
  const balance = await getWalletBalance();
  console.log("Current Balance:", balance);

  const testUrl = "http://localhost:3000/api/crypto-alpha?symbol=BTC";
  console.log("Requesting monetized endpoint:", testUrl);
  console.log("The client will intercept HTTP 402, broadcast a real on-chain transfer to Base Sepolia, and verify.");

  try {
    const result = await payAndFetch(testUrl);
    console.log("✅ X402 ON-CHAIN SETTLEMENT SUCCESSFUL!");
    console.log("Settlement Status: ", result.settlement?.status);
    console.log("Transaction Hash:  ", result.settlement?.txHash);
    console.log("Block Number:      ", result.settlement?.blockNumber);
    console.log("BaseScan Explorer: ", result.settlement?.explorerUrl);
    console.log("Resource Data:     ", result.data?.signalConviction);
    console.log("==================================================");
  } catch (err) {
    console.error("❌ X402 Settlement Failed:", err.message);
  }
}

testX402().catch(console.error);
