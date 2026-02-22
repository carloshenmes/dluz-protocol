const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;
  const parse = hre.ethers.parseEther;

  const registry = await hre.ethers.getContractAt("CarbonRegistry", c.CarbonRegistry);
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);

  // 1. Check current treasury
  const treasury = await registry.dluzTreasury();
  console.log(`Current dluzTreasury: ${treasury}`);
  console.log(`Signer:               ${signer.address}`);
  console.log(`Same? ${treasury.toLowerCase() === signer.address.toLowerCase()}`);

  // 2. Check treasury DLUZ balance
  const treasuryBal = await dluz.balanceOf(treasury);
  console.log(`Treasury DLUZ balance: ${fmt(treasuryBal)}`);

  // 3. Check allowance from treasury → Registry
  const allowance = await dluz.allowance(treasury, c.CarbonRegistry);
  console.log(`Allowance treasury → Registry: ${fmt(allowance)}`);

  // The problem: if treasury == signer, transferFrom(signer, signer) = delta 0
  // Fix: either use a separate treasury, or adjust the test to account for it
  // Best fix: set treasury to a dedicated address, or just accept the design
  // For now: let's approve from signer to Registry with a big amount
  // and verify the transferFrom actually works

  if (treasury.toLowerCase() === signer.address.toLowerCase()) {
    console.log("\n⚠️  Treasury IS the signer — transferFrom(self, self) = 0 delta");
    console.log("   The 100 DLUZ reward IS being transferred, but from/to same address.");
    console.log("   This is a deployment config issue, not a contract bug.");
    console.log("\n   Fix: set a separate treasury address, OR accept that");
    console.log("   in testing the reward works but delta = 0.");
  }
}

main().catch(e => { console.error(e); process.exit(1); });
