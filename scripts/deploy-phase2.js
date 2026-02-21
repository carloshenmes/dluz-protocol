const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("===========================================");
  console.log("  dLuz Protocol - Phase 2 Deployment");
  console.log("===========================================");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  var DLUZ    = "0xF0807462147C10Eae2B53fa64C736d73A541950c";
  var DCARBON = "0x87605261111208e9f57CbA884d7c2bEcFe81C45D";
  var DENERGY = "0x8919646FAe7283842090eb86BA02D4683e501934";
  var treasury = deployer.address;

  var dluzContract = await hre.ethers.getContractAt("DLuzToken", DLUZ);
  var denergyContract = await hre.ethers.getContractAt("DEnergyToken", DENERGY);
  var MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));

  console.log("Deploying RetirementVault...");
  var F = await hre.ethers.getContractFactory("RetirementVault");
  var vaultContract = await F.deploy(DLUZ, DCARBON, DENERGY, treasury);
  await vaultContract.waitForDeployment();
  var vault = await vaultContract.getAddress();
  console.log("  RetirementVault:", vault);

  console.log("Deploying DLuzDEX...");
  F = await hre.ethers.getContractFactory("DLuzDEX");
  var dexContract = await F.deploy(deployer.address, treasury);
  await dexContract.waitForDeployment();
  var dex = await dexContract.getAddress();
  console.log("  DLuzDEX:", dex);

  console.log("Deploying DLuzFarming...");
  F = await hre.ethers.getContractFactory("DLuzFarming");
  var farmingContract = await F.deploy(deployer.address, DLUZ);
  await farmingContract.waitForDeployment();
  var farming = await farmingContract.getAddress();
  console.log("  DLuzFarming:", farming);

  var saleRate = hre.ethers.parseEther("10000");
  console.log("Deploying DLuzSale...");
  F = await hre.ethers.getContractFactory("DLuzSale");
  var saleContract = await F.deploy(DLUZ, saleRate, deployer.address);
  await saleContract.waitForDeployment();
  var sale = await saleContract.getAddress();
  console.log("  DLuzSale:", sale);

  console.log("Deploying TeamVesting...");
  F = await hre.ethers.getContractFactory("TeamVesting");
  var vestingContract = await F.deploy(DLUZ);
  await vestingContract.waitForDeployment();
  var vesting = await vestingContract.getAddress();
  console.log("  TeamVesting:", vesting);

  console.log("Configuring roles and approvals...");
  await denergyContract.grantRole(MINTER_ROLE, vault);
  console.log("  MINTER_ROLE granted to RetirementVault");

  var vaultFunding = hre.ethers.parseEther("1000000");
  await dluzContract.transfer(vault, vaultFunding);
  console.log("  Funded RetirementVault with 1M DLUZ");

  var saleFunding = hre.ethers.parseEther("5000000");
  await dluzContract.transfer(sale, saleFunding);
  console.log("  Funded DLuzSale with 5M DLUZ");

  console.log("Creating DEX pools...");
  await dexContract.createPool(DLUZ, DCARBON);
  console.log("  Pool: DLUZ <> dCARBON");
  await dexContract.createPool(DLUZ, DENERGY);
  console.log("  Pool: DLUZ <> dENERGY");

  var dep = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    treasury: treasury,
    timestamp: new Date().toISOString(),
    phase: 2,
    contracts: {
      DLuzToken: DLUZ,
      DCarbonToken: DCARBON,
      DEnergyToken: DENERGY,
      CarbonRegistry: "0x73fdbf1652Dc01b8104b127c48B064BE94bD4fBf",
      RetirementVault: vault,
      DLuzDEX: dex,
      DLuzFarming: farming,
      DLuzSale: sale,
      TeamVesting: vesting
    },
    config: {
      saleRate: saleRate.toString(),
      vaultFunding: vaultFunding.toString(),
      saleFunding: saleFunding.toString()
    }
  };

  var dir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  var filePath = path.join(dir, hre.network.name + ".json");
  fs.writeFileSync(filePath, JSON.stringify(dep, null, 2));

  console.log("===========================================");
  console.log("  PHASE 2 COMPLETA - 5 novos contratos");
  console.log("  Saved:", filePath);
  console.log("===========================================");

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Aguardando 30s para confirmacoes...");
    await new Promise(function(r) { setTimeout(r, 30000); });
    var list = [
      { n: "RetirementVault", a: vault, c: [DLUZ, DCARBON, DENERGY, treasury] },
      { n: "DLuzDEX", a: dex, c: [deployer.address, treasury] },
      { n: "DLuzFarming", a: farming, c: [deployer.address, DLUZ] },
      { n: "DLuzSale", a: sale, c: [DLUZ, saleRate, deployer.address] },
      { n: "TeamVesting", a: vesting, c: [DLUZ] }
    ];
    for (var i = 0; i < list.length; i++) {
      try {
        await hre.run("verify:verify", { address: list[i].a, constructorArguments: list[i].c });
        console.log("  OK " + list[i].n + " verified!");
      } catch (e) {
        console.log("  FAIL " + list[i].n + ": " + e.message);
      }
    }
  }
}

main().then(function() { process.exit(0); }).catch(function(e) { console.error(e); process.exit(1); });
