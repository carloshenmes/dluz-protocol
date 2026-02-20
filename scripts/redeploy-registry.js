const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("═══════════════════════════════════════════");
  console.log("  dLuz Protocol — Redeploy CarbonRegistry");
  console.log("═══════════════════════════════════════════");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");

  // Endereços dos tokens JÁ deployados (não mudam)
  const DCARBON  = "0xB93ACd30A7eb798f66B4d69Cb2dd26d7581E9641";
  const DENERGY  = "0xdFA156De300e756D0FcCe2C1ce0e926863cbBaB8";
  const DLUZ     = "0xAB466632039be4DCCD2B881dEFa76e26D9e7e089";
  const TREASURY = deployer.address; // deployer como treasury por enquanto

  console.log("\nTokens existentes:");
  console.log("  dCARBON:", DCARBON);
  console.log("  dENERGY:", DENERGY);
  console.log("  dLUZ:   ", DLUZ);
  console.log("  Treasury:", TREASURY);

  // 1. Deploy novo CarbonRegistry
  console.log("\n[1/4] Deploying CarbonRegistry...");
  const Factory = await hre.ethers.getContractFactory("CarbonRegistry");
  const registry = await Factory.deploy(DCARBON, DENERGY, DLUZ, TREASURY);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("  ✅ CarbonRegistry:", registryAddr);

  // 2. Conceder MINTER_ROLE no DEnergyToken pro novo registry
  console.log("\n[2/4] Granting mint role on DEnergyToken...");
  const dEnergy = await hre.ethers.getContractAt("DEnergyToken", DENERGY);
  try {
    // Se DEnergyToken usa Ownable (mint só pelo owner), transferir ownership
    // Se usa AccessControl, grant MINTER_ROLE
    // Tenta primeiro com grantRole (AccessControl)
    const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
    const tx1 = await dEnergy.grantRole(MINTER_ROLE, registryAddr);
    await tx1.wait();
    console.log("  ✅ MINTER_ROLE granted via AccessControl");
  } catch (e) {
    try {
      // Fallback: tenta transferOwnership se for Ownable-based mint
      const tx1 = await dEnergy.transferOwnership(registryAddr);
      await tx1.wait();
      console.log("  ✅ Ownership transferred to new registry");
    } catch (e2) {
      console.log("  ⚠️  Não conseguiu grant automático. Verificar manualmente.");
      console.log("     Erro:", e2.message?.slice(0, 100));
    }
  }

  // 3. Approve dLUZ treasury → novo registry
  console.log("\n[3/4] Approving dLUZ spend by new registry...");
  const dLuz = await hre.ethers.getContractAt("IERC20", DLUZ);
  const approveAmount = hre.ethers.parseUnits("100000000", 18); // 100M dLUZ
  const tx2 = await dLuz.approve(registryAddr, approveAmount);
  await tx2.wait();
  console.log("  ✅ Approved", hre.ethers.formatUnits(approveAmount, 18), "dLUZ");

  // 4. Salvar deployment atualizado
  console.log("\n[4/4] Saving deployment...");
  const dep = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      DLuzToken: DLUZ,
      DCarbonToken: DCARBON,
      DEnergyToken: DENERGY,
      CarbonRegistry: registryAddr,
    },
  };

  // Salvar em deployments/
  const dir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, hre.network.name + ".json"),
    JSON.stringify(dep, null, 2)
  );

  // Salvar direto no frontend
  const frontendPath = path.join(
    __dirname, "..", "frontend", "src", "config", "deployment.json"
  );
  fs.writeFileSync(frontendPath, JSON.stringify(dep, null, 2));

  console.log("  ✅ Saved deployments/" + hre.network.name + ".json");
  console.log("  ✅ Saved frontend/src/config/deployment.json");

  // Verify
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting 30s for Basescan indexing...");
    await new Promise((r) => setTimeout(r, 30000));
    try {
      await hre.run("verify:verify", {
        address: registryAddr,
        constructorArguments: [DCARBON, DENERGY, DLUZ, TREASURY],
      });
      console.log("  ✅ Verified on Basescan!");
    } catch (e) {
      console.log("  ⚠️  Verify failed:", e.message?.slice(0, 120));
    }
  }

  console.log("\n═══════════════════════════════════════════");
  console.log("  DONE! Novo CarbonRegistry:", registryAddr);
  console.log("═══════════════════════════════════════════");
  console.log("\n⚠️  PRÓXIMOS PASSOS:");
  console.log("  1. Copiar ABI atualizada pro frontend:");
  console.log("     cp artifacts/contracts/registry/CarbonRegistry.sol/CarbonRegistry.json \\");
  console.log("        frontend/src/config/abis/CarbonRegistry.json");
  console.log("  2. Rebuild frontend: cd frontend && npm run build");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
