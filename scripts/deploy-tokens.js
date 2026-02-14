const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy DLuzToken
  console.log("Deploying DLuzToken...");
  const DLuzToken = await hre.ethers.getContractFactory("DLuzToken");
  const dluz = await DLuzToken.deploy(deployer.address);
  await dluz.waitForDeployment();
  const dluzAddress = await dluz.getAddress();
  console.log("✅ DLuzToken deployed to:", dluzAddress);

  // 2. Deploy DCarbonToken
  console.log("\nDeploying DCarbonToken...");
  const DCarbonToken = await hre.ethers.getContractFactory("DCarbonToken");
  const dcarbon = await DCarbonToken.deploy();
  await dcarbon.waitForDeployment();
  const dcarbonAddress = await dcarbon.getAddress();
  console.log("✅ DCarbonToken deployed to:", dcarbonAddress);

  // 3. Deploy DEnergyToken
  console.log("\nDeploying DEnergyToken...");
  const DEnergyToken = await hre.ethers.getContractFactory("DEnergyToken");
  const denergy = await DEnergyToken.deploy();
  await denergy.waitForDeployment();
  const denergyAddress = await denergy.getAddress();
  console.log("✅ DEnergyToken deployed to:", denergyAddress);

  // Summary
  console.log("\n========================================");
  console.log("🚀 dLuz Protocol — Token Deployment Summary");
  console.log("========================================");
  console.log("Network:      ", hre.network.name);
  console.log("Deployer:     ", deployer.address);
  console.log("DLUZ:         ", dluzAddress);
  console.log("dCARBON:      ", dcarbonAddress);
  console.log("dENERGY:      ", denergyAddress);
  console.log("========================================\n");

  // Verify contracts (only on live networks)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting 30s for block confirmations before verification...\n");
    await new Promise((r) => setTimeout(r, 30000));

    try {
      await hre.run("verify:verify", {
        address: dluzAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✅ DLuzToken verified!\n");
    } catch (e) {
      console.log("⚠️  DLuzToken verification failed:", e.message, "\n");
    }

    try {
      await hre.run("verify:verify", {
        address: dcarbonAddress,
        constructorArguments: [],
      });
      console.log("✅ DCarbonToken verified!\n");
    } catch (e) {
      console.log("⚠️  DCarbonToken verification failed:", e.message, "\n");
    }

    try {
      await hre.run("verify:verify", {
        address: denergyAddress,
        constructorArguments: [],
      });
      console.log("✅ DEnergyToken verified!\n");
    } catch (e) {
      console.log("⚠️  DEnergyToken verification failed:", e.message, "\n");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
