const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);

  // Check DLuzFarming ABI for claim
  const artifact = await hre.artifacts.readArtifact("DLuzFarming");
  const claimFn = artifact.abi.filter(x => x.name === "claim");
  console.log("claim functions in ABI:");
  for (const fn of claimFn) {
    console.log("  claim(" + fn.inputs.map(i => i.type + " " + i.name).join(", ") + ")");
  }

  // Also check all function names
  const allFns = artifact.abi.filter(x => x.type === "function").map(x => x.name + "(" + x.inputs.map(i => i.type).join(",") + ")");
  console.log("\nAll functions:");
  allFns.forEach(f => console.log("  ", f));

  // Encode claim(0) manually
  const iface = farming.interface;
  const calldata = iface.encodeFunctionData("claim", [0]);
  console.log("\nEncoded calldata:", calldata);
  console.log("Calldata length:", calldata.length);

  // Execute with explicit calldata and gas
  console.log("\n=== EXECUTE CLAIM ===");
  try {
    const tx = await signer.sendTransaction({
      to: c.DLuzFarming,
      data: calldata,
      gasLimit: 200000
    });
    const receipt = await tx.wait();
    console.log("✅ Claim OK | Status:", receipt.status, "| Gas:", receipt.gasUsed.toString());
    for (const log of receipt.logs) {
      console.log("  Log:", log.address, log.topics[0]?.slice(0, 10));
    }
  } catch(e) {
    console.log("❌ Claim failed:", e.message.slice(0, 500));
  }

  // Check final state
  const dcarbon = await hre.ethers.getContractAt("IERC20", c.DCarbonToken);
  const user = await farming.userInfo(0, signer.address);
  console.log("\n=== FINAL STATE ===");
  console.log("User pendingRewards:", hre.ethers.formatEther(user.pendingRewards));
  console.log("dCARBON balance:", hre.ethers.formatEther(await dcarbon.balanceOf(signer.address)));
}

main().catch(console.error);
