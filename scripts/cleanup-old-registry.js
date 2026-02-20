const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const OLD_REG = "0x57FAC26a1e71244A0c50286a548CB40cDb7D8aA9";

  const dCarbon = await hre.ethers.getContractAt("DCarbonToken", "0xE7A1346F1Cf2762d72B01d5577232b2744a46DeB");
  const dEnergy = await hre.ethers.getContractAt("DEnergyToken", "0xD0C139cE2653a11Ece8a07B0e2834aEE7EF2E84F");

  const MINTER_ROLE = await dCarbon.MINTER_ROLE();

  console.log("═══════════════════════════════════════════");
  console.log("  Cleanup — Revoke Old Registry V1 Roles");
  console.log("═══════════════════════════════════════════\n");

  // ─── dCARBON ──────────────────────────────────────────
  const carbonMinter = await dCarbon.hasRole(MINTER_ROLE, OLD_REG);
  console.log("dCARBON MINTER_ROLE on V1:", carbonMinter);
  if (carbonMinter) {
    const tx = await dCarbon.revokeRole(MINTER_ROLE, OLD_REG);
    await tx.wait();
    console.log("  Revoked ✅");
  } else {
    console.log("  Already clean ✅");
  }

  // ─── dENERGY ──────────────────────────────────────────
  const energyMinter = await dEnergy.hasRole(MINTER_ROLE, OLD_REG);
  console.log("dENERGY MINTER_ROLE on V1:", energyMinter);
  if (energyMinter) {
    const tx = await dEnergy.revokeRole(MINTER_ROLE, OLD_REG);
    await tx.wait();
    console.log("  Revoked ✅");
  } else {
    console.log("  Already clean ✅");
  }

  console.log("\n═══════════════════════════════════════════");
  console.log("  Old Registry V1 fully decommissioned ✅");
  console.log("═══════════════════════════════════════════");
}

main().then(function () { process.exit(0); }).catch(function (e) { console.error(e); process.exit(1); });
