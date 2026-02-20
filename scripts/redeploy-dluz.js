const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const deploymentPath = path.join(__dirname, "..", "deployments", "baseSepolia.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  console.log("🔄 dLuz Protocol — Redeploy DLuzToken");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("\n⚠️  DLuzToken antigo (ownership presa):", deployment.contracts.DLuzToken);

  // Deploy novo DLuzToken
  console.log("\nDeployando novo DLuzToken...");
  const DLuzToken = await hre.ethers.getContractFactory("DLuzToken");
  const dluz = await DLuzToken.deploy(deployer.address);
  await dluz.waitForDeployment();
  const newAddress = await dluz.getAddress();

  // Confirmar estado
  const owner = await dluz.owner();
  const supply = await dluz.totalSupply();
  const remainingMintable = await dluz.remainingMintable();

  console.log("\n✅ Novo DLuzToken deployado!");
  console.log("  Endereço:", newAddress);
  console.log("  Owner:", owner);
  console.log("  Supply:", hre.ethers.formatUnits(supply, 18), "DLUZ");
  console.log("  Mintable restante:", hre.ethers.formatUnits(remainingMintable, 18), "DLUZ");

  // Atualizar deployment JSON
  const oldAddress = deployment.contracts.DLuzToken;
  deployment.contracts.DLuzToken = newAddress;
  deployment.timestamp = new Date().toISOString();
  deployment.notes = deployment.notes || [];
  deployment.notes.push({
    date: new Date().toISOString(),
    action: "Redeploy DLuzToken",
    reason: "Ownership do contrato anterior foi transferida para CarbonRegistry por engano",
    oldAddress: oldAddress,
    newAddress: newAddress,
  });

  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("\n📄 deployments/baseSepolia.json atualizado!");

  // Verificar no BaseScan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Aguardando 30s para verificação no BaseScan...");
    await new Promise((r) => setTimeout(r, 30000));
    try {
      await hre.run("verify:verify", {
        address: newAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✅ Verificado no BaseScan!");
    } catch (e) {
      console.log("⚠️  Verificação falhou:", e.message);
    }
  }

  console.log("\n🎉 Redeploy concluído! Próximo passo: atualizar endereço no frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error("❌", e.message); process.exit(1); });
