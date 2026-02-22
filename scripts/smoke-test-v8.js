const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;
  const parse = hre.ethers.parseEther;

  // Use full ABIs, not IERC20
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);
  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", c.DCarbonToken);
  const denergy = await hre.ethers.getContractAt("DEnergyToken", c.DEnergyToken);
  const sale = await hre.ethers.getContractAt("DLuzSale", c.DLuzSale);
  const bridge = await hre.ethers.getContractAt("CarbonBridge", c.CarbonBridge);
  const registry = await hre.ethers.getContractAt("CarbonRegistry", c.CarbonRegistry);
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const mockBCT = await hre.ethers.getContractAt("IERC20", c.MockBCT);

  const ok = [], fail = [];
  const check = (name, pass) => { (pass ? ok : fail).push(name); console.log(`  ${pass ? "✅" : "❌"} ${name}`); };

  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   dLuz Protocol — Smoke Test v8                   ║");
  console.log("╚═══════════════════════════════════════════════════╝");
  console.log(`  Network: ${hre.network.name}`);
  console.log(`  Tester:  ${signer.address}\n`);

  // ━━━ Test 1: Buy DLUZ ━━━
  console.log("━━━ Test 1: Buy DLUZ via DLuzSale ━━━");
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

  // ━━━ Test 3: Retire dCARBON → dENERGY ━━━
  console.log("\n━━━ Test 3: Retire dCARBON → dENERGY ━━━");
  const dcPre = await dcarbon.balanceOf(signer.address);
  const dePre = await denergy.balanceOf(signer.address);
  console.log(`  dCARBON before: ${fmt(dcPre)}`);
  console.log(`  dENERGY before: ${fmt(dePre)}`);

  // Approve with full ABI (DCarbonToken, not IERC20)
  const approveTx = await dcarbon.approve(c.CarbonRegistry, parse("10"));
  await approveTx.wait();
  const allowance = await dcarbon.allowance(signer.address, c.CarbonRegistry);
  console.log(`  Allowance for Registry: ${fmt(allowance)}`);

  // Retire
  const retireTx = await registry.retire(parse("10"), "Smoke test v8");
  const retireRx = await retireTx.wait();
  console.log(`  tx status: ${retireRx.status}`);
  console.log(`  logs count: ${retireRx.logs.length}`);

  // Decode events
  for (const log of retireRx.logs) {
    try {
      // Try all contract interfaces
      let parsed;
      try { parsed = dcarbon.interface.parseLog(log); } catch {}
      if (!parsed) try { parsed = denergy.interface.parseLog(log); } catch {}
      if (!parsed) try { parsed = registry.interface.parseLog(log); } catch {}
      if (!parsed) try { parsed = dluz.interface.parseLog(log); } catch {}
      if (parsed) {
        console.log(`    Event: ${parsed.name}(${parsed.args.map(a => typeof a === 'bigint' ? fmt(a) : a).join(', ')})`);
      } else {
        console.log(`    Raw log from: ${log.address}`);
      }
    } catch { console.log(`    Unparsed log from: ${log.address}`); }
  }

  const dcPost = await dcarbon.balanceOf(signer.address);
  const dePost = await denergy.balanceOf(signer.address);
  console.log(`  dCARBON after: ${fmt(dcPost)}`);
  console.log(`  dENERGY after: ${fmt(dePost)}`);
  const dcBurned = dcPre - dcPost;
  const deMinted = dePost - dePre;
  console.log(`  Burned: ${fmt(dcBurned)} dCARBON  |  Minted: ${fmt(deMinted)} dENERGY`);
  check("Registry: dCARBON burned", dcBurned > 0n);
  check("Registry: dENERGY minted", deMinted > 0n);

  // ━━━ Test 4: Farming ━━━
  console.log("\n━━━ Test 4: Farming ━━━");
  const stakeAmt = parse("100");
  await (await dluz.approve(c.DLuzFarming, stakeAmt)).wait();
  await (await farming.stake(0, stakeAmt)).wait();
  check("Farming: staked 100 DLUZ", true);

  console.log("  ⏳ Waiting 20s...");
  await new Promise(r => setTimeout(r, 20000));
  await (await signer.sendTransaction({ to: signer.address, value: 0n })).wait();

  const pending = await farming.pendingReward(0, signer.address);
  console.log(`  Pending: ${fmt(pending)} dCARBON`);
  check("Farming: rewards accruing", pending > 0n);

  // Claim
  const dcBeforeClaim = await dcarbon.balanceOf(signer.address);
  await (await farming.claim(0)).wait();
  const claimDelta = (await dcarbon.balanceOf(signer.address)) - dcBeforeClaim;
  console.log(`  Claimed: ${fmt(claimDelta)} dCARBON`);
  check("Farming: claim rewards", claimDelta > 0n);

  // Unstake — manual encoding to bypass ethers bug
  console.log("  Unstaking 100 DLUZ (manual encoding)...");
  const dluzPreUnstake = await dluz.balanceOf(signer.address);
  const unstakeData = farming.interface.encodeFunctionData("unstake", [0, stakeAmt]);
  console.log(`  Encoded data: ${unstakeData.slice(0, 10)}... (${unstakeData.length / 2 - 1} bytes)`);
  const unstakeTx = await signer.sendTransaction({
    to: c.DLuzFarming,
    data: unstakeData,
  });
  await unstakeTx.wait();
  const unstakeDelta = (await dluz.balanceOf(signer.address)) - dluzPreUnstake;
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
