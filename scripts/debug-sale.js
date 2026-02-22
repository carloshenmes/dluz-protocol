const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;

  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);
  const sale = await hre.ethers.getContractAt("DLuzSale", c.DLuzSale);

  // 1. DLUZ balance of Sale contract
  const saleBal = await dluz.balanceOf(c.DLuzSale);
  console.log(`DLUZ in Sale contract: ${fmt(saleBal)}`);

  // 2. List sale functions
  const frags = sale.interface.fragments.filter(f => f.type === "function");
  console.log("\nSale functions:");
  frags.forEach(f => console.log(`  ${f.format()}`));

  // 3. Try to get price/rate
  try { const r = await sale.rate(); console.log(`\nrate: ${r}`); } catch {}
  try { const r = await sale.price(); console.log(`\nprice: ${r}`); } catch {}
  try { const r = await sale.tokenPrice(); console.log(`\ntokenPrice: ${r}`); } catch {}
  try { const r = await sale.tokensPerEth(); console.log(`\ntokensPerEth: ${fmt(r)}`); } catch {}

  // 4. Check if sale is active
  try { const a = await sale.active(); console.log(`active: ${a}`); } catch {}
  try { const a = await sale.isActive(); console.log(`isActive: ${a}`); } catch {}
  try { const a = await sale.paused(); console.log(`paused: ${a}`); } catch {}

  // 5. Check owner
  try { const o = await sale.owner(); console.log(`owner: ${o}`); } catch {}

  // 6. If balance is 0, refill
  if (saleBal === 0n) {
    console.log("\n⚠️  Sale contract has 0 DLUZ — needs refill!");
    console.log("   Sending 1,000,000 DLUZ to Sale...");
    const amount = hre.ethers.parseEther("1000000");
    const tx = await dluz.transfer(c.DLuzSale, amount);
    await tx.wait();
    const newBal = await dluz.balanceOf(c.DLuzSale);
    console.log(`   New Sale balance: ${fmt(newBal)} DLUZ`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
