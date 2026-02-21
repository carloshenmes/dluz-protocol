const hre = require("hardhat");

async function main() {
  var [deployer] = await hre.ethers.getSigners();
  console.log("Fix script - completando Phase 2...");
  console.log("Deployer:", deployer.address);

  var DLUZ    = "0xF0807462147C10Eae2B53fa64C736d73A541950c";
  var DCARBON = "0x87605261111208e9f57CbA884d7c2bEcFe81C45D";
  var DENERGY = "0x8919646FAe7283842090eb86BA02D4683e501934";
  var sale    = "0x7f37c4525B041e70F233248dfEd2b463F6ba21B0";
  var dex     = "0xC3a8406D8Ffa3d09964db497e6Edeea697Eedb77";

  var dluzContract = await hre.ethers.getContractAt("DLuzToken", DLUZ);
  var dexContract  = await hre.ethers.getContractAt("DLuzDEX", dex);

  console.log("1. Funding DLuzSale with 5M DLUZ...");
  var tx1 = await dluzContract.transfer(sale, hre.ethers.parseEther("5000000"));
  await tx1.wait();
  console.log("   Done. TX:", tx1.hash);

  console.log("2. Creating pool DLUZ <> dCARBON...");
  var tx2 = await dexContract.createPool(DLUZ, DCARBON);
  await tx2.wait();
  console.log("   Done. TX:", tx2.hash);

  console.log("3. Creating pool DLUZ <> dENERGY...");
  var tx3 = await dexContract.createPool(DLUZ, DENERGY);
  await tx3.wait();
  console.log("   Done. TX:", tx3.hash);

  console.log("\nPhase 2 fix COMPLETO!");
}

main().then(function() { process.exit(0); }).catch(function(e) { console.error(e); process.exit(1); });
