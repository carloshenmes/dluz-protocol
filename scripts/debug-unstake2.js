const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;
  const parse = hre.ethers.parseEther;
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);

  // 1. List ALL functions
  const frags = farming.interface.fragments.filter(f => f.type === "function");
  console.log("All functions:");
  frags.forEach(f => console.log(`  ${f.format()}`));

  // 2. Try userInfo
  console.log("\n--- User info attempts ---");
  try {
    const info = await farming.userInfo(0, signer.address);
    console.log(`  userInfo: ${JSON.stringify(info, (k, v) => typeof v === 'bigint' ? fmt(v) : v)}`);
  } catch { console.log("  userInfo(uint,addr) - not found"); }

  try {
    const info = await farming.users(0, signer.address);
    console.log(`  users: ${JSON.stringify(info, (k, v) => typeof v === 'bigint' ? fmt(v) : v)}`);
  } catch { console.log("  users(uint,addr) - not found"); }

  try {
    const info = await farming.stakers(signer.address);
    console.log(`  stakers: ${JSON.stringify(info, (k, v) => typeof v === 'bigint' ? fmt(v) : v)}`);
  } catch { console.log("  stakers(addr) - not found"); }

  // 3. Selectors
  console.log("\n--- Key selectors ---");
  console.log(`  stake:   ${farming.interface.getFunction("stake").selector}`);
  console.log(`  unstake: ${farming.interface.getFunction("unstake").selector}`);
  console.log(`  claim:   ${farming.interface.getFunction("claim").selector}`);

  // 4. Static call
  console.log("\n--- staticCall unstake(0, 100e18) ---");
  try {
    await farming.unstake.staticCall(0, parse("100"));
    console.log("  WOULD SUCCEED");
  } catch (e) {
    console.log(`  REVERTS: ${e.message.slice(0, 300)}`);
  }

  // 5. Try smaller amounts
  console.log("\n--- staticCall unstake(0, 1e18) ---");
  try {
    await farming.unstake.staticCall(0, parse("1"));
    console.log("  WOULD SUCCEED");
  } catch (e) {
    console.log(`  REVERTS: ${e.message.slice(0, 300)}`);
  }

  // 6. Pending reward to confirm pool 0 exists
  console.log("\n--- pendingReward(0) ---");
  try {
    const p = await farming.pendingReward(0, signer.address);
    console.log(`  pending: ${fmt(p)} dCARBON`);
  } catch (e) {
    console.log(`  REVERTS: ${e.message.slice(0, 200)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
