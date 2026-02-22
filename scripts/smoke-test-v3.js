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

  function findEvent(receipt, contract, eventName) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === eventName) return parsed;
      } catch {}
    }
    return null;
  }

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║    dLuz Protocol — Smoke Test v3 FINAL (9/9 target)     ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`  Network:   ${hre.network.name}`);
  console.log(`  Tester:    ${signer.address}`);
  console.log(`  Timestamp: ${new Date().toISOString()}\n`);

  // ━━━ Cleanup ━━━
  const infoPre = await farming.userInfo(0, signer.address);
  if (infoPre[0] > 0n) {
    console.log(`  🧹 Unstaking ${fmt(infoPre[0])} leftover DLUZ...\n`);
    await sendTx(farming, "unstake", 0, infoPre[0]);
  }

  // ━━━ Test 1: DLuzSale ━━━
  console.log("━━━ 1. DLuzSale: buy DLUZ with ETH ━━━");
  const buyReceipt = await (await sale.buy({ value: parse("0.001") })).wait();
  const purchasedEvt = findEvent(buyReceipt, sale, "Purchased");
  const dluzBought = purchasedEvt ? purchasedEvt.args[2] : 0n;
  console.log(`  0.001 ETH → ${fmt(dluzBought)} DLUZ (via Purchased event)`);
  check("DLuzSale: buy DLUZ", dluzBought > 0n);

  // ━━━ Test 2: CarbonBridge ━━━
  console.log("\n━━━ 2. CarbonBridge: deposit MockBCT → dCARBON ━━━");
  const dcBefore = await dcarbon.balanceOf(signer.address);
  await (await mockBCT.approve(c.CarbonBridge, parse("50"))).wait();
  await (await bridge.deposit(c.MockBCT, parse("50"))).wait();
  const dcDelta = (await dcarbon.balanceOf(signer.address)) - dcBefore;
  console.log(`  50 MockBCT → ${fmt(dcDelta)} dCARBON`);
  check("CarbonBridge: deposit → dCARBON", dcDelta > 0n);

  // ━━━ Test 3: CarbonRegistry retire ━━━
  console.log("\n━━━ 3. CarbonRegistry: retire dCARBON ━━━");
  const dcPre = await dcarbon.balanceOf(signer.address);
  const dePre = await denergy.balanceOf(signer.address);
  await (await dcarbon.approve(c.CarbonRegistry, parse("10"))).wait();
  const retireReceipt = await (await registry.retire(parse("10"), "Smoke v3 final")).wait();

  const dcBurned = dcPre - (await dcarbon.balanceOf(signer.address));
  const deMinted = (await denergy.balanceOf(signer.address)) - dePre;
  console.log(`  Burned: ${fmt(dcBurned)} dCARBON → Minted: ${fmt(deMinted)} dENERGY`);
  check("Registry: burn 10 dCARBON", dcBurned === parse("10"));
  check("Registry: mint 10 dENERGY (1:1)", deMinted === parse("10"));

  const rewardEvt = findEvent(retireReceipt, registry, "DluzRewarded");
  const dluzReward = rewardEvt ? rewardEvt.args[1] : 0n;
  console.log(`  DLUZ reward: ${fmt(dluzReward)} (via DluzRewarded event)`);
  check("Registry: DLUZ reward 100 (10:1)", dluzReward === parse("100"));

  // ━━━ Test 4: Farming cycle ━━━
  console.log("\n━━━ 4. Farming: stake → claim → unstake ━━━");
  const stakeAmt = parse("100");
  await (await dluz.approve(c.DLuzFarming, stakeAmt)).wait();
  await (await farming.stake(0, stakeAmt)).wait();
  const staked = (await farming.userInfo(0, signer.address))[0];
  check("Farming: stake 100 DLUZ", staked === stakeAmt);

  console.log("  ⏳ 15s for rewards...");
  await new Promise(r => setTimeout(r, 15000));
  await (await signer.sendTransaction({ to: signer.address, value: 0n })).wait();

  const pending = await farming.pendingReward(0, signer.address);
  console.log(`  Pending: ${fmt(pending)} dCARBON`);
  check("Farming: rewards accruing", pending > 0n);

  const dcPreClaim = await dcarbon.balanceOf(signer.address);
  await sendTx(farming, "claim", 0);
  const claimed = (await dcarbon.balanceOf(signer.address)) - dcPreClaim;
  console.log(`  Claimed: ${fmt(claimed)} dCARBON`);
  check("Farming: claim dCARBON", claimed > 0n);

  const dluzPre = await dluz.balanceOf(signer.address);
  await sendTx(farming, "unstake", 0, stakeAmt);
  const returned = (await dluz.balanceOf(signer.address)) - dluzPre;
  console.log(`  Unstaked: ${fmt(returned)} DLUZ`);
  check("Farming: unstake 100 DLUZ", returned === stakeAmt);

  // ━━━ SUMMARY ━━━
  const total = ok.length + fail.length;
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  if (fail.length === 0) {
    console.log("║  🎉 ALL 9/9 PASSED — dLuz Protocol FULLY OPERATIONAL 🚀 ║");
  } else {
    console.log(`║  ⚠️  ${ok.length}/${total} passed, ${fail.length} failed                            ║`);
  }
  console.log("╠══════════════════════════════════════════════════════════╣");
  ok.forEach(t =>   console.log(`║  ✅ ${t.padEnd(50)}║`));
  fail.forEach(t => console.log(`║  ❌ ${t.padEnd(50)}║`));
  console.log("╚══════════════════════════════════════════════════════════╝");
}

main().catch(e => { console.error(e); process.exit(1); });
