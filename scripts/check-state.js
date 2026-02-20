const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const deployment = JSON.parse(fs.readFileSync("deployments/baseSepolia.json", "utf8"));
  console.log("🔍 dLuz Protocol — Estado dos contratos na Base Sepolia\n");

  // 1. DLuzToken — Owner
  const dluz = await hre.ethers.getContractAt("DLuzToken", deployment.contracts.DLuzToken);
  const owner = await dluz.owner();
  console.log("DLuzToken owner:", owner);
  console.log("  É o deployer?", owner.toLowerCase() === deployment.deployer.toLowerCase());
  console.log("  É o Registry?", owner.toLowerCase() === deployment.contracts.CarbonRegistry.toLowerCase());

  // 2. DCarbonToken — Roles
  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", deployment.contracts.DCarbonToken);
  console.log("\nDCarbonToken MINTER_ROLE:");
  console.log("  Registry é minter?", await dcarbon.hasRole(MINTER_ROLE, deployment.contracts.CarbonRegistry));
  console.log("  Deployer é minter?", await dcarbon.hasRole(MINTER_ROLE, deployment.deployer));

  // 3. DEnergyToken — Roles
  const denergy = await hre.ethers.getContractAt("DEnergyToken", deployment.contracts.DEnergyToken);
  console.log("\nDEnergyToken MINTER_ROLE:");
  console.log("  Registry é minter?", await denergy.hasRole(MINTER_ROLE, deployment.contracts.CarbonRegistry));
  console.log("  Deployer é minter?", await denergy.hasRole(MINTER_ROLE, deployment.deployer));

  // 4. Supply
  console.log("\nSupply atual:");
  console.log("  DLUZ:", hre.ethers.formatUnits(await dluz.totalSupply(), 18));
  console.log("  dCARBON:", hre.ethers.formatUnits(await dcarbon.totalSupply(), 18));
  console.log("  dENERGY:", hre.ethers.formatUnits(await denergy.totalSupply(), 18));

  // 5. Registry
  const registry = await hre.ethers.getContractAt("CarbonRegistry", deployment.contracts.CarbonRegistry);
  console.log("\nCarbonRegistry:");
  console.log("  Total retired:", hre.ethers.formatUnits(await registry.totalRetired(), 18), "tCO2");
  console.log("  Total retirements:", (await registry.totalRetirements()).toString());
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
