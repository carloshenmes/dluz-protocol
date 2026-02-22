const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();

  console.log("=== 1. DLUZ SALE DEBUG ===");
  const sale = await hre.ethers.getContractAt("DLuzSale", c.DLuzSale);
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);

  // Check if sale has a treasury/wallet concept
  let saleSource;
  try { saleSource = await sale.treasury(); } catch {}
  try { saleSource = await sale.wallet(); } catch {}
  try { saleSource = await sale.tokenWallet(); } catch {}
  console.log("Sale source address:", saleSource || "unknown (no getter)");
  console.log("Sale DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(c.DLuzSale)));
  console.log("Deployer DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(signer.address)));

  // Check if sale mints or transfers
  const MINTER = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  console.log("Sale has MINTER_ROLE on DLUZ:", await dluz.hasRole(MINTER, c.DLuzSale));

  // Try to check rate
  try {
    const rate = await sale.rate();
    console.log("Sale rate:", rate.toString());
  } catch {}
  try {
    const price = await sale.price();
    console.log("Sale price:", price.toString());
  } catch {}

  console.log("\n=== 2. FARMING DEBUG (NEW CONTRACT) ===");
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", c.DCarbonToken);

  const [rewardToken, rewardPerSec, totalStaked, active] = await farming.getPoolInfo(0);
  console.log("Pool 0 rewardToken:", rewardToken);
  console.log("Pool 0 rewardPerSecond:", rewardPerSec.toString(), "raw");
  console.log("Pool 0 rewardPerSecond:", hre.ethers.formatEther(rewardPerSec), "formatted");
  console.log("Pool 0 totalStaked:", hre.ethers.formatEther(totalStaked));
  console.log("Pool 0 active:", active);
  console.log("Farming dCARBON balance:", hre.ethers.formatEther(await dcarbon.balanceOf(c.DLuzFarming)));
  console.log("Farming DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(c.DLuzFarming)));

  const user = await farming.userInfo(0, signer.address);
  console.log("User staked:", hre.ethers.formatEther(user.amount));
  console.log("User rewardDebt:", user.rewardDebt.toString());
  console.log("User pendingRewards:", hre.ethers.formatEther(user.pendingRewards));

  // Manual test: stake small, wait, check, unstake
  console.log("\n=== 3. MANUAL FARMING TEST ===");
  const stakeAmt = hre.ethers.parseEther("10");

  // First unstake anything stuck from smoke test
  if (user.amount > 0n) {
    console.log("Found", hre.ethers.formatEther(user.amount), "DLUZ stuck. Trying unstake...");
    try {
      const tx = await farming.unstake(0, user.amount);
      const r = await tx.wait();
      console.log("  Unstake status:", r.status);
    } catch(e) {
      console.log("  Unstake failed:", e.message.slice(0, 300));
    }
  }

  let tx = await dluz.approve(c.DLuzFarming, stakeAmt);
  await tx.wait();

  console.log("Staking 10 DLUZ...");
  tx = await farming.stake(0, stakeAmt);
  await tx.wait();

  console.log("Waiting 5s...");
  await new Promise(r => setTimeout(r, 5000));

  const pending = await farming.pendingReward(0, signer.address);
  console.log("Pending after 5s:", pending.toString(), "raw");
  console.log("Pending after 5s:", hre.ethers.formatEther(pending), "formatted");

  console.log("Unstaking 10 DLUZ...");
  try {
    tx = await farming.unstake(0, stakeAmt);
    const receipt = await tx.wait();
    console.log("  ✅ Unstake OK, status:", receipt.status);
  } catch(e) {
    console.log("  ❌ Unstake failed:", e.message.slice(0, 500));
  }
}

main().catch(console.error);
