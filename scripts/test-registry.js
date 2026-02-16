const hre = require("hardhat");
const deployment = require("../deployments/baseSepolia.json");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Tester:", deployer.address);

  const registry = await hre.ethers.getContractAt(
    "CarbonRegistry",
    deployment.contracts.CarbonRegistry
  );

  console.log("\nRegistrando credito de carbono...");
  const tx = await registry.registerCredit(
    deployer.address,
    100,
    0,
    "Solar Farm RJ - Teste",
    "Brazil",
    hre.ethers.encodeBytes32String("test-doc-hash")
  );
  const receipt = await tx.wait();
  console.log("  TX:", receipt.hash);

  const dcarbon = await hre.ethers.getContractAt(
    "DCarbonToken",
    deployment.contracts.DCarbonToken
  );
  const balance = await dcarbon.balanceOf(deployer.address);
  console.log("  dCARBON balance:", hre.ethers.formatUnits(balance, 18));

  console.log("\nRegistry funcionando!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
