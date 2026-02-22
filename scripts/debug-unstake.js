const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;
  const parse = hre.ethers.parseEther;
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);

  // 1. Check pool info
  const poolLen = await farming.poolLength();
  console.log(`Pool count: ${poolLen}`);

  // 2. Check what view functions exist for user info
  const frags = farming.interface.fragments.filter(f => f.type === "function");
  console.log("\nAll functions:");
  frags.forEach(f => console.log(`  ${f.format()}`));

  // 3. Try to read user info
  console.log("\n--- Trying userInfo mapping ---");
  try {
    const info = await farming.userInfo(0, signer.address);
    console.log(`  userInfo(0): amount=${fmt(info.amount)}, rewardDebt=${fmt(info.rewardDebt)}`);
  } catch (e) {
    console.log(`  userInfo not available: ${e.message.slice(0, 100)}`);
  }

  // 4. Encode unstake manually and show it
  const unstakeData = farming.interface.encodeFunctionData("unstake", [0, parse("100")]);
  console.log(`\nEncoded unstake: ${unstakeData}`);
  console.log(`Selector: ${unstakeData.slice(0, 10)}`);
  console.log(`Expected selector: ${farming.interface.getFunction("unstake").selector}`);

  // 5. Try static call first
  console.log("\n--- Static call unstake ---");
  try {
    await farming.unstake.staticCall(0, parse("100"));
    console.log("  staticCall: would succeed");
  } catch (e) {
    console.log(`  staticCall reverts: ${e.message.slice(0, 200)}`);
  }

  // 6. Try unstake with explicit gas and data via raw provider
  console.log("\n--- Raw sendTransaction ---");
  const tx = {
    to: c.DLuzFarming,
    data: unstakeData,
    gasLimit: 300000n,
  };
  console.log(`  tx.to: ${tx.to}`);
  console.log(`  tx.data: ${tx.data}`);
  console.log(`  tx.data length: ${tx.data.length}`);

  try {
    const resp = await signer.sendTransaction(tx);
    console.log(`  tx hash: ${resp.hash}`);
    const receipt = await resp.wait();
    console.log(`  status: ${receipt.status}`);
    console.log(`  gasUsed: ${receipt.gasUsed}`);
    console.log(`  logs: ${receipt.logs.length}`);
  } catch (e) {
    console.log(`  FAILED: ${e.message.slice(0, 300)}`);
    // Check if data was actually sent
    if (e.receipt) {
      console.log(`  Receipt tx data: ${e.transaction?.data || 'N/A'}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
