import { ethers } from "hardhat";

/**
 * DLUZ Post-Deploy Distribution
 * 
 * Uses existing TeamVesting.sol for all vesting (3 instances).
 * Uses existing DLuzSale.sol or PinkSale for presale.
 * 
 * npx hardhat run scripts/distribute-tokens.ts --network baseSepolia
 */

// ═══════════════════════════════════════════════════════════════
// CONFIG — Preencher antes de rodar
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  dluzToken: "",           // Endereço do DLuzToken deployado
  presaleWallet: "",       // PinkSale ou DLuzSale address
  liquidityWallet: "",     // Wallet pra LP lock

  // Beneficiários de vesting
  team: [
    { address: "", amount: 100_000_000 },
  ],
  marketing: [
    { address: "", amount: 50_000_000 },
  ],
  treasury: [
    { address: "", amount: 50_000_000 },
  ],
};

// Durations em segundos
const MONTH = 30 * 24 * 60 * 60;
const VESTING = {
  team:      { cliff: 6 * MONTH, duration: 24 * MONTH },
  marketing: { cliff: 0,         duration: 12 * MONTH },
  treasury:  { cliff: 3 * MONTH, duration: 15 * MONTH },
};

const toWei = (n: number) => ethers.parseEther(n.toString());

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`\n🚀 Deployer: ${deployer.address}`);

  // Validate
  const allAddresses = [
    CONFIG.dluzToken, CONFIG.presaleWallet, CONFIG.liquidityWallet,
    ...CONFIG.team.map(t => t.address),
    ...CONFIG.marketing.map(t => t.address),
    ...CONFIG.treasury.map(t => t.address),
  ];
  if (allAddresses.some(a => !a)) {
    throw new Error("❌ Preencha todos os endereços no CONFIG");
  }

  const totalDist = 250_000_000 + 100_000_000 +
    CONFIG.team.reduce((s, t) => s + t.amount, 0) +
    CONFIG.marketing.reduce((s, t) => s + t.amount, 0) +
    CONFIG.treasury.reduce((s, t) => s + t.amount, 0);

  if (totalDist !== 500_000_000) {
    throw new Error(`❌ Total = ${totalDist}, esperado 500,000,000`);
  }

  const dluz = await ethers.getContractAt("DLuzToken", CONFIG.dluzToken);
  const balance = await dluz.balanceOf(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} DLUZ\n`);

  // ─── 1. TRANSFERS DIRETOS ────────────────────────────────
  console.log("━━━ 1. Transfers Diretos ━━━");

  console.log(`  Presale: 250M → ${CONFIG.presaleWallet}`);
  await (await dluz.transfer(CONFIG.presaleWallet, toWei(250_000_000))).wait();
  console.log(`  ✅ Done`);

  console.log(`  Liquidez: 100M → ${CONFIG.liquidityWallet}`);
  await (await dluz.transfer(CONFIG.liquidityWallet, toWei(100_000_000))).wait();
  console.log(`  ✅ Done`);

  // ─── 2. DEPLOY VESTING CONTRACTS ─────────────────────────
  console.log("\n━━━ 2. Deploy Vesting (3x TeamVesting) ━━━");
  const VestingFactory = await ethers.getContractFactory("TeamVesting");

  const teamVesting = await VestingFactory.deploy(CONFIG.dluzToken);
  await teamVesting.waitForDeployment();
  const teamAddr = await teamVesting.getAddress();
  console.log(`  ✅ Team Vesting:      ${teamAddr}`);

  const mktgVesting = await VestingFactory.deploy(CONFIG.dluzToken);
  await mktgVesting.waitForDeployment();
  const mktgAddr = await mktgVesting.getAddress();
  console.log(`  ✅ Marketing Vesting: ${mktgAddr}`);

  const treasuryVesting = await VestingFactory.deploy(CONFIG.dluzToken);
  await treasuryVesting.waitForDeployment();
  const treasuryAddr = await treasuryVesting.getAddress();
  console.log(`  ✅ Treasury Vesting:  ${treasuryAddr}`);

  // ─── 3. APPROVE + CREATE SCHEDULES ───────────────────────
  console.log("\n━━━ 3. Approve & Create Schedules ━━━");

  // Team
  for (const member of CONFIG.team) {
    const amt = toWei(member.amount);
    console.log(`  Team: ${member.amount.toLocaleString()} → ${member.address}`);
    await (await dluz.approve(teamAddr, amt)).wait();
    await (await teamVesting.createVesting(
      member.address, amt,
      VESTING.team.cliff, VESTING.team.duration
    )).wait();
    console.log(`    ✅ Cliff 6m | Vesting 24m`);
  }

  // Marketing
  for (const wallet of CONFIG.marketing) {
    const amt = toWei(wallet.amount);
    console.log(`  Marketing: ${wallet.amount.toLocaleString()} → ${wallet.address}`);
    await (await dluz.approve(mktgAddr, amt)).wait();
    await (await mktgVesting.createVesting(
      wallet.address, amt,
      VESTING.marketing.cliff, VESTING.marketing.duration
    )).wait();
    console.log(`    ✅ Cliff 0 | Vesting 12m`);
  }

  // Treasury
  for (const wallet of CONFIG.treasury) {
    const amt = toWei(wallet.amount);
    console.log(`  Treasury: ${wallet.amount.toLocaleString()} → ${wallet.address}`);
    await (await dluz.approve(treasuryAddr, amt)).wait();
    await (await treasuryVesting.createVesting(
      wallet.address, amt,
      VESTING.treasury.cliff, VESTING.treasury.duration
    )).wait();
    console.log(`    ✅ Cliff 3m | Vesting 15m`);
  }

  // ─── 4. SUMMARY ──────────────────────────────────────────
  const remaining = await dluz.remainingMintable();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ DISTRIBUIÇÃO COMPLETA");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Presale:     250,000,000 → ${CONFIG.presaleWallet}`);
  console.log(`  Liquidez:    100,000,000 → ${CONFIG.liquidityWallet}`);
  console.log(`  Team:        100,000,000 → ${teamAddr} (locked)`);
  console.log(`  Marketing:    50,000,000 → ${mktgAddr} (locked)`);
  console.log(`  Treasury:     50,000,000 → ${treasuryAddr} (locked)`);
  console.log(`  ────────────────────────────────────────────`);
  console.log(`  Mintable:    ${ethers.formatEther(remaining)} DLUZ`);
  console.log(`  (Rewards 250M + Ecosystem 150M + Buffer 100M)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Save
  const info = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      dluzToken: CONFIG.dluzToken,
      teamVesting: teamAddr,
      marketingVesting: mktgAddr,
      treasuryVesting: treasuryAddr,
    },
    distributions: {
      presale: { to: CONFIG.presaleWallet, amount: "250000000" },
      liquidity: { to: CONFIG.liquidityWallet, amount: "100000000" },
      team: CONFIG.team.map(t => ({ to: t.address, amount: t.amount.toString(), vestingContract: teamAddr })),
      marketing: CONFIG.marketing.map(t => ({ to: t.address, amount: t.amount.toString(), vestingContract: mktgAddr })),
      treasury: CONFIG.treasury.map(t => ({ to: t.address, amount: t.amount.toString(), vestingContract: treasuryAddr })),
    },
    vestingParams: VESTING,
  };

  const fs = await import("fs");
  const path = `deployments/distribution-${(await ethers.provider.getNetwork()).name}-${Date.now()}.json`;
  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(path, JSON.stringify(info, null, 2));
  console.log(`\n📄 Saved: ${path}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
