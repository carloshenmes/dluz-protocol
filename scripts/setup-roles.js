require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const network = hre.network.name;
  const deployment = JSON.parse(fs.readFileSync(`deployments/${network}.json`, "utf8"));
  const [deployer] = await hre.ethers.getSigners();

  console.log("🔐 dLuz Protocol — Role Setup");
  console.log("Network:", network);
  console.log("Admin:", deployer.address);

  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));

  // ─── DCarbonToken: Grant MINTER_ROLE to CarbonRegistry ───
  const dCarbon = await hre.ethers.getContractAt("DCarbonToken", deployment.contracts.DCarbonToken);
  const hasRoleCarbon = await dCarbon.hasRole(MINTER_ROLE, deployment.contracts.CarbonRegistry);

  if (!hasRoleCarbon) {
    const tx1 = await dCarbon.grantRole(MINTER_ROLE, deployment.contracts.CarbonRegistry);
    await tx1.wait();
    console.log("✅ DCarbonToken: MINTER_ROLE → CarbonRegistry");
  } else {
    console.log("⏭️  DCarbonToken: MINTER_ROLE já configurado");
  }

  // ─── DEnergyToken: Grant MINTER_ROLE to CarbonRegistry ───
  const dEnergy = await hre.ethers.getContractAt("DEnergyToken", deployment.contracts.DEnergyToken);
  const hasRoleEnergy = await dEnergy.hasRole(MINTER_ROLE, deployment.contracts.CarbonRegistry);

  if (!hasRoleEnergy) {
    const tx2 = await dEnergy.grantRole(MINTER_ROLE, deployment.contracts.CarbonRegistry);
    await tx2.wait();
    console.log("✅ DEnergyToken: MINTER_ROLE → CarbonRegistry");
  } else {
    console.log("⏭️  DEnergyToken: MINTER_ROLE já configurado");
  }

  // ─── DLuzToken: Ownership permanece com deployer ─────────
  const dLuz = await hre.ethers.getContractAt("DLuzToken", deployment.contracts.DLuzToken);
  const currentOwner = await dLuz.owner();
  console.log("\nℹ️  DLuzToken owner:", currentOwner);

  if (currentOwner === deployer.address) {
    console.log("✅ DLuzToken: ownership com deployer (futuro: transferir para multisig)");
  } else {
    console.log("⚠️  DLuzToken: ownership NÃO está com deployer! Owner atual:", currentOwner);
    console.log("   Se já transferiu para CarbonRegistry, a ownership está presa.");
    console.log("   Será necessário redeploy do DLuzToken.");
  }

  console.log("\n🎉 Role setup concluído!");
}

main().catch((error) => {
  console.error("❌ Erro:", error.message);
  process.exitCode = 1;
});
