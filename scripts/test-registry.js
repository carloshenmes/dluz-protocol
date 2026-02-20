const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const network = hre.network.name;
  const deployment = JSON.parse(fs.readFileSync(`deployments/${network}.json`, "utf8"));
  const [deployer] = await hre.ethers.getSigners();

  console.log("🧪 dLuz Protocol — Registry Test");
  console.log("Network:", network);
  console.log("Tester:", deployer.address);

  // Instanciar contratos
  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", deployment.contracts.DCarbonToken);
  const registry = await hre.ethers.getContractAt("CarbonRegistry", deployment.contracts.CarbonRegistry);

  // 1. Mint dCARBON para o deployer (ele já tem MINTER_ROLE)
  const mintAmount = hre.ethers.parseUnits("10", 18); // 10 tonnes CO2
  console.log("\n1️⃣  Mintando 10 dCARBON...");
  const tx1 = await dcarbon.mint(deployer.address, mintAmount);
  await tx1.wait();
  console.log("   TX:", tx1.hash);

  const balanceBefore = await dcarbon.balanceOf(deployer.address);
  console.log("   Balance:", hre.ethers.formatUnits(balanceBefore, 18), "dCARBON");

  // 2. Approve Registry para gastar dCARBON
  const retireAmount = hre.ethers.parseUnits("3", 18); // Retire 3 tonnes
  console.log("\n2️⃣  Aprovando Registry para gastar 3 dCARBON...");
  const tx2 = await dcarbon.approve(deployment.contracts.CarbonRegistry, retireAmount);
  await tx2.wait();
  console.log("   TX:", tx2.hash);

  // 3. Retire via Registry
  console.log("\n3️⃣  Retirando 3 dCARBON via Registry...");
  const tx3 = await registry.retire(retireAmount, "Teste dLuz Protocol - offset 2026");
  await tx3.wait();
  console.log("   TX:", tx3.hash);

  // 4. Verificar resultados
  const balanceAfter = await dcarbon.balanceOf(deployer.address);
  const totalRetired = await registry.totalRetired();
  const totalRetirements = await registry.totalRetirements();
  const record = await registry.getRetirement(0);

  console.log("\n✅ Resultados:");
  console.log("   Balance após retire:", hre.ethers.formatUnits(balanceAfter, 18), "dCARBON");
  console.log("   Total retired (global):", hre.ethers.formatUnits(totalRetired, 18), "tCO2");
  console.log("   Total retirements:", totalRetirements.toString());
  console.log("   Record #0:", {
    retiree: record.retiree,
    amount: hre.ethers.formatUnits(record.amount, 18),
    reason: record.reason,
    timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
  });

  console.log("\n🎉 Registry funcionando corretamente!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Erro:", e.message);
    process.exit(1);
  });
