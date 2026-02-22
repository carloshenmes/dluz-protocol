const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const registry = await hre.ethers.getContractAt("CarbonRegistry", c.CarbonRegistry);
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);

  const treasury = await registry.dluzTreasury();
  const rewardRate = await registry.dluzRewardRate();
  const energyRate = await registry.energyRate();
  const registryDluzAddr = await registry.dluzToken();

  console.log("=== REGISTRY DEBUG ===");
  console.log("Registry address:", c.CarbonRegistry);
  console.log("dluzToken (on registry):", registryDluzAddr);
  console.log("dluzToken (deployment):", c.DLuzToken);
  console.log("Match:", registryDluzAddr.toLowerCase() === c.DLuzToken.toLowerCase());
  console.log("");
  console.log("dluzTreasury:", treasury);
  console.log("dluzRewardRate:", hre.ethers.formatEther(rewardRate), "(raw:", rewardRate.toString() + ")");
  console.log("energyRate:", hre.ethers.formatEther(energyRate));
  console.log("");
  console.log("Treasury DLUZ balance:", hre.ethers.formatEther(await dluz.balanceOf(treasury)));
  console.log("Treasury → Registry allowance:", hre.ethers.formatEther(await dluz.allowance(treasury, c.CarbonRegistry)));
  console.log("Signer address:", signer.address);
  console.log("Signer is treasury:", signer.address.toLowerCase() === treasury.toLowerCase());
}

main().catch(console.error);
