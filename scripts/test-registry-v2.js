const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const DCARBON  = "0xE7A1346F1Cf2762d72B01d5577232b2744a46DeB";
  const DENERGY  = "0xD0C139cE2653a11Ece8a07B0e2834aEE7EF2E84F";
  const DLUZ     = "0xED21166a02685817Ef77f77Db42557576b4Fca5e";
  const REGISTRY = "0x5f40481a41DF8588D88042F0a461Fcb237b7deB3";

  const dCarbon  = await hre.ethers.getContractAt("DCarbonToken", DCARBON);
  const dEnergy  = await hre.ethers.getContractAt("DEnergyToken", DENERGY);
  const dluz     = await hre.ethers.getContractAt("DLuzToken", DLUZ);
  const registry = await hre.ethers.getContractAt("CarbonRegistry", REGISTRY);

  const amount = hre.ethers.parseEther("1"); // 1 tCO2

  console.log("═══════════════════════════════════════════");
  console.log("  dLuz Protocol — Test CarbonRegistry V2");
  console.log("═══════════════════════════════════════════\n");

  // ─── Balances BEFORE ──────────────────────────────────
  const dCarbonBefore = await dCarbon.balanceOf(deployer.address);
  const dEnergyBefore = await dEnergy.balanceOf(deployer.address);
  const dluzBefore    = await dluz.balanceOf(deployer.address);

  console.log("BEFORE retire:");
  console.log("  dCARBON:", hre.ethers.formatEther(dCarbonBefore));
  console.log("  dENERGY:", hre.ethers.formatEther(dEnergyBefore));
  console.log("  DLUZ:   ", hre.ethers.formatEther(dluzBefore));

  // ─── Check dCARBON balance ────────────────────────────
  if (dCarbonBefore < amount) {
    console.log("\n⚠️  Minting 1 dCARBON for test...");
    const MINTER_ROLE = await dCarbon.MINTER_ROLE();
    const hasMinter = await dCarbon.hasRole(MINTER_ROLE, deployer.address);
    if (!hasMinter) {
      const tx = await dCarbon.grantRole(MINTER_ROLE, deployer.address);
      await tx.wait();
    }
    const tx = await dCarbon.mint(deployer.address, amount);
    await tx.wait();
    console.log("     Minted 1 dCARBON ✅");
  }

  // ─── Approve dCARBON to Registry ──────────────────────
  console.log("\nApproving dCARBON...");
  const tx1 = await dCarbon.approve(REGISTRY, amount);
  await tx1.wait();
  console.log("  Approved ✅");

  // ─── Retire ───────────────────────────────────────────
  console.log("\nRetiring 1 tCO2...");
  const tx2 = await registry.retire(amount, "dLuz Protocol V2 test — 1 tCO2 retired");
  const receipt = await tx2.wait();
  console.log("  Tx:", receipt.hash);
  console.log("  Gas used:", receipt.gasUsed.toString());

  // ─── Balances AFTER ───────────────────────────────────
  const dCarbonAfter = await dCarbon.balanceOf(deployer.address);
  const dEnergyAfter = await dEnergy.balanceOf(deployer.address);
  const dluzAfter    = await dluz.balanceOf(deployer.address);

  console.log("\nAFTER retire:");
  console.log("  dCARBON:", hre.ethers.formatEther(dCarbonAfter));
  console.log("  dENERGY:", hre.ethers.formatEther(dEnergyAfter));
  console.log("  DLUZ:   ", hre.ethers.formatEther(dluzAfter));

  // ─── Deltas ───────────────────────────────────────────
  const dCarbonDelta = dCarbonAfter - dCarbonBefore;
  const dEnergyDelta = dEnergyAfter - dEnergyBefore;
  const dluzDelta    = dluzAfter - dluzBefore;

  console.log("\nDELTAS:");
  console.log("  dCARBON:", hre.ethers.formatEther(dCarbonDelta), "(expected: -1.0)");
  console.log("  dENERGY:", hre.ethers.formatEther(dEnergyDelta), "(expected: +1.0)");
  console.log("  DLUZ:   ", hre.ethers.formatEther(dluzDelta),    "(expected: +10.0)");

  // ─── Registry state ───────────────────────────────────
  const totalRetired = await registry.totalRetired();
  const totalCount   = await registry.totalRetirements();
  const record       = await registry.getRetirement(0);

  console.log("\nREGISTRY STATE:");
  console.log("  Total retired:", hre.ethers.formatEther(totalRetired), "tCO2");
  console.log("  Total records:", totalCount.toString());
  console.log("  Record #0:", record.retiree, "|", hre.ethers.formatEther(record.amount), "tCO2 |", record.reason);

  console.log("\n═══════════════════════════════════════════");
  console.log("  ALL CHECKS PASSED ✅");
  console.log("═══════════════════════════════════════════");
}

main().then(function () { process.exit(0); }).catch(function (e) { console.error(e); process.exit(1); });
