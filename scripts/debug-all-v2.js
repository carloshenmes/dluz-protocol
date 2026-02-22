const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();

  console.log("=== 1. DLUZ SALE DEBUG ===");
  const dluz = await hre.ethers.getContractAt("IERC20", c.DLuzToken);
  console.log("Sale DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(c.DLuzSale)));
  console.log("Deployer DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(signer.address)));

  // Check DLuzSale ABI functions
  const saleArtifact = await hre.artifacts.readArtifact("DLuzSale");
  const funcs = saleArtifact.abi.filter(x => x.type === "function").map(x => x.name);
  console.log("DLuzSale functions:", funcs.join(", "));

  const sale = await hre.ethers.getContractAt("DLuzSale", c.DLuzSale);

  // Try common getters
  for (const fn of ["rate", "price", "paused", "active", "isActive", "saleActive", "tokenPrice", "ethPrice", "cap", "sold", "totalSold", "maxPurchase", "minPurchase", "owner"]) {
    try {
      const val = await sale[fn]();
      console.log(`  sale.${fn}():`, val.toString());
    } catch {}
  }

  console.log("\n=== 2. FARMING DEBUG ===");
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const dcarbon = await hre.ethers.getContractAt("IERC20", c.DCarbonToken);

  const [rewardToken, rewardPerSec, totalStaked, active] = await farming.getPoolInfo(0);
  console.log("Pool 0 rewardToken:", rewardToken);
  console.log("Pool 0 rewardPerSecond (raw):", rewardPerSec.toString());
  console.log("Pool 0 totalStaked:", hre.ethers.formatEther(totalStaked));
  console.log("Pool 0 active:", active);
  console.log("Farming dCARBON:", hre.ethers.formatEther(await dcarbon.balanceOf(c.DLuzFarming)));
  console.log("Farming DLUZ:", hre.ethers.formatEther(await dluz.balanceOf(c.DLuzFarming)));

  const user = await farming.userInfo(0, signer.address);
  console.log("User staked:", hre.ethers.formatEther(user.amount));
  console.log("User rewardDebt (raw):", user.rewardDebt.toString());
  console.log("User pendingRewards:", hre.ethers.formatEther(user.pendingRewards));

  // Read pool struct directly for accRewardPerShare
  const pool = await farming.pools(0);
  console.log("accRewardPerShare (raw):", pool.accRewardPerShare.toString());
  console.log("lastRewardTime:", pool.lastRewardTime.toString());
  const now = (await hre.ethers.provider.getBlock("latest")).timestamp;
  console.log("current block.timestamp:", now);
  console.log("elapsed since last update:", now - Number(pool.lastRewardTime), "s");

  const pending = await farming.pendingReward(0, signer.address);
  console.log("pendingReward(view):", pending.toString(), "raw");

  // Manual test: fresh stake + unstake
  console.log("\n=== 3. FRESH STAKE/UNSTAKE TEST ===");

  // Unstake anything stuck first
  if (user.amount > 0n) {
    console.log("Unstaking stuck", hre.ethers.formatEther(user.amount), "...");
    try {
      const tx = await farming.unstake(0, user.amount);
      const r = await tx.wait();
      console.log("  Status:", r.status, "| Gas:", r.gasUsed.toString());
      console.log("  ✅ Unstake OK");
    } catch(e) {
      console.log("  ❌ Failed:", e.message.slice(0, 400));
      console.log("\n  Skipping fresh test since unstake still fails.");
      return;
    }
  }

  const amt = hre.ethers.parseEther("50");
  let tx = await (await hre.ethers.getContractAt("IERC20", c.DLuzToken)).approve(c.DLuzFarming, amt);
  await tx.wait();

  console.log("Staking 50 DLUZ...");
  tx = await farming.stake(0, amt);
  await tx.wait();
  console.log("  ✅ Staked");

  console.log("Waiting 6s...");
  await new Promise(r => setTimeout(r, 6000));

  const p2 = await farming.pendingReward(0, signer.address);
  console.log("  Pending after 6s:", hre.ethers.formatEther(p2));

  console.log("Unstaking 50 DLUZ...");
  try {
    tx = await farming.unstake(0, amt);
    const receipt = await tx.wait();
    console.log("  ✅ Unstake OK | Status:", receipt.status, "| Gas:", receipt.gasUsed.toString());
  } catch(e) {
    console.log("  ❌ Unstake failed:", e.message.slice(0, 400));
  }
}

main().catch(console.error);
