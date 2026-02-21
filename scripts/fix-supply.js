const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Endereços da Sepolia (do deployment.json)
  const DCARBON_ADDR  = "0x87605261111208e9f57CbA884d7c2bEcFe81C45D";
  const BRIDGE_ADDR   = "0xB7a98b07DD1D73b111D2679ED219eE4693F9505B";
  const MOCKBCT_ADDR  = "0x313c8F9B7cFFcE27FE0AF4b12344d3b66cFf5F2E";

  const dcarbon = await hre.ethers.getContractAt("DCarbonToken", DCARBON_ADDR);
  const bridge  = await hre.ethers.getContractAt("CarbonBridge", BRIDGE_ADDR);
  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));

  // ════════════════════════════════════════
  //  PASSO 1: Diagnóstico
  // ════════════════════════════════════════
  const totalSupply     = await dcarbon.totalSupply();
  const deployerBalance = await dcarbon.balanceOf(deployer.address);
  const bridgeBacking   = await bridge.getBackingBalance(MOCKBCT_ADDR);
  const bridgeHasMinter = await dcarbon.hasRole(MINTER_ROLE, BRIDGE_ADDR);
  const deployerHasMinter = await dcarbon.hasRole(MINTER_ROLE, deployer.address);

  console.log("══════════════════════════════════════");
  console.log("  ESTADO ATUAL");
  console.log("══════════════════════════════════════");
  console.log("Total Supply dCARBON:", hre.ethers.formatEther(totalSupply));
  console.log("Deployer balance:    ", hre.ethers.formatEther(deployerBalance));
  console.log("Bridge BCT backing:  ", hre.ethers.formatEther(bridgeBacking));
  console.log("Bridge tem MINTER:   ", bridgeHasMinter);
  console.log("Deployer tem MINTER: ", deployerHasMinter);

  // Calcular excesso: tudo que o deployer tem ALÉM do que o bridge garante
  // O bridge tem 100 BCT. O deployer pode ter recebido 90 do bridge (100 - 10 retired).
  // Qualquer coisa acima do totalSupply esperado (= bridgeBacking) é excesso.
  const expectedSupply = bridgeBacking; // supply deveria ser <= BCT no bridge
  const excess = totalSupply - expectedSupply;

  if (excess <= 0n) {
    console.log("\n✅ Supply já está coerente. Nada a fazer.");
    return;
  }

  console.log("\n⚠️  Excesso sem lastro:", hre.ethers.formatEther(excess), "dCARBON");

  // ════════════════════════════════════════
  //  PASSO 2: Queimar o excesso do deployer
  // ════════════════════════════════════════
  const burnAmount = deployerBalance > excess ? excess : deployerBalance;

  if (burnAmount > 0n) {
    console.log("\n🔥 Queimando", hre.ethers.formatEther(burnAmount), "dCARBON sem lastro...");
    const tx = await dcarbon.burn(burnAmount);
    await tx.wait();
    console.log("   ✅ Queimado! Tx:", tx.hash);
  }

  // ════════════════════════════════════════
  //  PASSO 3: Revogar MINTER_ROLE do deployer
  // ════════════════════════════════════════
  if (deployerHasMinter) {
    if (!bridgeHasMinter) {
      console.log("\n⚠️  Bridge NÃO tem MINTER_ROLE! Concedendo antes de revogar do deployer...");
      const txGrant = await dcarbon.grantRole(MINTER_ROLE, BRIDGE_ADDR);
      await txGrant.wait();
      console.log("   ✅ MINTER_ROLE concedido ao Bridge");
    }

    console.log("\n🔒 Revogando MINTER_ROLE do deployer...");
    const txRevoke = await dcarbon.revokeRole(MINTER_ROLE, deployer.address);
    await txRevoke.wait();
    console.log("   ✅ Revogado! Agora APENAS o Bridge pode mintar dCARBON.");
  }

  // ════════════════════════════════════════
  //  PASSO 4: Verificação final
  // ════════════════════════════════════════
  const newSupply    = await dcarbon.totalSupply();
  const newBalance   = await dcarbon.balanceOf(deployer.address);
  const newBacking   = await bridge.getBackingBalance(MOCKBCT_ADDR);
  const ratio        = newBacking > 0n
    ? Number((newBacking * 10000n) / newSupply) / 100
    : 0;

  console.log("\n══════════════════════════════════════");
  console.log("  ESTADO FINAL");
  console.log("══════════════════════════════════════");
  console.log("Total Supply dCARBON:", hre.ethers.formatEther(newSupply));
  console.log("Deployer balance:    ", hre.ethers.formatEther(newBalance));
  console.log("Bridge BCT backing:  ", hre.ethers.formatEther(newBacking));
  console.log("Backing Ratio:       ", ratio + "%");
  console.log("Bridge MINTER:       ", await dcarbon.hasRole(MINTER_ROLE, BRIDGE_ADDR));
  console.log("Deployer MINTER:     ", await dcarbon.hasRole(MINTER_ROLE, deployer.address));

  if (ratio >= 100) {
    console.log("\n🟢 Supply 100% lastreado. Projeto seguro.");
  } else {
    console.log("\n🟡 Ratio < 100%. Pode haver dCARBON em outros endereços sem lastro.");
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
