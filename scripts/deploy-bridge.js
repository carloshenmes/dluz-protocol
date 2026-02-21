const hre = require("hardhat");

async function main() {
  var [deployer] = await hre.ethers.getSigners();
  var network = hre.network.name;
  console.log("===========================================");
  console.log("  CarbonBridge + MockBCT Deployment");
  console.log("===========================================");
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);

  var DCARBON;

  if (network === "hardhat" || network === "localhost") {
    console.log("Deploying local DCarbonToken...");
    var DCF = await hre.ethers.getContractFactory("DCarbonToken");
    var localDCarbon = await DCF.deploy();
    await localDCarbon.waitForDeployment();
    DCARBON = await localDCarbon.getAddress();
    console.log("  Local DCarbonToken:", DCARBON);
  } else {
    DCARBON = "0x87605261111208e9f57CbA884d7c2bEcFe81C45D";
    console.log("  Using existing DCarbonToken:", DCARBON);
  }

  console.log("Deploying MockBCT...");
  var F = await hre.ethers.getContractFactory("MockBCT");
  var mockBCT = await F.deploy();
  await mockBCT.waitForDeployment();
  var bctAddr = await mockBCT.getAddress();
  console.log("  MockBCT:", bctAddr);

  console.log("Deploying CarbonBridge...");
  F = await hre.ethers.getContractFactory("CarbonBridge");
  var bridge = await F.deploy(DCARBON, deployer.address);
  await bridge.waitForDeployment();
  var bridgeAddr = await bridge.getAddress();
  console.log("  CarbonBridge:", bridgeAddr);

  console.log("Configuring...");

  var tx1 = await bridge.addToken(bctAddr);
  await tx1.wait();
  console.log("  MockBCT added as accepted token");

  var dcarbonContract = await hre.ethers.getContractAt("DCarbonToken", DCARBON);
  var MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  var tx2 = await dcarbonContract.grantRole(MINTER_ROLE, bridgeAddr);
  await tx2.wait();
  console.log("  MINTER_ROLE granted to CarbonBridge on dCARBON");

  console.log("");
  console.log("Testing deposit flow...");
  var depositAmount = hre.ethers.parseEther("100");
  var tx3 = await mockBCT.approve(bridgeAddr, depositAmount);
  await tx3.wait();
  console.log("  Approved 100 mBCT");

  var tx4 = await bridge.deposit(bctAddr, depositAmount);
  await tx4.wait();
  console.log("  Deposited 100 mBCT -> received 100 dCARBON");

  var dcarbonBal = await dcarbonContract.balanceOf(deployer.address);
  console.log("  dCARBON balance:", hre.ethers.formatEther(dcarbonBal));

  var backing = await bridge.getBackingBalance(bctAddr);
  console.log("  Bridge BCT backing:", hre.ethers.formatEther(backing));

  // Test retire
  console.log("");
  console.log("Testing retire flow...");
  var retireAmount = hre.ethers.parseEther("10");
  var tx5 = await dcarbonContract.approve(bridgeAddr, retireAmount);
  await tx5.wait();
  var tx6 = await bridge.retire(retireAmount, "dLuz Protocol test retirement");
  await tx6.wait();
  console.log("  Retired 10 dCARBON (reason: dLuz Protocol test retirement)");

  dcarbonBal = await dcarbonContract.balanceOf(deployer.address);
  console.log("  dCARBON balance after retire:", hre.ethers.formatEther(dcarbonBal));

  backing = await bridge.getBackingBalance(bctAddr);
  console.log("  Bridge BCT backing after retire:", hre.ethers.formatEther(backing));

  console.log("");
  console.log("===========================================");
  console.log("  CarbonBridge DEPLOYED + TESTED");
  console.log("  MockBCT:", bctAddr);
  console.log("  CarbonBridge:", bridgeAddr);
  console.log("  dCARBON:", DCARBON);
  console.log("===========================================");
}

main().then(function() { process.exit(0); }).catch(function(e) { console.error(e); process.exit(1); });
