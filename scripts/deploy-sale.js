const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const DLUZ_TOKEN = process.env.DLUZ_TOKEN_ADDRESS;
  if (!DLUZ_TOKEN) {
    console.error("❌ Defina DLUZ_TOKEN_ADDRESS no .env");
    process.exit(1);
  }

  // 3.125.000 dLUZ por 1 ETH (~$0.0008/dLUZ com ETH a $2500)
  const RATE = hre.ethers.parseUnits("3125000", 18);

  console.log("Token:", DLUZ_TOKEN);
  console.log("Rate:", RATE.toString());

  const DLuzSale = await hre.ethers.getContractFactory("DLuzSale");
  const sale = await DLuzSale.deploy(DLUZ_TOKEN, RATE, deployer.address);
  await sale.waitForDeployment();

  const addr = await sale.getAddress();
  console.log("✅ DLuzSale deployed:", addr);
  console.log("\n📋 Próximo passo: enviar dLUZ tokens para o contrato de venda");
}

main().catch((err) => { console.error(err); process.exit(1); });
