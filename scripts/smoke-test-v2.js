const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  const deployPath = path.join(__dirname, "..", "deployments", `${network}.json`);
  const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));
  const [deployer] = await hre.ethers.getSigners();
  const c = deployment.contracts;

  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   dLuz Protocol — Smoke Test v2                   ║");
  console.log("╚═══════════════════════════════════════════════════╝");
  console.log("  Network:", network);
  console.log("  Tester:", deployer.address);
  console.log("");

  let passed = 0;
  let failed = 0;

  function check(label, condition) {
    if (condition) { console.log("  ✅", label); passed++; }
    else { console.log("  ❌", label); failed++; }
  }

  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);
  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", c.DCarbonToken);
  const denergy = await hre.ethers.getContractAt("DEnergyToken", c.DEnergyToken);
  const bridge = await hre.ethers.getContractAt("CarbonBridge", c.CarbonBridge);
  const registry = await hre.ethers.getContractAt("CarbonRegistry", c.CarbonRegistry);
  const sale = await hre.ethers.getContractAt("DLuzSale", c.DLuzSale);
  const dex = await hre.ethers.getContractAt("DLuzDEX", c.DLuzDEX);
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const mockBCT = await hre.ethers.getContractAt("MockBCT", c.MockBCT);

  // ═══ TEST 1: Buy DLUZ ═══
  console.log("━━━ Test 1: Buy DLUZ via DLuzSale ━━━\n");
  {
    const before = await dluz.balanceOf(deployer.address);
    const tx = await sale.buy({ value: hre.ethers.parseEther("0.001") });
    await tx.wait();
    const after = await dluz.balanceOf(deployer.address);
    const received = after - before;
    console.log("  Sent: 0.001 ETH → Received:", hre.ethers.formatEther(received), "DLUZ");
    check("DLuzSale: bought DLUZ", received > 0n);
  }

  // ═══ TEST 2: Deposit MockBCT → dCARBON ═══
  console.log("\n━━━ Test 2: Deposit MockBCT → dCARBON ━━━\n");
  {
    const depositAmount = hre.ethers.parseEther("50");

    let tx = await mockBCT.approve(c.CarbonBridge, depositAmount);
    await tx.wait();

    const before = await dcarbon.balanceOf(deployer.address);
    console.log("  dCARBON before:", hre.ethers.formatEther(before));

    tx = await bridge.deposit(c.MockBCT, depositAmount);
    const receipt = await tx.wait();
    console.log("  TX status:", receipt.status);

    const after = await dcarbon.balanceOf(deployer.address);
    console.log("  dCARBON after:", hre.ethers.formatEther(after));

    const received = after - before;
    console.log("  dCARBON received:", hre.ethers.formatEther(received));
    check("CarbonBridge: deposit 50 MockBCT → 50 dCARBON", received === depositAmount);
  }

  // ═══ TEST 3: Retire dCARBON → dENERGY + DLUZ ═══
  console.log("\n━━━ Test 3: Retire dCARBON → dENERGY + DLUZ ━━━\n");
  {
    const retireAmount = hre.ethers.parseEther("10");

    let tx = await dcarbon.approve(c.CarbonRegistry, retireAmount);
    await tx.wait();

    const dluzBefore = await dluz.balanceOf(deployer.address);
    const denergyBefore = await denergy.balanceOf(deployer.address);
    const dcarbonBefore = await dcarbon.balanceOf(deployer.address);

    tx = await registry.retire(retireAmount, "dLuz smoke test v2");
    const receipt = await tx.wait();
    console.log("  TX status:", receipt.status);

    const dluzAfter = await dluz.balanceOf(deployer.address);
    const denergyAfter = await denergy.balanceOf(deployer.address);
    const dcarbonAfter = await dcarbon.balanceOf(deployer.address);

    const dcarbonBurned = dcarbonBefore - dcarbonAfter;
    const denergyMinted = denergyAfter - denergyBefore;
    const dluzRewarded = dluzAfter - dluzBefore;

    console.log("  dCARBON burned:", hre.ethers.formatEther(dcarbonBurned));
    console.log("  dENERGY minted:", hre.ethers.formatEther(denergyMinted));
    console.log("  DLUZ rewarded:", hre.ethers.formatEther(dluzRewarded));

    check("Registry: 10 dCARBON burned", dcarbonBurned === retireAmount);
    check("Registry: 10 dENERGY minted (1:1)", denergyMinted === retireAmount);
    check("Registry: 100 DLUZ reward (10:1)", dluzRewarded === hre.ethers.parseEther("100"));
  }

  // ═══ TEST 4: Farming ═══
  console.log("\n━━━ Test 4: Stake DLUZ in Farming ━━━\n");
  {
    const stakeAmount = hre.ethers.parseEther("1000");

    let tx = await dluz.approve(c.DLuzFarming, stakeAmount);
    await tx.wait();

    tx = await farming.stake(0, stakeAmount);
    await tx.wait();
    check("Farming: staked 1,000 DLUZ", true);

    console.log("  Waiting 3s...");
    await new Promise(r => setTimeout(r, 3000));

    const pending = await farming.pendingReward(0, deployer.address);
    console.log("  Pending reward:", hre.ethers.formatEther(pending));
    check("Farming: rewards accruing", pending > 0n);

    tx = await farming.unstake(0, stakeAmount);
    await tx.wait();
    check("Farming: unstaked successfully", true);
  }

  // ═══ TEST 5: DEX Swap ═══
  console.log("\n━━━ Test 5: DEX Swap ━━━\n");
  {
    const swapAmount = hre.ethers.parseEther("100");

    let tx = await dluz.approve(c.DLuzDEX, swapAmount);
    await tx.wait();

    const before = await dcarbon.balanceOf(deployer.address);
    tx = await dex.swap(c.DLuzToken, c.DCarbonToken, swapAmount, 1);
    await tx.wait();
    const after = await dcarbon.balanceOf(deployer.address);

    const received = after - before;
    console.log("  Swapped: 100 DLUZ →", hre.ethers.formatEther(received), "dCARBON");
    check("DEX: swap executed", received > 0n);
  }

  // ═══ SUMMARY ═══
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log(`║  Smoke Test v2: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log("║  ✅ ALL FLOWS WORKING — Protocol ready for mainnet");
  } else {
    console.log("║  ⚠️  Some flows failed — investigate before mainnet");
  }
  console.log("╚═══════════════════════════════════════════════════╝");

  if (failed === 0) {
    console.log("\n  🚀 MAINNET DEPLOY COMMAND:");
    console.log("  npx hardhat run scripts/deploy-mainnet.js --network base\n");
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
