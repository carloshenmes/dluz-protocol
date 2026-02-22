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

  // Parse events from receipt using multiple contract interfaces
  function findTransfer(receipt, tokenAddr, to) {
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== tokenAddr.toLowerCase()) continue;
      try {
        const parsed = dluz.interface.parseLog(log);
        if (parsed && parsed.name === "Transfer" && parsed.args[1].toLowerCase() === to.toLowerCase()) {
          return parsed.args[2];
        }
      } catch {}
    }
    return 0n;
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
  console.log("║   dLuz Protocol — Smoke Test v4 (event-based, 9/9)     ║");
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

  // ━━━ 1. DLuzSale ━━━
  console.log("━━━ 1. DLuzSale ━━━");
  const buyRcpt = await (await sale.buy({ value: parse("0.001") })).wait();
  const purchasedEvt = findEvent(buyRcpt, sale, "Purchased");
  const dluzBought = purchasedEvt ? purchasedEvt.args[2] : 0n;
  console.log(`  0.001 ETH → ${fmt(dluzBought)} DLUZ`);
  check("DLuzSale: buy DLUZ", dluzBought === parse("3125"));

  // ━━━ 2. CarbonBridge ━━━
  console.log("\n━━━ 2. CarbonBridge ━━━");
  await (await mockBCT.approve(c.CarbonBridge, parse("50"))).wait();
  const bridgeRcpt = await (await bridge.deposit(c.MockBCT, parse("50"))).wait();
  // dCARBON mint = Transfer(0x0, signer)
  const dcMinted = findTransfer(bridgeRcpt, c.DCarbonToken, signer.address);
  console.log(`  50 MockBCT → ${fmt(dcMinted)} dCARBON (via Transfer event)`);
  check("CarbonBridge: deposit → dCARBON", dcMinted === parse("50"));

  // ━━━ 3. CarbonRegistry ━━━
  console.log("\n━━━ 3. CarbonRegistry ━━━");
  await (await dcarbon.approve(c.CarbonRegistry, parse("10"))).wait();
  const retireRcpt = await (await registry.retire(parse("10"), "v4 final")).wait();

  const retiredEvt = findEvent(retireRcpt, registry, "CarbonRetired");
  const energyEvt = findEvent(retireRcpt, registry, "EnergyMinted");
  const rewardEvt = findEvent(retireRcpt, registry, "DluzRewarded");

  const carbonRetired = retiredEvt ? retiredEvt.args[2] : 0n;
  const energyMinted = energyEvt ? energyEvt.args[1] : 0n;
  const dluzReward = rewardEvt ? rewardEvt.args[1] : 0n;

  console.log(`  Retired: ${fmt(carbonRetired)} dCARBON`);
  console.log(`  Minted:  ${fmt(energyMinted)} dENERGY`);
  console.log(`  Reward:  ${fmt(dluzReward)} DLUZ`);
  check("Registry: retire 10 dCARBON", carbonRetired === parse("10"));
  check("Registry: mint 10 dENERGY (1:1)", energyMinted === parse("10"));
  check("Registry: DLUZ reward 100 (10:1)", dluzReward === parse("100"));

  // ━━━ 4. Farming ━━━
  console.log("\n━━━ 4. Farming ━━━");

  // Stake — check via Transfer event TO farming contract
  const stakeAmt = parse("100");
  await (await dluz.approve(c.DLuzFarming, stakeAmt)).wait();
  const stakeRcpt = await (await farming.stake(0, stakeAmt)).wait();
  const stakeTransfer = findTransfer(stakeRcpt, c.DLuzToken, c.DLuzFarming);
  console.log(`  Staked: ${fmt(stakeTransfer)} DLUZ`);
  check("Farming: stake 100 DLUZ", stakeTransfer === stakeAmt);

  // Wait for rewards
  console.log("  ⏳ 15s for rewards...");
  await new Promise(r => setTimeout(r, 15000));
  await (await signer.sendTransaction({ to: signer.address, value: 0n })).wait();

  const pending = await farming.pendingReward(0, signer.address);
  console.log(`  Pending: ${fmt(pending)} dCARBON`);
  check("Farming: rewards accruing", pending > 0n);

  // Claim — check dCARBON Transfer to signer
  const claimRcpt = await sendTx(farming, "claim", 0);
  const claimedAmt = findTransfer(claimRcpt, c.DCarbonToken, signer.address);
  console.log(`  Claimed: ${fmt(claimedAmt)} dCARBON`);
  check("Farming: claim dCARBON", claimedAmt > 0n);

  // Unstake — check DLUZ Transfer to signer
  const unstakeRcpt = await sendTx(farming, "unstake", 0, stakeAmt);
  const unstaked = findTransfer(unstakeRcpt, c.DLuzToken, signer.address);
  console.log(`  Unstaked: ${fmt(unstaked)} DLUZ`);
  check("Farming: unstake 100 DLUZ", unstaked === stakeAmt);

  // ━━━ FINAL ━━━
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
