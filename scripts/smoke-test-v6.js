const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;
  const parse = hre.ethers.parseEther;
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);
  const dcarbon = await hre.ethers.getContractAt("IERC20", c.DCarbonToken);
  const denergy = await hre.ethers.getContractAt("IERC20", c.DEnergyToken);
  const sale = await hre.ethers.getContractAt("DLuzSale", c.DLuzSale);
  const bridge = await hre.ethers.getContractAt("CarbonBridge", c.CarbonBridge);
  const registry = await hre.ethers.getContractAt("CarbonRegistry", c.CarbonRegistry);
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const mockBCT = await hre.ethers.getContractAt("IERC20", c.MockBCT);

  const ok = [], fail = [];
  const check = (name, pass) => { (pass ? ok : fail).push(name); console.log(`  ${pass ? "✅" : "❌"} ${name}`); };

  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   dLuz Protocol — Smoke Test v6 (final)           ║");
  console.log("╚═══════════════════════════════════════════════════╝");
  console.log(`  Network: ${hre.network.name}`);
  console.log(`  Tester: ${signer.address}\n`);

  // ━━━ Test 1: Buy DLUZ ━━━
  console.log("━━━ Test 1: Buy DLUZ via DLuzSale ━━━");
  const dluzBefore = await dluz.balanceOf(signer.address);
  await (await sale.buy({ value: parse("0.001") })).wait();
  const dluzDelta = (await dluz.balanceOf(signer.address)) - dluzBefore;
  console.log(`  Sent: 0.001 ETH → Received: ${fmt(dluzDelta)} DLUZ`);
  check("DLuzSale: bought DLUZ", dluzDelta > 0n);

  // ━━━ Test 2: Deposit MockBCT → dCARBON ━━━
  console.log("\n━━━ Test 2: Deposit MockBCT → dCARBON ━━━");
  const dcBefore = await dcarbon.balanceOf(signer.address);
  await (await mockBCT.approve(c.CarbonBridge, parse("50"))).wait();
  await (await bridge.deposit(c.MockBCT, parse("50"))).wait();
  const dcDelta = (await dcarbon.balanceOf(signer.address)) - dcBefore;
  console.log(`  dCARBON received: ${fmt(dcDelta)}`);
  check("CarbonBridge: MockBCT → dCARBON", dcDelta > 0n);

  // ━━━ Test 3: Retire dCARBON → dENERGY ━━━
  console.log("\n━━━ Test 3: Retire dCARBON → dENERGY ━━━");
  const deBefore = await denergy.balanceOf(signer.address);
  await (await dcarbon.approve(c.CarbonRegistry, parse("10"))).wait();
  await (await registry.retire(parse("10"), "Smoke test v6 - carbon offset")).wait();
  const deDelta = (await denergy.balanceOf(signer.address)) - deBefore;
  console.log(`  dCARBON burned: 10 → dENERGY minted: ${fmt(deDelta)}`);
  check("Registry: dCARBON → dENERGY (1:1)", deDelta === parse("10"));

  // ━━━ Test 4: Farming full cycle ━━━
  console.log("\n━━━ Test 4: Farming (stake → accrue → claim → unstake) ━━━");

  // Check current staked amount first
  const [userAmt] = await farming.getUserInfo(0, signer.address);
  console.log(`  Current staked: ${fmt(userAmt)} DLUZ`);

  // 4a: Stake
  const stakeAmt = parse("100");
  await (await dluz.approve(c.DLuzFarming, stakeAmt)).wait();
  await (await farming.stake(0, stakeAmt)).wait();
  check("Farming: staked 100 DLUZ", true);

  // 4b: Wait
  console.log("  ⏳ Waiting 20s for rewards...");
  await new Promise(r => setTimeout(r, 20000));
  // Force new block
  await (await signer.sendTransaction({ to: signer.address, value: 0n })).wait();

  const pending = await farming.pendingReward(0, signer.address);
  console.log(`  Pending reward: ${fmt(pending)} dCARBON`);
  check("Farming: rewards accruing", pending > 0n);

  // 4c: Claim
  const dcBeforeClaim = await dcarbon.balanceOf(signer.address);
  await (await farming.claim(0)).wait();
  const claimDelta = (await dcarbon.balanceOf(signer.address)) - dcBeforeClaim;
  console.log(`  Claimed: ${fmt(claimDelta)} dCARBON`);
  check("Farming: claim dCARBON rewards", claimDelta > 0n);

  // 4d: Unstake — use getFunction to force correct encoding
  console.log("  Unstaking 100 DLUZ...");
  const dluzBeforeUnstake = await dluz.balanceOf(signer.address);
  const unstakeTx = await farming.getFunction("unstake")(0, stakeAmt);
  await unstakeTx.wait();
  const unstakeDelta = (await dluz.balanceOf(signer.address)) - dluzBeforeUnstake;
  console.log(`  Unstaked: ${fmt(unstakeDelta)} DLUZ returned`);
  check("Farming: unstake 100 DLUZ", unstakeDelta === stakeAmt);

  // ━━━ Summary ━━━
  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  ✅ Passed: ${ok.length}/${ok.length + fail.length}   ❌ Failed: ${fail.length}/${ok.length + fail.length}`);
  if (fail.length > 0) {
    console.log("  Failed tests:");
    fail.forEach(f => console.log(`    ⛔ ${f}`));
  } else {
    console.log("  🎉 ALL TESTS PASSED — Protocol fully operational!");
  }
  console.log("═══════════════════════════════════════════════════════\n");
}

main().catch(e => { console.error(e); process.exit(1); });
