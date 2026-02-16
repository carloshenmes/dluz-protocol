require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const network = hre.network.name;
  const { contracts: deployment } = JSON.parse(fs.readFileSync(`deployments/${network}.json`, "utf8"));
  const [deployer] = await hre.ethers.getSigners();

  console.log("Setting up roles...");
  console.log("Network:", network);
  console.log("Admin:", deployer.address);

  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));

  // DCarbonToken — AccessControl
  const dCarbon = await hre.ethers.getContractAt("DCarbonToken", deployment.DCarbonToken);
  const tx1 = await dCarbon.grantRole(MINTER_ROLE, deployment.CarbonRegistry);
  await tx1.wait();
  console.log("DCarbonToken: MINTER_ROLE granted to CarbonRegistry");

  // DEnergyToken — AccessControl
  const dEnergy = await hre.ethers.getContractAt("DEnergyToken", deployment.DEnergyToken);
  const tx2 = await dEnergy.grantRole(MINTER_ROLE, deployment.CarbonRegistry);
  await tx2.wait();
  console.log("DEnergyToken: MINTER_ROLE granted to CarbonRegistry");

  // DLuzToken — Ownable (transferOwnership)
  const dLuz = await hre.ethers.getContractAt("DLuzToken", deployment.DLuzToken);
  const tx3 = await dLuz.transferOwnership(deployment.CarbonRegistry);
  await tx3.wait();
  console.log("DLuzToken: ownership transferred to CarbonRegistry");

  console.log("\nAll roles configured!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
