const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;
  const parse = hre.ethers.parseEther;

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

  // Helper: send contract call via populateTransaction (workaround ethers/hardhat bug)
  async function sendTx(contract, method, ...args) {
    const populated = await contract[method].populateTransaction(...args);
    const tx = await signer.sendTransaction({ to: populated.to, data: populated.data, gasLimit: 500000n });
    return tx.wait();
  }

  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   dLuz Protocol — FINAL Smoke Test (all 8 checks)    ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log(`  Network: ${hre.network.name}`);
  console.log(`  Tester:  ${signer.address}\n`);

  // ━━━ Cleanup: unstake leftover 300 DLUZ from previous tests ━━━
  const infoPre = await farming.userInfo(0, signer.address);
  const leftover = infoPre[0];
  if (leftover > 0n) {
    console.log(`  🧹 Cleaning up ${fmt(leftover)} DLUZ staked from previous runs...`);
    await sendTx(farming, "unstake", 0, leftover);
    console.log(`  🧹 Done.\n`);
  }

  // ━━━ Test 1: Buy DLUZ ━━━
  console.log("━━━ Test 1: Buy DLUZ ━━━");
  const dluzBefore = await dluz.balanceOf(signer.address);
  await (await sale.buy({ value: parse("0.001") })).wait();
  const dluzDelta = (await dluz.balanceOf(signer.address)) - dluzBefore;
  console.log(`  0.001 ETH → ${fmt(dluzDelta)} DLUZ`);
  check("DLuzSale: buy DLUZ with ETH", dluzDelta > 0n);

  // ━━━ Test 2: Bridge MockBCT → dCARBON ━━━
  console.log("\n━━━ Test 2: Bridge MockBCT → dCARBON ━━━");
  const dcBefore = await dcarbon.balanceOf(signer.address);
  await (await mockBCT.approve(c.CarbonBridge, parse("50"))).wait();
  await (await bridge.deposit(c.MockBCT, parse("50"))).wait();
  const dcDelta = (await dcarbon.balanceOf(signer.address)) - dcBefore;
  console.log(`  50 MockBCT → ${fmt(dcDelta)} dCARBON`);
  check("CarbonBridge: deposit MockBCT → dCARBON", dcDelta > 0n);

  // ━━━ Test 3: Retire dCARBON → dENERGY + DLUZ reward ━━━
  console.log("\n━━━ Test 3: Retire dCARBON → dENERGY + DLUZ ━━━");
  const dcPre = await dcarbon.balanceOf(signer.address);
  const dePre = await denergy.balanceOf(signer.address);
  const dluzPre = await dluz.balanceOf(signer.address);
  await (await dcarbon.approve(c.CarbonRegistry, parse("10"))).wait();
  await (await registry.retire(parse("10"), "Final smoke test")).wait();
  const dcBurned = dcPre - (await dcarbon.balanceOf(signer.address));
  const deMinted = (await denergy.balanceOf(signer.address)) - dePre;
  const dluzReward = (await dluz.balanceOf(signer.address)) - dluzPre;
  console.log(`  10 dCARBON → ${fmt(deMinted)} dENERGY + ${fmt(dluzReward)} DLUZ`);
  check("Registry: burn 10 dCARBON", dcBurned === parse("10"));
  check("Registry: mint 10 dENERGY (1:1)", deMinted === parse("10"));
  check("Registry: DLUZ reward (10:1)", dluzReward === parse("100"));

  // ━━━ Test 4: Farming full cycle ━━━
  console.log("\n━━━ Test 4: Farming (stake → wait → claim → unstake) ━━━");
  const stakeAmt = parse("100");
  await (await dluz.approve(c.DLuzFarming, stakeAmt)).wait();
  await (await farming.stake(0, stakeAmt)).wait();
  const infoStaked = await farming.userInfo(0, signer.address);
  check("Farming: stake 100 DLUZ", infoStaked[0] === stakeAmt);

  console.log("  ⏳ Waiting 15s for rewards...");
  await new Promise(r => setTimeout(r, 15000));
  // Mine a block
  await (await signer.sendTransaction({ to: signer.address, value: 0n })).wait();

  const pending = await farming.pendingReward(0, signer.address);
  console.log(`  Pending: ${fmt(pending)} dCARBON`);
  check("Farming: rewards accruing", pending > 0n);

  // Claim
  const dcPreClaim = await dcarbon.balanceOf(signer.address);
  await sendTx(farming, "claim", 0);
  const claimed = (await dcarbon.balanceOf(signer.address)) - dcPreClaim;
  console.log(`  Claimed: ${fmt(claimed)} dCARBON`);
  check("Farming: claim dCARBON rewards", claimed > 0n);

  // Unstake
  const dluzPreUnstake = await dluz.balanceOf(signer.address);
  await sendTx(farming, "unstake", 0, stakeAmt);
  const returned = (await dluz.balanceOf(signer.address)) - dluzPreUnstake;
  console.log(`  Returned: ${fmt(returned)} DLUZ`);
  check("Farming: unstake 100 DLUZ", returned === stakeAmt);

  // ━━━ SUMMARY ━━━
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  if (fail.length === 0) {
    console.log("║   🎉 ALL TESTS PASSED — dLuz Protocol is GO! 🚀      ║");
  } else {
    console.log(`║   ⚠️  ${ok.length}/${ok.length + fail.length} passed, ${fail.length} failed                         ║`);
  }
  console.log("╠═══════════════════════════════════════════════════════╣");
  ok.forEach(t => console.log(`║  ✅ ${t.padEnd(48)}║`));
  fail.forEach(t => console.log(`║  ❌ ${t.padEnd(48)}║`));
  console.log("╚═══════════════════════════════════════════════════════╝");
}

main().catch(e => { console.error(e); process.exit(1); });
