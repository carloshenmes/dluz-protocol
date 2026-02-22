const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * dLuz Protocol — Token Distribution
 * 
 * Distributes the 250M DLUZ remaining in deployer wallet:
 *   - 100M Team     → TeamVesting (cliff 6m, vesting 24m)
 *   -  50M Marketing → TeamVesting (cliff 0, vesting 12m)
 *   -  50M Treasury  → TeamVesting (cliff 3m, vesting 15m)
 *   -  50M Reserved  → stays in deployer (future use)
 * 
 * Usage:
 *   1. Fill BENEFICIARIES below
 *   2. npx hardhat run scripts/distribute-mainnet.js --network baseSepolia
 *   3. npx hardhat run scripts/distribute-mainnet.js --network base
 */

// ═══════════════════════════════════════════════════════════════
// CONFIG — FILL BEFORE RUNNING
// ═══════════════════════════════════════════════════════════════
const BENEFICIARIES = {
  team: [
    // { address: "0x...", amount: 100_000_000 },
  ],
  marketing: [
    // { address: "0x...", amount: 50_000_000 },
  ],
  treasury: [
    // { address: "0x...", amount: 50_000_000 },
  ],
};

const MONTH = 30 * 24 * 60 * 60;
const VESTING_PARAMS = {
  team:      { cliff: 6 * MONTH, duration: 24 * MONTH },
  marketing: { cliff: 0,         duration: 12 * MONTH },
  treasury:  { cliff: 3 * MONTH, duration: 15 * MONTH },
};

// ═══════════════════════════════════════════════════════════════

async function main() {
  const network = hre.network.name;
  const deployPath = path.join(__dirname, "..", "deployments", `${network}.json`);

  if (!fs.existsSync(deployPath)) {
    console.error("❌ No deployment found for:", network);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));
  const [deployer] = await hre.ethers.getSigners();
  const c = deployment.contracts;

  // Validate config
  const teamTotal = BENEFICIARIES.team.reduce((s, b) => s + b.amount, 0);
  const mktgTotal = BENEFICIARIES.marketing.reduce((s, b) => s + b.amount, 0);
  const treasuryTotal = BENEFICIARIES.treasury.reduce((s, b) => s + b.amount, 0);
  const grandTotal = teamTotal + mktgTotal + treasuryTotal;

  if (BENEFICIARIES.team.length === 0) {
    console.error("❌ Fill BENEFICIARIES in the script before running");
    console.error("   Team:      100,000,000 DLUZ (cliff 6m, vesting 24m)");
    console.error("   Marketing:  50,000,000 DLUZ (cliff 0, vesting 12m)");
    console.error("   Treasury:   50,000,000 DLUZ (cliff 3m, vesting 15m)");
    process.exit(1);
  }

  if (grandTotal !== 200_000_000) {
    console.error(`❌ Total must be 200,000,000. Got: ${grandTotal.toLocaleString()}`);
    process.exit(1);
  }

  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   dLuz Protocol — Token Distribution              ║");
  console.log("╚═══════════════════════════════════════════════════╝");
  console.log("  Network:", network);
  console.log("  Deployer:", deployer.address);
  console.log("  TeamVesting:", c.TeamVesting);
  console.log("");

  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);
  const vesting = await hre.ethers.getContractAt("TeamVesting", c.TeamVesting);

  const balance = await dluz.balanceOf(deployer.address);
  console.log("  Deployer DLUZ balance:", hre.ethers.formatEther(balance));

  const needed = hre.ethers.parseUnits(grandTotal.toString(), 18);
  if (balance < needed) {
    console.error("❌ Insufficient DLUZ. Need:", hre.ethers.formatEther(needed));
    process.exit(1);
  }

  // Process each category
  async function processCategory(name, beneficiaries, params) {
    console.log(`\n━━━ ${name} ━━━`);
    for (const b of beneficiaries) {
      const amount = hre.ethers.parseUnits(b.amount.toString(), 18);
      console.log(`  ${b.address}: ${b.amount.toLocaleString()} DLUZ`);
      console.log(`    Cliff: ${params.cliff / MONTH}m | Duration: ${params.duration / MONTH}m`);

      // Approve
      let tx = await dluz.approve(c.TeamVesting, amount);
      await tx.wait();

      // Create vesting
      tx = await vesting.createVesting(
        b.address,
        amount,
        params.cliff,
        params.duration
      );
      await tx.wait();
      console.log("    ✅ Vesting created");
    }
  }

  await processCategory("Team (100M)", BENEFICIARIES.team, VESTING_PARAMS.team);
  await processCategory("Marketing (50M)", BENEFICIARIES.marketing, VESTING_PARAMS.marketing);
  await processCategory("Treasury (50M)", BENEFICIARIES.treasury, VESTING_PARAMS.treasury);

  // Final balance
  const finalBalance = await dluz.balanceOf(deployer.address);
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║  ✅ Distribution Complete                          ║");
  console.log("╠═══════════════════════════════════════════════════╣");
  console.log("║  Team:       ", teamTotal.toLocaleString().padStart(13), "DLUZ (locked)  ║");
  console.log("║  Marketing:  ", mktgTotal.toLocaleString().padStart(13), "DLUZ (locked)  ║");
  console.log("║  Treasury:   ", treasuryTotal.toLocaleString().padStart(13), "DLUZ (locked)  ║");
  console.log("║  Deployer:   ", hre.ethers.formatEther(finalBalance), "DLUZ (free)");
  console.log("╚═══════════════════════════════════════════════════╝");

  // Save distribution record
  const record = {
    network,
    timestamp: new Date().toISOString(),
    vestingContract: c.TeamVesting,
    distributions: { team: BENEFICIARIES.team, marketing: BENEFICIARIES.marketing, treasury: BENEFICIARIES.treasury },
    vestingParams: VESTING_PARAMS,
    deployerRemainingBalance: hre.ethers.formatEther(finalBalance),
  };

  const distPath = path.join(__dirname, "..", "deployments", `distribution-${network}-${Date.now()}.json`);
  fs.writeFileSync(distPath, JSON.stringify(record, null, 2));
  console.log("\n  📄 Saved:", distPath);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Distribution failed:", e);
    process.exit(1);
  });
