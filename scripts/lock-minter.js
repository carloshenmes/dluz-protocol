const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const depPath = path.join(__dirname, "..", "deployments", hre.network.name + ".json");
  const dep = JSON.parse(fs.readFileSync(depPath, "utf8"));

  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", dep.contracts.DCarbonToken);
  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));

  // Verificar quem tem MINTER_ROLE
  const deployerHas = await dcarbon.hasRole(MINTER_ROLE, deployer.address);
  console.log("Deployer tem MINTER_ROLE:", deployerHas);

  if (deployerHas) {
    console.log("🔒 Revogando MINTER_ROLE do deployer...");
    const tx = await dcarbon.revokeRole(MINTER_ROLE, deployer.address);
    await tx.wait();
    console.log("✅ Revogado! Agora só o Bridge pode mintar dCARBON.");
    console.log("Tx:", tx.hash);
  }

  // Confirmar
  const check = await dcarbon.hasRole(MINTER_ROLE, deployer.address);
  console.log("Deployer MINTER_ROLE agora:", check);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
