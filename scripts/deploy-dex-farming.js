const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // Endereços dos tokens já deployados
  const DLUZ = "0xF0807462147C10Eae2B53fa64C736d73A541950c";
  const DCARBON = "0x87605261111208e9f57CbA884d7c2bEcFe81C45D";
  const DENERGY = "0x8919646FAe7283842090eb86BA02D4683e501934";

  // ─── Deploy DLuzDEX ────────────────────────────────────────
  console.log("\n--- Deploying DLuzDEX ---");
  const DLuzDEX = await hre.ethers.getContractFactory("DLuzDEX");
  const dex = await DLuzDEX.deploy(deployer.address, deployer.address);
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  console.log("DLuzDEX deployed at:", dexAddress);

  // Criar pools: DLUZ↔dCARBON e DLUZ↔dENERGY
  console.log("Creating DLUZ/dCARBON pool...");
  let tx = await dex.createPool(DLUZ, DCARBON);
  await tx.wait();
  console.log("✅ DLUZ/dCARBON pool created");

  console.log("Creating DLUZ/dENERGY pool...");
  tx = await dex.createPool(DLUZ, DENERGY);
  await tx.wait();
  console.log("✅ DLUZ/dENERGY pool created");

  // ─── Deploy DLuzFarming ────────────────────────────────────
  console.log("\n--- Deploying DLuzFarming ---");
  const DLuzFarming = await hre.ethers.getContractFactory("DLuzFarming");
  const farming = await DLuzFarming.deploy(deployer.address, DLUZ);
  await farming.waitForDeployment();
  const farmingAddress = await farming.getAddress();
  console.log("DLuzFarming deployed at:", farmingAddress);

  // Criar farming pools:
  // Pool 0: Stake DLUZ → Earn dCARBON (0.01 dCARBON/seg)
  // Pool 1: Stake DLUZ → Earn dENERGY (0.005 dENERGY/seg)
  const dcarbonRate = hre.ethers.parseUnits("0.01", 18);  // 0.01 por segundo
  const denergyRate = hre.ethers.parseUnits("0.005", 18); // 0.005 por segundo

  console.log("Creating DLUZ→dCARBON farm pool...");
  tx = await farming.addPool(DCARBON, dcarbonRate);
  await tx.wait();
  console.log("✅ Farm pool 0 (DLUZ→dCARBON) created");

  console.log("Creating DLUZ→dENERGY farm pool...");
  tx = await farming.addPool(DENERGY, denergyRate);
  await tx.wait();
  console.log("✅ Farm pool 1 (DLUZ→dENERGY) created");

  // ─── Seed DEX com liquidez inicial ────────────────────────
  console.log("\n--- Seeding DEX liquidity ---");

  const dluzContract = await hre.ethers.getContractAt("DLuzToken", DLUZ);
  const dcarbonContract = await hre.ethers.getContractAt("DCarbonToken", DCARBON);
  const denergyContract = await hre.ethers.getContractAt("DEnergyToken", DENERGY);

  // Verificar balances
  const dluzBal = await dluzContract.balanceOf(deployer.address);
  console.log("DLUZ balance:", hre.ethers.formatUnits(dluzBal, 18));

  const seedDLUZ = hre.ethers.parseUnits("1000000", 18);   // 1M DLUZ por pool
  const seedDCARBON = hre.ethers.parseUnits("500000", 18); // 500k dCARBON
  const seedDENERGY = hre.ethers.parseUnits("500000", 18); // 500k dENERGY

  // Approve DEX
  console.log("Approving tokens for DEX...");
  tx = await dluzContract.approve(dexAddress, seedDLUZ * BigInt(2));
  await tx.wait();

  const dcarbonBal = await dcarbonContract.balanceOf(deployer.address);
  const denergyBal = await denergyContract.balanceOf(deployer.address);
  console.log("dCARBON balance:", hre.ethers.formatUnits(dcarbonBal, 18));
  console.log("dENERGY balance:", hre.ethers.formatUnits(denergyBal, 18));

  if (dcarbonBal >= seedDCARBON) {
    tx = await dcarbonContract.approve(dexAddress, seedDCARBON);
    await tx.wait();
    tx = await dex.addLiquidity(DLUZ, DCARBON, seedDLUZ, seedDCARBON);
    await tx.wait();
    console.log("✅ Liquidity added: 1M DLUZ + 500k dCARBON");
  } else {
    console.log("⚠️  Insufficient dCARBON for seeding. Skipping DLUZ/dCARBON liquidity.");
  }

  if (denergyBal >= seedDENERGY) {
    tx = await denergyContract.approve(dexAddress, seedDENERGY);
    await tx.wait();
    tx = await dex.addLiquidity(DLUZ, DENERGY, seedDLUZ, seedDENERGY);
    await tx.wait();
    console.log("✅ Liquidity added: 1M DLUZ + 500k dENERGY");
  } else {
    console.log("⚠️  Insufficient dENERGY for seeding. Skipping DLUZ/dENERGY liquidity.");
  }

  // ─── Salvar resultado ──────────────────────────────────────
  const result = {
    network: "baseSepolia",
    chainId: 84532,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      DLuzDEX: dexAddress,
      DLuzFarming: farmingAddress,
    },
    pools: {
      dex: ["DLUZ/dCARBON", "DLUZ/dENERGY"],
      farming: [
        { id: 0, stake: "DLUZ", reward: "dCARBON", rate: "0.01/sec" },
        { id: 1, stake: "DLUZ", reward: "dENERGY", rate: "0.005/sec" },
      ],
    },
  };

  console.log("\n📋 Deploy Result:");
  console.log(JSON.stringify(result, null, 2));

  // Salvar em arquivo
  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "dex-farming-sepolia.json"), JSON.stringify(result, null, 2));
  console.log("\n✅ Saved to deployments/dex-farming-sepolia.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
