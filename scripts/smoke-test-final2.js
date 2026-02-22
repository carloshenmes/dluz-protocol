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

  async function sendTx(contract, method, ...args) {
    const populated = await contract[method].populateTransaction(...args);
    const tx = await signer.sendTransaction({ to: populated.to, data: populated.data, gasLimit: 500000n });
    return tx.wait();
  }

  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   dLuz Protocol — FINAL Smoke Test v2 (9/9 target)   ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log(`  Network: ${hre.network.name}`);
  console.log(`  Tester:  ${signer.address}\n`);

  // ━━━ Cleanup ━━━
  const infoPre = await farming.userInfo(0, signer.address);
  if (infoPre[0] > 0n) {
    console.log(`  🧹 Unstaking ${fmt(infoPre[0])} DLUZ from previous runs...`);
    await sendTx(farming, "unstake", 0, infoPre[0]);
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
  console.log("\n━━━ Test 3: Retire dCARBON → dENERGY + DLUZ reward ━━━");
  const dcPre = await dcarbon.balanceOf(signer.address);
  const dePre = await denergy.balanceOf(signer.address);
  await (await dcarbon.approve(c.CarbonRegistry, parse("10"))).wait();
  const retireTx = await (await registry.retire(parse("10"), "Final v2")).wait();

  const dcBurned = dcPre - (await dcarbon.balanceOf(signer.address));
  const deMinted = (await denergy.balanceOf(signer.address)) - dePre;
  console.log(`  Burned: ${fmt(dcBurned)} dCARBON | Minted: ${fmt(deMinted)} dENERGY`);
  check("Registry: burn 10 dCARBON", dcBurned === parse("10"));
  check("Registry: mint 10 dENERGY (1:1)", deMinted === parse("10"));

  // Verify DLUZ reward via event (treasury == signer so delta = 0, but event proves it)
  let dluzRewardEmitted = 0n;
  for (const log of retireTx.logs) {
    try {
      const parsed = registry.interface.parseLog(log);
      if (parsed && parsed.name === "DluzRewarded") {
        dluzRewardEmitted = parsed.args[1];
      }
    } catch {}
  }
  const treasury = await registry.dluzTreasury();
  const treasuryIsSigner = treasury.toLowerCase() === signer.address.toLowerCase();
  console.log(`  DLUZ reward event: ${fmt(dluzRewardEmitted)} DLUZ`);
  if (treasuryIsSigner) {
    console.log(`  ℹ️  treasury=signer → delta=0 expected (self-transfer). Event confirms reward.`);
  }
  check("Registry: DLUZ reward 100 (10:1 via event)", dluzRewardEmitted === parse("100"));

  // ━━━ Test 4: Farming full cycle ━━━
  console.log("\n━━━ Test 4: Farming ━━━");
  const stakeAmt = parse("100");
  await (await dluz.approve(c.DLuzFarming, stakeAmt)).wait();
  await (await farming.stake(0, stakeAmt)).wait();
  const infoStaked = await farming.userInfo(0, signer.address);
  check("Farming: stake 100 DLUZ", infoStaked[0] === stakeAmt);

  console.log("  ⏳ Waiting 15s...");
  await new Promise(r => setTimeout(r, 15000));
  await (await signer.sendTransaction({ to: signer.address, value: 0n })).wait();

  const pending = await farming.pendingReward(0, signer.address);
  console.log(`  Pending: ${fmt(pending)} dCARBON`);
  check("Farming: rewards accruing", pending > 0n);

  const dcPreClaim = await dcarbon.balanceOf(signer.address);
  await sendTx(farming, "claim", 0);
  const claimed = (await dcarbon.balanceOf(signer.address)) - dcPreClaim;
  console.log(`  Claimed: ${fmt(claimed)} dCARBON`);
  check("Farming: claim dCARBON rewards", claimed > 0n);

  const dluzPreUnstake = await dluz.balanceOf(signer.address);
  await sendTx(farming, "unstake", 0, stakeAmt);
  const returned = (await dluz.balanceOf(signer.address)) - dluzPreUnstake;
  console.log(`  Returned: ${fmt(returned)} DLUZ`);
  check("Farming: unstake 100 DLUZ", returned === stakeAmt);

  // ━━━ SUMMARY ━━━
  const total = ok.length + fail.length;
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  if (fail.length === 0) {
    console.log("║  🎉 ALL 9/9 PASSED — dLuz Protocol FULLY OPERATIONAL ║");
  } else {
    console.log(`║  ⚠️  ${ok.length}/${total} passed, ${fail.length} failed                          ║`);
  }
  console.log("╠═══════════════════════════════════════════════════════╣");
  ok.forEach(t =>   console.log(`║  ✅ ${(t).padEnd(48)}║`));
  fail.forEach(t => console.log(`║  ❌ ${(t).padEnd(48)}║`));
  console.log("╚═══════════════════════════════════════════════════════╝");
}

main().catch(e => { console.error(e); process.exit(1); });
