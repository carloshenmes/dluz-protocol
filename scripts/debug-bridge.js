const hre = require("hardhat");
const dep = require("/workspaces/dluz-protocol/deployments/baseSepolia.json");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const c = dep.contracts;

  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", c.DCarbonToken);
  const bridge = await hre.ethers.getContractAt("CarbonBridge", c.CarbonBridge);
  const mockBCT = await hre.ethers.getContractAt("MockBCT", c.MockBCT);

  const MINTER = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));

  console.log("=== DEBUG BRIDGE ===");
  console.log("Bridge address:", c.CarbonBridge);
  console.log("DCarbonToken address:", c.DCarbonToken);
  console.log("MockBCT address:", c.MockBCT);
  console.log("");
  console.log("Bridge has MINTER_ROLE on dCARBON:", await dcarbon.hasRole(MINTER, c.CarbonBridge));
  console.log("Bridge.paused:", await bridge.paused());
  console.log("Bridge.acceptedTokens(MockBCT):", await bridge.acceptedTokens(c.MockBCT));
  console.log("Bridge.totalBacked:", hre.ethers.formatEther(await bridge.totalBacked()));
  console.log("");
  console.log("Deployer MockBCT balance:", hre.ethers.formatEther(await mockBCT.balanceOf(signer.address)));
  console.log("Bridge MockBCT balance:", hre.ethers.formatEther(await mockBCT.balanceOf(c.CarbonBridge)));
  console.log("Deployer dCARBON balance:", hre.ethers.formatEther(await dcarbon.balanceOf(signer.address)));
  console.log("dCARBON totalSupply:", hre.ethers.formatEther(await dcarbon.totalSupply()));

  // Try a fresh deposit
  console.log("\n=== MANUAL DEPOSIT TEST ===");
  const amount = hre.ethers.parseEther("10");

  console.log("1. Approving 10 MockBCT...");
  let tx = await mockBCT.approve(c.CarbonBridge, amount);
  await tx.wait();
  console.log("   Allowance:", hre.ethers.formatEther(await mockBCT.allowance(signer.address, c.CarbonBridge)));

  console.log("2. Depositing 10 MockBCT...");
  try {
    tx = await bridge.deposit(c.MockBCT, amount);
    const receipt = await tx.wait();
    console.log("   TX hash:", receipt.hash);
    console.log("   Status:", receipt.status);
    console.log("   Events:", receipt.logs.length);

    for (const log of receipt.logs) {
      console.log("   Log address:", log.address);
      console.log("   Log topics:", log.topics.length);
    }
  } catch (e) {
    console.log("   ❌ REVERTED:", e.message.slice(0, 300));
  }

  console.log("\n3. Post-deposit balances:");
  console.log("   Deployer dCARBON:", hre.ethers.formatEther(await dcarbon.balanceOf(signer.address)));
  console.log("   Bridge MockBCT:", hre.ethers.formatEther(await mockBCT.balanceOf(c.CarbonBridge)));
  console.log("   dCARBON totalSupply:", hre.ethers.formatEther(await dcarbon.totalSupply()));
  console.log("   Bridge totalBacked:", hre.ethers.formatEther(await bridge.totalBacked()));
}

main().catch(console.error);
