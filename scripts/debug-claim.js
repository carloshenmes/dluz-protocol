const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", c.DCarbonToken);

  // Check DCarbonToken ABI
  const dcArtifact = await hre.artifacts.readArtifact("DCarbonToken");
  const funcs = dcArtifact.abi.filter(x => x.type === "function").map(x => x.name);
  console.log("DCarbonToken functions:", funcs.join(", "));

  // Check if it has TRANSFERER_ROLE or similar
  for (const role of ["MINTER_ROLE", "BURNER_ROLE", "TRANSFER_ROLE", "TRANSFERER_ROLE", "PAUSER_ROLE", "DEFAULT_ADMIN_ROLE"]) {
    try {
      const hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(role));
      const has = await dcarbon.hasRole(hash, c.DLuzFarming);
      console.log(`Farming has ${role}:`, has);
    } catch {}
  }

  // Try staticCall claim
  console.log("\n=== STATIC CALL claim ===");
  try {
    await farming.claim.staticCall(0);
    console.log("✅ staticCall passed");
  } catch(e) {
    console.log("❌ staticCall failed:", e.message.slice(0, 500));
  }

  // Check user state
  const user = await farming.userInfo(0, signer.address);
  console.log("\nUser amount:", hre.ethers.formatEther(user.amount));
  console.log("User pendingRewards:", hre.ethers.formatEther(user.pendingRewards));
  console.log("User rewardDebt:", user.rewardDebt.toString());

  // If pendingRewards > 0 and amount == 0, the claim computes:
  // accum = (0 * accRewardPerShare) / 1e18 = 0
  // pending = accum > rewardDebt ? accum - rewardDebt : 0 → 0
  // totalRewards = user.pendingRewards + 0 = 1.26
  // safeTransfer(dCARBON, 1.26)
  
  // Test direct dCARBON transfer FROM farming
  // We can't call transfer from farming directly, but let's check if dCARBON has transfer restrictions
  console.log("\n=== dCARBON TRANSFER TEST ===");
  console.log("dCARBON paused?");
  try {
    const paused = await dcarbon.paused();
    console.log("  paused():", paused);
  } catch { console.log("  no paused() function"); }

  // Check if dCARBON has a whitelist/blacklist
  try {
    const wl = await dcarbon.whitelisted(c.DLuzFarming);
    console.log("  Farming whitelisted:", wl);
  } catch {}

  // Try simple transfer of dCARBON between EOAs
  console.log("\nTransfer 1 dCARBON from deployer to self...");
  try {
    const tx = await dcarbon.transfer(signer.address, hre.ethers.parseEther("1"));
    await tx.wait();
    console.log("  ✅ Transfer works");
  } catch(e) {
    console.log("  ❌ Transfer failed:", e.message.slice(0, 300));
  }

  // Check if dCARBON is soulbound (non-transferable by design)
  // Look for _beforeTokenTransfer or _update overrides
  console.log("\n=== CHECK SOURCE ===");
  const src = await hre.artifacts.readArtifact("DCarbonToken");
  const hasTransfer = src.abi.find(x => x.name === "transfer");
  const hasTransferFrom = src.abi.find(x => x.name === "transferFrom");
  console.log("Has transfer:", !!hasTransfer);
  console.log("Has transferFrom:", !!hasTransferFrom);

  // Check bytecode for specific patterns
  const code = await hre.ethers.provider.getCode(c.DCarbonToken);
  console.log("Bytecode length:", code.length);
}

main().catch(console.error);
