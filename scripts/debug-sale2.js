const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;
  const parse = hre.ethers.parseEther;

  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);
  const sale = await hre.ethers.getContractAt("DLuzSale", c.DLuzSale);

  // Check saleActive
  const active = await sale.saleActive();
  console.log(`saleActive: ${active}`);

  // Estimate
  const est = await sale.getEstimate(parse("0.001"));
  console.log(`getEstimate(0.001 ETH): ${fmt(est)} DLUZ`);

  // If not active, toggle
  if (!active) {
    console.log("\n⚠️  Sale is INACTIVE — toggling on...");
    const tx = await sale.toggleSale();
    await tx.wait();
    const nowActive = await sale.saleActive();
    console.log(`saleActive after toggle: ${nowActive}`);
  }

  // Try buy
  console.log("\n--- Attempting buy ---");
  const balBefore = await dluz.balanceOf(signer.address);
  const tx = await sale.buy({ value: parse("0.001") });
  const receipt = await tx.wait();
  const balAfter = await dluz.balanceOf(signer.address);
  const delta = balAfter - balBefore;
  console.log(`Delta: ${fmt(delta)} DLUZ`);
  console.log(`Gas used: ${receipt.gasUsed}`);

  // Check events
  for (const log of receipt.logs) {
    try {
      const parsed = sale.interface.parseLog(log);
      if (parsed) console.log(`Event: ${parsed.name}(${parsed.args.join(", ")})`);
    } catch {}
    try {
      const parsed = dluz.interface.parseLog(log);
      if (parsed) console.log(`DLUZ Event: ${parsed.name}(${parsed.args.map(a => typeof a === 'bigint' ? fmt(a) : a).join(", ")})`);
    } catch {}
  }
}

main().catch(e => { console.error(e); process.exit(1); });
