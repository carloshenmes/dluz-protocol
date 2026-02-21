const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("dLuz Protocol - Full Deployment");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  const treasury = deployer.address;

  let F = await hre.ethers.getContractFactory("DLuzToken");
  let dluzContract = await F.deploy(deployer.address);
  await dluzContract.waitForDeployment();
  const dluz = await dluzContract.getAddress();
  console.log("DLuzToken:", dluz);

  F = await hre.ethers.getContractFactory("DCarbonToken");
  let dcarbonContract = await F.deploy();
  await dcarbonContract.waitForDeployment();
  const dcarbon = await dcarbonContract.getAddress();
  console.log("DCarbonToken:", dcarbon);

  F = await hre.ethers.getContractFactory("DEnergyToken");
  let denergyContract = await F.deploy();
  await denergyContract.waitForDeployment();
  const denergy = await denergyContract.getAddress();
  console.log("DEnergyToken:", denergy);

  F = await hre.ethers.getContractFactory("CarbonRegistry");
  let registryContract = await F.deploy(dcarbon, denergy, dluz, treasury);
  await registryContract.waitForDeployment();
  const registry = await registryContract.getAddress();
  console.log("CarbonRegistry:", registry);

  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  await denergyContract.grantRole(MINTER_ROLE, registry);
  console.log("MINTER_ROLE granted to CarbonRegistry on DEnergyToken");

  await dluzContract.approve(registry, hre.ethers.MaxUint256);
  console.log("Treasury approved CarbonRegistry for DLUZ transfers");

  const dep = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    treasury: treasury,
    timestamp: new Date().toISOString(),
    contracts: {
      DLuzToken: dluz,
      DCarbonToken: dcarbon,
      DEnergyToken: denergy,
      CarbonRegistry: registry
    }
  };

  const dir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, hre.network.name + ".json"), JSON.stringify(dep, null, 2));
  console.log("Saved: deployments/" + hre.network.name + ".json");

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting 30s for block confirmations...");
    await new Promise((r) => setTimeout(r, 30000));
    const list = [
      { n: "DLuzToken", a: dluz, c: [deployer.address] },
      { n: "DCarbonToken", a: dcarbon, c: [] },
      { n: "DEnergyToken", a: denergy, c: [] },
      { n: "CarbonRegistry", a: registry, c: [dcarbon, denergy, dluz, treasury] }
    ];
    for (const item of list) {
      try {
        await hre.run("verify:verify", { address: item.a, constructorArguments: item.c });
        console.log(item.n + " verified!");
      } catch (e) {
        console.log(item.n + " verify failed: " + e.message);
      }
    }
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
