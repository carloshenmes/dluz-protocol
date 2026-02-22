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
  console.log("║   dLuz Protocol — Smoke Test v7 (final)           ║");
  console.log("╚═══════════════════════════════════════════════════╝");
  console.log(`  Network: ${hre.network.name}`);
  console.log(`  Tester: ${signer.address}\n`);

  // ━━━ Balances snapshot ━━━
  console.log("━━━ Initial Balances ━━━");
  console.log(`  DLUZ:    ${fmt(await dluz.balanceOf(signer.address))}`);
  console.log(`  dCARBON: ${fmt(await dcarbon.balanceOf(signer.address))}`);
  console.log(`  dENERGY: ${fmt(await denergy.balanceOf(signer.address))}`);
  console.log(`  MockBCT: ${fmt(await mockBCT.balanceOf(signer.address))}`);

  // ━━━ Test 1: Buy DLUZ ━━━
  console.log("\n━━━ Test 1: Buy DLUZ via DLuzSale ━━━");
  const dluzBefore = await dluz.balanceOf(signer.address);
  await (await sale.buy({ value: parse("0.001") })).wait();
  const dluzDelta = (await dluz.balanceOf(signer.address)) - dluzBefore;
  console.log(`  0.001 ETH → ${fmt(dluzDelta)} DLUZ`);
  check("DLuzSale: bought DLUZ", dluzDelta > 0n);

  // ━━━ Test 2: Deposit MockBCT → dCARBON ━━━
  console.log("\n━━━ Test 2: Deposit MockBCT → dCARBON ━━━");
  const dcBefore = await dcarbon.balanceOf(signer.address);
  await (await mockBCT.approve(c.CarbonBridge, parse("50"))).wait();
  await (await bridge.deposit(c.MockBCT, parse("50"))).wait();
  const dcDelta = (await dcarbon.balanceOf(signer.address)) - dcBefore;
  console.log(`  50 MockBCT → ${fmt(dcDelta)} dCARBON`);
  check("CarbonBridge: MockBCT → dCARBON", dcDelta > 0n);

  // ━━━ Test 3: Retire dCARBON → dENERGY + DLUZ reward ━━━
  console.log("\n━━━ Test 3: Retire dCARBON → dENERGY ━━━");
  // Show balances before
  const dcBeforeRetire = await dcarbon.balanceOf(signer.address);
  const deBeforeRetire = await denergy.balanceOf(signer.address);
  const dluzBeforeRetire = await dluz.balanceOf(signer.address);
  console.log(`  dCARBON before: ${fmt(dcBeforeRetire)}`);
  console.log(`  dENERGY before: ${fmt(deBeforeRetire)}`);

  // Approve and retire
  await (await dcarbon.approve(c.CarbonRegistry, parse("10"))).wait();
  const retireTx = await registry.retire(parse("10"), "Smoke test v7 - offset");
  const retireReceipt = await retireTx.wait();
  console.log(`  retire() tx status: ${retireReceipt.status} (1=ok, 0=revert)`);
  console.log(`  Gas used: ${retireReceipt.gasUsed.toString()}`);
  console.log(`  Events: ${retireReceipt.logs.length}`);

  const dcAfterRetire = await dcarbon.balanceOf(signer.address);
  const deAfterRetire = await denergy.balanceOf(signer.address);
  const dluzAfterRetire = await dluz.balanceOf(signer.address);
  const deDelta = deAfterRetire - deBeforeRetire;
  const dcBurned = dcBeforeRetire - dcAfterRetire;
  const dluzReward = dluzAfterRetire - dluzBeforeRetire;
  console.log(`  dCARBON burned: ${fmt(dcBurned)}`);
  console.log(`  dENERGY minted: ${fmt(deDelta)}`);
  console.log(`  DLUZ reward:    ${fmt(dluzReward)}`);
  check("Registry: dCARBON burned", dcBurned === parse("10"));
  check("Registry: dENERGY minted (1:1)", deDelta === parse("10"));

  // ━━━ Test 4: Farming full cycle ━━━
  console.log("\n━━━ Test 4: Farming (stake → wait → claim → unstake) ━━━");

  const stakeAmt = parse("100");
  await (await dluz.approve(c.DLuzFarming, stakeAmt)).wait();
  await (await farming.stake(0, stakeAmt)).wait();
  check("Farming: staked 100 DLUZ", true);

  console.log("  ⏳ Waiting 20s for rewards...");
  await new Promise(r => setTimeout(r, 20000));
  await (await signer.sendTransaction({ to: signer.address, value: 0n })).wait();

  const pending = await farming.pendingReward(0, signer.address);
  console.log(`  Pending: ${fmt(pending)} dCARBON`);
  check("Farming: rewards accruing", pending > 0n);

  // Claim
  const dcBeforeClaim = await dcarbon.balanceOf(signer.address);
  await (await farming.getFunction("claim")(0)).wait();
  const claimDelta = (await dcarbon.balanceOf(signer.address)) - dcBeforeClaim;
  console.log(`  Claimed: ${fmt(claimDelta)} dCARBON`);
  check("Farming: claim dCARBON rewards", claimDelta > 0n);

  // Unstake
  const dluzBeforeUnstake = await dluz.balanceOf(signer.address);
  await (await farming.getFunction("unstake")(0, stakeAmt)).wait();
  const unstakeDelta = (await dluz.balanceOf(signer.address)) - dluzBeforeUnstake;
  console.log(`  Returned: ${fmt(unstakeDelta)} DLUZ`);
  check("Farming: unstake 100 DLUZ", unstakeDelta === stakeAmt);

  // ━━━ Summary ━━━
  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  ✅ ${ok.length}/${ok.length + fail.length} passed   ❌ ${fail.length}/${ok.length + fail.length} failed`);
  if (fail.length > 0) {
    fail.forEach(f => console.log(`    ⛔ ${f}`));
  } else {
    console.log("  🎉 ALL TESTS PASSED — dLuz Protocol fully operational!");
  }
  console.log("═══════════════════════════════════════════════════════\n");
}

main().catch(e => { console.error(e); process.exit(1); });
