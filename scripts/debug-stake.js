const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);

  const amt = hre.ethers.parseEther("50");

  console.log("=== PRE-CHECK ===");
  console.log("DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(signer.address)));
  console.log("Allowance to Farming:", hre.ethers.formatEther(await dluz.allowance(signer.address, c.DLuzFarming)));
  
  const [rt, rps, ts, active] = await farming.getPoolInfo(0);
  console.log("Pool 0 totalStaked:", hre.ethers.formatEther(ts));
  console.log("Pool 0 active:", active);

  const user = await farming.userInfo(0, signer.address);
  console.log("User amount:", hre.ethers.formatEther(user.amount));
  console.log("User rewardDebt:", user.rewardDebt.toString());

  console.log("\n=== APPROVE ===");
  let tx = await dluz.approve(c.DLuzFarming, amt);
  await tx.wait();
  console.log("Approved. Allowance:", hre.ethers.formatEther(await dluz.allowance(signer.address, c.DLuzFarming)));

  console.log("\n=== STATIC CALL (simulate) ===");
  try {
    await farming.stake.staticCall(0, amt);
    console.log("✅ staticCall passed — stake should succeed");
  } catch(e) {
    console.log("❌ staticCall failed:", e.message.slice(0, 500));
    
    // Try to decode revert reason
    if (e.data) {
      console.log("Revert data:", e.data);
    }
    return;
  }

  console.log("\n=== EXECUTE STAKE ===");
  try {
    tx = await farming.stake(0, amt, { gasLimit: 300000 });
    const receipt = await tx.wait();
    console.log("✅ Stake OK | Status:", receipt.status, "| Gas:", receipt.gasUsed.toString());
    console.log("Logs:", receipt.logs.length);
    for (const log of receipt.logs) {
      console.log("  →", log.address, log.topics[0]?.slice(0, 10));
    }
  } catch(e) {
    console.log("❌ Stake TX failed:", e.message.slice(0, 500));
  }
}

main().catch(console.error);
