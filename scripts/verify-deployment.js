const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * dLuz Protocol — Post-Deploy Verification
 * 
 * Validates ALL contracts, roles, balances, and configurations on-chain.
 * 
 * Usage:
 *   npx hardhat run scripts/verify-deployment.js --network baseSepolia
 *   npx hardhat run scripts/verify-deployment.js --network base
 */

async function main() {
  const network = hre.network.name;
  const deployPath = path.join(__dirname, "..", "deployments", `${network}.json`);

  if (!fs.existsSync(deployPath)) {
    console.error("❌ No deployment found for network:", network);
    console.error("   Expected:", deployPath);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));
  const [deployer] = await hre.ethers.getSigners();
  const c = deployment.contracts;

  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   dLuz Protocol — Deployment Verification         ║");
  console.log("╚═══════════════════════════════════════════════════╝");
  console.log("  Network:", network);
  console.log("  Deployer:", deployer.address);
  console.log("  Deploy timestamp:", deployment.timestamp);
  console.log("");

  let passed = 0;
  let failed = 0;

  function check(label, condition) {
    if (condition) {
      console.log("  ✅", label);
      passed++;
    } else {
      console.log("  ❌", label);
      failed++;
    }
  }

  // ── 1. Contract existence ──
  console.log("━━━ 1. Contract Existence ━━━\n");

  const contractNames = [
    "DLuzToken", "DCarbonToken", "DEnergyToken",
    "CarbonBridge", "CarbonRegistry", "DLuzSale",
    "TeamVesting", "DLuzDEX", "DLuzFarming"
  ];

  for (const name of contractNames) {
    const addr = c[name];
    if (!addr) {
      check(`${name} deployed`, false);
      continue;
    }
    const code = await hre.ethers.provider.getCode(addr);
    check(`${name} has code at ${addr.slice(0, 10)}...`, code !== "0x");
  }

  // ── 2. Token properties ──
  console.log("\n━━━ 2. Token Properties ━━━\n");

  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);
  check("DLUZ name = 'dLuz Token'", (await dluz.name()) === "dLuz Token");
  check("DLUZ symbol = 'DLUZ'", (await dluz.symbol()) === "DLUZ");
  check("DLUZ maxSupply = 1B", (await dluz.MAX_SUPPLY()) === hre.ethers.parseUnits("1000000000", 18));
  check("DLUZ owner = deployer", (await dluz.owner()) === deployer.address);

  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", c.DCarbonToken);
  check("dCARBON name = 'dCarbon Token'", (await dcarbon.name()) === "dCarbon Token");
  check("dCARBON symbol = 'dCARBON'", (await dcarbon.symbol()) === "dCARBON");

  const denergy = await hre.ethers.getContractAt("DEnergyToken", c.DEnergyToken);
  check("dENERGY name = 'dEnergy Token'", (await denergy.name()) === "dEnergy Token");
  check("dENERGY symbol = 'dENERGY'", (await denergy.symbol()) === "dENERGY");

  // ── 3. Roles ──
  console.log("\n━━━ 3. Access Control & Roles ━━━\n");

  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));

  check(
    "DCarbonToken: CarbonBridge has MINTER_ROLE",
    await dcarbon.hasRole(MINTER_ROLE, c.CarbonBridge)
  );
  check(
    "DEnergyToken: CarbonRegistry has MINTER_ROLE",
    await denergy.hasRole(MINTER_ROLE, c.CarbonRegistry)
  );

  // ── 4. CarbonBridge ──
  console.log("\n━━━ 4. CarbonBridge ━━━\n");

  const bridge = await hre.ethers.getContractAt("CarbonBridge", c.CarbonBridge);
  check("Bridge.dcarbon = DCarbonToken", (await bridge.dcarbon()) === c.DCarbonToken);
  check("Bridge.paused = false", (await bridge.paused()) === false);

  if (network === "base") {
    const BCT = "0x576bca23dcb6d94ff8e537d88b0d3e1bead444a2";
    check("Bridge accepts BCT", await bridge.acceptedTokens(BCT));
  } else if (c.MockBCT) {
    check("Bridge accepts MockBCT", await bridge.acceptedTokens(c.MockBCT));
  }

  // ── 5. CarbonRegistry ──
  console.log("\n━━━ 5. CarbonRegistry ━━━\n");

  const registry = await hre.ethers.getContractAt("CarbonRegistry", c.CarbonRegistry);
  check("Registry.energyRate = 1e18 (1:1)", (await registry.energyRate()) === hre.ethers.parseEther("1"));
  check("Registry.dluzRewardRate = 10e18 (10:1)", (await registry.dluzRewardRate()) === hre.ethers.parseEther("10"));
  check("Registry.dluzTreasury = deployer", (await registry.dluzTreasury()) === deployer.address);

  const registryAllowance = await dluz.allowance(deployer.address, c.CarbonRegistry);
  check(
    "DLUZ allowance for Registry >= 100M",
    registryAllowance >= hre.ethers.parseUnits("100000000", 18)
  );

  // ── 6. DLuzSale ──
  console.log("\n━━━ 6. DLuzSale ━━━\n");

  const sale = await hre.ethers.getContractAt("DLuzSale", c.DLuzSale);
  const saleBalance = await dluz.balanceOf(c.DLuzSale);
  check("Sale.saleActive = true", (await sale.saleActive()) === true);
  check(
    "Sale has 250M DLUZ",
    saleBalance === hre.ethers.parseUnits("250000000", 18)
  );
  check("Sale.rate = 3,125,000", (await sale.rate()) === hre.ethers.parseUnits("3125000", 18));

  // ── 7. DLuzDEX ──
  console.log("\n━━━ 7. DLuzDEX ━━━\n");

  const dex = await hre.ethers.getContractAt("DLuzDEX", c.DLuzDEX);
  const poolCount = await dex.getPoolCount();
  check("DEX has 2 pools", Number(poolCount) === 2);

  // ── 8. DLuzFarming ──
  console.log("\n━━━ 8. DLuzFarming ━━━\n");

  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const farmPoolCount = await farming.poolCount();
  check("Farming has 2 pools", Number(farmPoolCount) === 2);

  if (Number(farmPoolCount) >= 2) {
    const pool0 = await farming.getPoolInfo(0);
    check("Farming pool 0 reward = dCARBON", pool0.rewardToken === c.DCarbonToken);
    check("Farming pool 0 active", pool0.active === true);

    const pool1 = await farming.getPoolInfo(1);
    check("Farming pool 1 reward = dENERGY", pool1.rewardToken === c.DEnergyToken);
    check("Farming pool 1 active", pool1.active === true);
  }

  // ── 9. Balances ──
  console.log("\n━━━ 9. Token Balances ━━━\n");

  const deployerDluz = await dluz.balanceOf(deployer.address);
  const totalSupply = await dluz.totalSupply();
  const remainingMint = await dluz.remainingMintable();

  console.log("  ℹ️  DLUZ total supply:", hre.ethers.formatEther(totalSupply));
  console.log("  ℹ️  Deployer DLUZ:", hre.ethers.formatEther(deployerDluz));
  console.log("  ℹ️  Sale DLUZ:", hre.ethers.formatEther(saleBalance));
  console.log("  ℹ️  Remaining mintable:", hre.ethers.formatEther(remainingMint));

  check(
    "Deployer DLUZ = 250M (500M - 250M sale)",
    deployerDluz === hre.ethers.parseUnits("250000000", 18)
  );

  // ── SUMMARY ──
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log(`║  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log("║  ✅ ALL CHECKS PASSED — Ready for production");
  } else {
    console.log("║  ⚠️  ISSUES FOUND — Review before proceeding");
  }
  console.log("╚═══════════════════════════════════════════════════╝");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("❌ Verification failed:", e.message);
  process.exit(1);
});
