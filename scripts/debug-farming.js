const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();

  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);

  console.log("=== FARMING DEBUG ===");
  console.log("Farming address:", c.DLuzFarming);
  console.log("Farming DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(c.DLuzFarming)));
  console.log("");

  const poolCount = await farming.poolCount();
  console.log("Pool count:", poolCount.toString());

  for (let i = 0; i < poolCount; i++) {
    const [rewardToken, rewardPerSec, totalStaked, active] = await farming.getPoolInfo(i);
    console.log(`\nPool ${i}:`);
    console.log("  rewardToken:", rewardToken);
    console.log("  rewardPerSecond:", hre.ethers.formatEther(rewardPerSec));
    console.log("  totalStaked:", hre.ethers.formatEther(totalStaked));
    console.log("  active:", active);

    const user = await farming.userInfo(i, signer.address);
    console.log("  user.amount:", hre.ethers.formatEther(user.amount));
    console.log("  user.pendingRewards:", hre.ethers.formatEther(user.pendingRewards));

    const pending = await farming.pendingReward(i, signer.address);
    console.log("  pendingReward(view):", hre.ethers.formatEther(pending));
  }

  // Check reward token balance in farming
  if (poolCount > 0n) {
    const [rewardToken] = await farming.getPoolInfo(0);
    const rt = await hre.ethers.getContractAt("IERC20", rewardToken);
    const farmingRewardBal = await rt.balanceOf(c.DLuzFarming);
    console.log("\nFarming reward token balance:", hre.ethers.formatEther(farmingRewardBal));
    console.log("Reward token address:", rewardToken);
    console.log("Is dCARBON?", rewardToken.toLowerCase() === c.DCarbonToken.toLowerCase());
    console.log("Is dENERGY?", rewardToken.toLowerCase() === c.DEnergyToken.toLowerCase());
  }

  // Try manual stake + unstake
  console.log("\n=== MANUAL STAKE TEST ===");
  const amount = hre.ethers.parseEther("100");

  console.log("Deployer DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(signer.address)));

  let tx = await dluz.approve(c.DLuzFarming, amount);
  await tx.wait();

  console.log("1. Staking 100 DLUZ...");
  tx = await farming.stake(0, amount);
  await tx.wait();
  console.log("   Staked OK");
  console.log("   Farming DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(c.DLuzFarming)));

  console.log("2. Unstaking 100 DLUZ immediately...");
  try {
    tx = await farming.unstake(0, amount);
    await tx.wait();
    console.log("   ✅ Unstaked OK");
  } catch (e) {
    console.log("   ❌ Revert:", e.message.slice(0, 500));
  }
}

main().catch(console.error);
