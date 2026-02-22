const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  const deployPath = path.join(__dirname, "..", "deployments", `${network}.json`);
  const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));
  const c = deployment.contracts;
  const [deployer] = await hre.ethers.getSigners();

  console.log("=== Redeploy DLuzFarming ===");
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);

  // 1. Deploy new Farming
  const DLuzFarming = await hre.ethers.getContractFactory("DLuzFarming");
  const farming = await DLuzFarming.deploy(deployer.address, c.DLuzToken);
  await farming.waitForDeployment();
  const farmingAddr = await farming.getAddress();
  console.log("✅ New DLuzFarming:", farmingAddr);

  // 2. Add pools (same as original deploy)
  let tx = await farming.addPool(c.DCarbonToken, hre.ethers.parseEther("0.01"));
  await tx.wait();
  console.log("✅ Pool 0: dCARBON rewards @ 0.01/s");

  tx = await farming.addPool(c.DEnergyToken, hre.ethers.parseEther("0.005"));
  await tx.wait();
  console.log("✅ Pool 1: dENERGY rewards @ 0.005/s");

  // 3. Fund farming with dCARBON for rewards (mint some to farming)
  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", c.DCarbonToken);
  const MINTER = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  const hasMinter = await dcarbon.hasRole(MINTER, deployer.address);
  
  if (hasMinter) {
    tx = await dcarbon.mint(farmingAddr, hre.ethers.parseEther("1000"));
    await tx.wait();
    console.log("✅ Funded Farming with 1,000 dCARBON for rewards");
  } else {
    console.log("⚠️  Deployer doesn't have MINTER_ROLE on dCARBON — fund manually");
  }

  // 4. Fund farming with dENERGY for Pool 1 rewards
  const denergy = await hre.ethers.getContractAt("DEnergyToken", c.DEnergyToken);
  const hasMinterEnergy = await denergy.hasRole(MINTER, deployer.address);

  if (hasMinterEnergy) {
    tx = await denergy.mint(farmingAddr, hre.ethers.parseEther("500"));
    await tx.wait();
    console.log("✅ Funded Farming with 500 dENERGY for rewards");
  } else {
    console.log("⚠️  Deployer doesn't have MINTER_ROLE on dENERGY — fund manually");
  }

  // 5. Update deployment JSON
  const oldFarming = c.DLuzFarming;
  deployment.contracts.DLuzFarming = farmingAddr;
  deployment.redeployments = deployment.redeployments || [];
  deployment.redeployments.push({
    contract: "DLuzFarming",
    old: oldFarming,
    new: farmingAddr,
    reason: "Fix underflow bug in unstake reward calculation",
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(deployPath, JSON.stringify(deployment, null, 2));
  console.log("\n✅ Updated", deployPath);

  // 6. Summary
  console.log("\n=== SUMMARY ===");
  console.log("Old Farming:", oldFarming);
  console.log("New Farming:", farmingAddr);
  console.log("dCARBON in Farming:", hre.ethers.formatEther(await dcarbon.balanceOf(farmingAddr)));
  console.log("dENERGY in Farming:", hre.ethers.formatEther(await denergy.balanceOf(farmingAddr)));
  
  console.log("\n⚠️  Old farming still has 1000 DLUZ staked from previous tests.");
  console.log("   Those are locked in the old contract (can unstake from old if needed).");
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1); });
