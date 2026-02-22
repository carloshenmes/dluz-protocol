const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");
async function main() {
  const c = dep.contracts;
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const [rewardToken, rewardPerSec, totalStaked, active] = await farming.getPoolInfo(0);
  console.log("Pool 0:");
  console.log("  rewardToken:", rewardToken);
  console.log("  rewardPerSec:", hre.ethers.formatEther(rewardPerSec));
  console.log("  totalStaked:", hre.ethers.formatEther(totalStaked));
  console.log("  active:", active);
  console.log("\nContracts:");
  console.log("  DCarbonToken:", c.DCarbonToken);
  console.log("  DEnergyToken:", c.DEnergyToken);
  console.log("  DLuzToken:", c.DLuzToken);

  // Saldo do reward token no Farming
  const rt = await hre.ethers.getContractAt("IERC20", rewardToken);
  console.log("\nReward token balance in Farming:", hre.ethers.formatEther(await rt.balanceOf(c.DLuzFarming)));

  // Checar DLuzSale mais a fundo
  const sale = await hre.ethers.getContractAt("DLuzSale", c.DLuzSale);
  try { console.log("\nSale price:", hre.ethers.formatEther(await sale.price())); } catch(e) {}
  try { console.log("Sale rate:", (await sale.rate()).toString()); } catch(e) {}
  try { console.log("Sale paused:", await sale.paused()); } catch(e) {}
}
main().catch(console.error);
