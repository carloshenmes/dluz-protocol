const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("═══════════════════════════════════════════════");
  console.log("  dLuz Protocol — FULL REDEPLOY (Tokenomics v2)");
  console.log("═══════════════════════════════════════════════");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // ── 1. Deploy DLuzToken (1B max, 300M initial) ──
  console.log("[1/6] Deploying DLuzToken...");
  let F = await hre.ethers.getContractFactory("DLuzToken");
  let dluzContract = await F.deploy(deployer.address);
  await dluzContract.waitForDeployment();
  const DLUZ = await dluzContract.getAddress();
  console.log("  ✅ DLuzToken:", DLUZ);
  console.log("     Max supply: 1,000,000,000 dLUZ");
  console.log("     Initial:      300,000,000 dLUZ → treasury");

  // ── 2. Deploy DCarbonToken ──
  console.log("\n[2/6] Deploying DCarbonToken...");
  F = await hre.ethers.getContractFactory("DCarbonToken");
  let dcarbonContract = await F.deploy();
  await dcarbonContract.waitForDeployment();
  const DCARBON = await dcarbonContract.getAddress();
  console.log("  ✅ DCarbonToken:", DCARBON);

  // ── 3. Deploy DEnergyToken ──
  console.log("\n[3/6] Deploying DEnergyToken...");
  F = await hre.ethers.getContractFactory("DEnergyToken");
  let denergyContract = await F.deploy();
  await denergyContract.waitForDeployment();
  const DENERGY = await denergyContract.getAddress();
  console.log("  ✅ DEnergyToken:", DENERGY);

  // ── 4. Deploy CarbonRegistry ──
  console.log("\n[4/6] Deploying CarbonRegistry...");
  F = await hre.ethers.getContractFactory("CarbonRegistry");
  let registryContract = await F.deploy(DCARBON, DENERGY, DLUZ, deployer.address);
  await registryContract.waitForDeployment();
  const REGISTRY = await registryContract.getAddress();
  console.log("  ✅ CarbonRegistry:", REGISTRY);
  console.log("     Treasury:", deployer.address);
  console.log("     dENERGY rate: 1:1");
  console.log("     dLUZ reward:  10:1");

  // ── 5. Configurar permissões ──
  console.log("\n[5/6] Setting up permissions...");

  // 5a. Grant MINTER_ROLE no DEnergyToken pro CarbonRegistry
  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));

  let tx = await denergyContract.grantRole(MINTER_ROLE, REGISTRY);
  await tx.wait();
  console.log("  ✅ DEnergyToken: MINTER_ROLE → CarbonRegistry");

  // 5b. Grant MINTER_ROLE no DCarbonToken pro deployer (já tem, mas confirma)
  const hasRole = await dcarbonContract.hasRole(MINTER_ROLE, deployer.address);
  console.log("  ✅ DCarbonToken: deployer has MINTER_ROLE:", hasRole);

  // 5c. Approve dLUZ do treasury (deployer) pro CarbonRegistry
  const approveAmount = hre.ethers.parseUnits("300000000", 18); // 300M
  tx = await dluzContract.approve(REGISTRY, approveAmount);
  await tx.wait();
  console.log("  ✅ dLUZ: Treasury approved 300,000,000 for CarbonRegistry");

  // ── 6. Salvar deployments ──
  console.log("\n[6/6] Saving deployment files...");
  const dep = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    tokenomics: {
      dluzMaxSupply: "1,000,000,000",
      dluzInitialSupply: "300,000,000",
      dluzRewardRate: "10:1 (per dCARBON retired)",
      energyMintRate: "1:1 (per dCARBON retired)",
      dcarbonMaxSupply: "unlimited (minted by verified entities)",
      denergyMaxSupply: "unlimited (minted on retirement)"
    },
    contracts: {
      DLuzToken: DLUZ,
      DCarbonToken: DCARBON,
      DEnergyToken: DENERGY,
      CarbonRegistry: REGISTRY,
    },
  };

  // Salvar em deployments/
  const deployDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir, { recursive: true });
  fs.writeFileSync(
    path.join(deployDir, hre.network.name + ".json"),
    JSON.stringify(dep, null, 2)
  );
  console.log("  ✅ deployments/" + hre.network.name + ".json");

  // Salvar no frontend
  const frontendConfig = path.join(__dirname, "..", "frontend", "src", "config");
  if (fs.existsSync(frontendConfig)) {
    fs.writeFileSync(
      path.join(frontendConfig, "deployment.json"),
      JSON.stringify(dep, null, 2)
    );
    console.log("  ✅ frontend/src/config/deployment.json");
  }

  // ── Verify on Basescan ──
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting 30s for Basescan indexing...");
    await new Promise((r) => setTimeout(r, 30000));

    const toVerify = [
      { name: "DLuzToken",      addr: DLUZ,     args: [deployer.address] },
      { name: "DCarbonToken",   addr: DCARBON,  args: [] },
      { name: "DEnergyToken",   addr: DENERGY,  args: [] },
      { name: "CarbonRegistry", addr: REGISTRY, args: [DCARBON, DENERGY, DLUZ, deployer.address] },
    ];

    for (const c of toVerify) {
      try {
        await hre.run("verify:verify", {
          address: c.addr,
          constructorArguments: c.args,
        });
        console.log("  ✅", c.name, "verified!");
      } catch (e) {
        console.log("  ⚠️ ", c.name, ":", e.message?.slice(0, 100));
      }
    }
  }

  // ── Summary ──
  console.log("\n═══════════════════════════════════════════════");
  console.log("  ✅ FULL REDEPLOY COMPLETO!");
  console.log("═══════════════════════════════════════════════");
  console.log("  DLuzToken:      ", DLUZ);
  console.log("  DCarbonToken:   ", DCARBON);
  console.log("  DEnergyToken:   ", DENERGY);
  console.log("  CarbonRegistry: ", REGISTRY);
  console.log("  Treasury:       ", deployer.address);
  console.log("═══════════════════════════════════════════════");
  console.log("\n  PRÓXIMOS PASSOS:");
  console.log("  1. Copiar ABIs atualizadas:");
  console.log("     cp artifacts/contracts/tokens/DLuzToken.sol/DLuzToken.json frontend/src/config/abis/");
  console.log("     cp artifacts/contracts/tokens/DCarbonToken.sol/DCarbonToken.json frontend/src/config/abis/");
  console.log("     cp artifacts/contracts/tokens/DEnergyToken.sol/DEnergyToken.json frontend/src/config/abis/");
  console.log("     cp artifacts/contracts/registry/CarbonRegistry.sol/CarbonRegistry.json frontend/src/config/abis/");
  console.log("  2. cd frontend && npm run build");
  console.log("═══════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
