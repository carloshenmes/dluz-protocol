const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);
  const dcarbon = await hre.ethers.getContractAt("IERC20", c.DCarbonToken);

  // Check current state (has 50 staked from previous test)
  const user = await farming.userInfo(0, signer.address);
  console.log("=== CURRENT STATE ===");
  console.log("User staked:", hre.ethers.formatEther(user.amount));
  console.log("dCARBON balance:", hre.ethers.formatEther(await dcarbon.balanceOf(signer.address)));
  console.log("DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(signer.address)));

  console.log("\nWaiting 10s for rewards to accrue...");
  await new Promise(r => setTimeout(r, 10000));

  const pending = await farming.pendingReward(0, signer.address);
  console.log("Pending dCARBON reward:", hre.ethers.formatEther(pending));

  // Unstake
  console.log("\n=== UNSTAKE 50 DLUZ ===");
  try {
    const tx = await farming.unstake(0, user.amount);
    const r = await tx.wait();
    console.log("✅ Unstake OK | Gas:", r.gasUsed.toString());
    for (const log of r.logs) {
      console.log("  Log:", log.address, log.topics[0]?.slice(0, 10));
    }
  } catch(e) {
    console.log("❌ Unstake failed:", e.message.slice(0, 400));
    return;
  }

  // Check pending after unstake (should be stored in pendingRewards)
  const userAfter = await farming.userInfo(0, signer.address);
  console.log("After unstake — pendingRewards:", hre.ethers.formatEther(userAfter.pendingRewards));

  // Claim
  console.log("\n=== CLAIM REWARDS ===");
  try {
    const tx = await farming.claim(0);
    const r = await tx.wait();
    console.log("✅ Claim OK | Gas:", r.gasUsed.toString());
    for (const log of r.logs) {
      console.log("  Log:", log.address, log.topics[0]?.slice(0, 10));
    }
  } catch(e) {
    console.log("❌ Claim failed:", e.message.slice(0, 400));
  }

  // Final state
  console.log("\n=== FINAL STATE ===");
  console.log("User staked:", hre.ethers.formatEther((await farming.userInfo(0, signer.address)).amount));
  console.log("dCARBON balance:", hre.ethers.formatEther(await dcarbon.balanceOf(signer.address)));
  console.log("DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(signer.address)));
  console.log("Farming dCARBON left:", hre.ethers.formatEther(await dcarbon.balanceOf(c.DLuzFarming)));
}

main().catch(console.error);
