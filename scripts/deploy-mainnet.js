const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * dLuz Protocol — Production Deploy Script
 * 
 * Deploys ALL contracts in correct order with role setup.
 * Works on baseSepolia (test) and base (production).
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-mainnet.js --network baseSepolia
 *   npx hardhat run scripts/deploy-mainnet.js --network base
 */

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const SALE_RATE = hre.ethers.parseUnits("3125000", 18); // 3.125M DLUZ per ETH (~$0.0008)
const PRESALE_FUNDING = hre.ethers.parseUnits("250000000", 18); // 250M DLUZ → Sale
const REGISTRY_APPROVAL = hre.ethers.parseUnits("100000000", 18); // 100M DLUZ → Registry rewards
const FARMING_REWARD_RATE_CARBON = hre.ethers.parseUnits("0.01", 18); // 0.01 dCARBON/sec
const FARMING_REWARD_RATE_ENERGY = hre.ethers.parseUnits("0.005", 18); // 0.005 dENERGY/sec

// BCT on Base mainnet (Toucan via KlimaDAO)
const BCT_BASE_MAINNET = "0x576bca23dcb6d94ff8e537d88b0d3e1bead444a2";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   dLuz Protocol — Production Deploy               ║");
  console.log("╚═══════════════════════════════════════════════════╝");
  console.log("  Network :", network);
  console.log("  Chain ID:", hre.network.config.chainId);
  console.log("  Deployer:", deployer.address);
  console.log("  Balance :", hre.ethers.formatEther(balance), "ETH");
  console.log("");

  // Safety check
  if (network === "base") {
    console.log("  ⚠️  MAINNET DEPLOY — 10 second confirmation window...");
    await new Promise((r) => setTimeout(r, 10000));
    console.log("  ✅ Proceeding with mainnet deploy\n");
  }

  const deployed = {};
  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));

  // ══════════════════════════════════════════════════════════
  // PHASE 1: CORE TOKENS
  // ══════════════════════════════════════════════════════════
  console.log("━━━ PHASE 1: Core Tokens ━━━\n");

  // 1. DLuzToken
  console.log("[1/10] DLuzToken...");
  const DLuzToken = await hre.ethers.getContractFactory("DLuzToken");
  const dluz = await DLuzToken.deploy(deployer.address);
  await dluz.waitForDeployment();
  deployed.DLuzToken = await dluz.getAddress();
  console.log("  ✅", deployed.DLuzToken);
  console.log("     Initial: 500,000,000 DLUZ → deployer");
  console.log("     Max:   1,000,000,000 DLUZ\n");

  // 2. DCarbonToken
  console.log("[2/10] DCarbonToken...");
  const DCarbonToken = await hre.ethers.getContractFactory("DCarbonToken");
  const dcarbon = await DCarbonToken.deploy();
  await dcarbon.waitForDeployment();
  deployed.DCarbonToken = await dcarbon.getAddress();
  console.log("  ✅", deployed.DCarbonToken, "\n");

  // 3. DEnergyToken
  console.log("[3/10] DEnergyToken...");
  const DEnergyToken = await hre.ethers.getContractFactory("DEnergyToken");
  const denergy = await DEnergyToken.deploy();
  await denergy.waitForDeployment();
  deployed.DEnergyToken = await denergy.getAddress();
  console.log("  ✅", deployed.DEnergyToken, "\n");

  // ══════════════════════════════════════════════════════════
  // PHASE 2: INFRASTRUCTURE
  // ══════════════════════════════════════════════════════════
  console.log("━━━ PHASE 2: Infrastructure ━━━\n");

  // 4. CarbonBridge
  console.log("[4/10] CarbonBridge...");
  const CarbonBridge = await hre.ethers.getContractFactory("CarbonBridge");
  const bridge = await CarbonBridge.deploy(deployed.DCarbonToken, deployer.address);
  await bridge.waitForDeployment();
  deployed.CarbonBridge = await bridge.getAddress();
  console.log("  ✅", deployed.CarbonBridge, "\n");

  // 5. CarbonRegistry
  console.log("[5/10] CarbonRegistry...");
  const CarbonRegistry = await hre.ethers.getContractFactory("CarbonRegistry");
  const registry = await CarbonRegistry.deploy(
    deployed.DCarbonToken,
    deployed.DEnergyToken,
    deployed.DLuzToken,
    deployer.address // treasury
  );
  await registry.waitForDeployment();
  deployed.CarbonRegistry = await registry.getAddress();
  console.log("  ✅", deployed.CarbonRegistry);
  console.log("     dENERGY rate: 1:1");
  console.log("     DLUZ reward:  10:1\n");

  // 6. DLuzSale
  console.log("[6/10] DLuzSale...");
  const DLuzSale = await hre.ethers.getContractFactory("DLuzSale");
  const sale = await DLuzSale.deploy(deployed.DLuzToken, SALE_RATE, deployer.address);
  await sale.waitForDeployment();
  deployed.DLuzSale = await sale.getAddress();
  console.log("  ✅", deployed.DLuzSale);
  console.log("     Rate: 3,125,000 DLUZ/ETH\n");

  // 7. TeamVesting
  console.log("[7/10] TeamVesting...");
  const TeamVesting = await hre.ethers.getContractFactory("TeamVesting");
  const vesting = await TeamVesting.deploy(deployed.DLuzToken);
  await vesting.waitForDeployment();
  deployed.TeamVesting = await vesting.getAddress();
  console.log("  ✅", deployed.TeamVesting, "\n");

  // ══════════════════════════════════════════════════════════
  // PHASE 3: DEFI
  // ══════════════════════════════════════════════════════════
  console.log("━━━ PHASE 3: DeFi ━━━\n");

  // 8. DLuzDEX
  console.log("[8/10] DLuzDEX...");
  const DLuzDEX = await hre.ethers.getContractFactory("DLuzDEX");
  const dex = await DLuzDEX.deploy(deployer.address, deployer.address);
  await dex.waitForDeployment();
  deployed.DLuzDEX = await dex.getAddress();
  console.log("  ✅", deployed.DLuzDEX, "\n");

  // 9. DLuzFarming
  console.log("[9/10] DLuzFarming...");
  const DLuzFarming = await hre.ethers.getContractFactory("DLuzFarming");
  const farming = await DLuzFarming.deploy(deployer.address, deployed.DLuzToken);
  await farming.waitForDeployment();
  deployed.DLuzFarming = await farming.getAddress();
  console.log("  ✅", deployed.DLuzFarming, "\n");

  // ══════════════════════════════════════════════════════════
  // PHASE 4: CONFIGURATION
  // ══════════════════════════════════════════════════════════
  console.log("━━━ PHASE 4: Configuration ━━━\n");
  console.log("[10/10] Setting roles & funding...\n");

  // 4a. Grant MINTER_ROLE on DCarbonToken → CarbonBridge
  let tx = await dcarbon.grantRole(MINTER_ROLE, deployed.CarbonBridge);
  await tx.wait();
  console.log("  ✅ DCarbonToken: MINTER_ROLE → CarbonBridge");

  // 4b. Grant MINTER_ROLE on DCarbonToken → CarbonRegistry (pra retire flow não precisa, mas pra consistência)
  // Registry não minta dCARBON, ele BURN. Então não precisa.

  // 4c. Grant MINTER_ROLE on DEnergyToken → CarbonRegistry
  tx = await denergy.grantRole(MINTER_ROLE, deployed.CarbonRegistry);
  await tx.wait();
  console.log("  ✅ DEnergyToken: MINTER_ROLE → CarbonRegistry");

  // 4d. Accept BCT on CarbonBridge (mainnet only)
  if (network === "base") {
    tx = await bridge.addToken(BCT_BASE_MAINNET);
    await tx.wait();
    console.log("  ✅ CarbonBridge: BCT accepted (", BCT_BASE_MAINNET, ")");
  } else {
    // Deploy MockBCT for testnet
    console.log("  ℹ️  Testnet: deploying MockBCT...");
    const MockBCT = await hre.ethers.getContractFactory("MockBCT");
    const mockBCT = await MockBCT.deploy();
    await mockBCT.waitForDeployment();
    deployed.MockBCT = await mockBCT.getAddress();
    tx = await bridge.addToken(deployed.MockBCT);
    await tx.wait();
    console.log("  ✅ CarbonBridge: MockBCT accepted (", deployed.MockBCT, ")");
  }

  // 4e. Approve DLUZ for CarbonRegistry rewards
  tx = await dluz.approve(deployed.CarbonRegistry, REGISTRY_APPROVAL);
  await tx.wait();
  console.log("  ✅ DLUZ: 100,000,000 approved for CarbonRegistry rewards");

  // 4f. Fund DLuzSale with presale tokens
  tx = await dluz.transfer(deployed.DLuzSale, PRESALE_FUNDING);
  await tx.wait();
  console.log("  ✅ DLUZ: 250,000,000 transferred to DLuzSale");

  // 4g. Create DEX pools
  tx = await dex.createPool(deployed.DLuzToken, deployed.DCarbonToken);
  await tx.wait();
  console.log("  ✅ DEX Pool: DLUZ/dCARBON");

  tx = await dex.createPool(deployed.DLuzToken, deployed.DEnergyToken);
  await tx.wait();
  console.log("  ✅ DEX Pool: DLUZ/dENERGY");

  // 4h. Create Farming pools
  tx = await farming.addPool(deployed.DCarbonToken, FARMING_REWARD_RATE_CARBON);
  await tx.wait();
  console.log("  ✅ Farming Pool 0: Stake DLUZ → earn dCARBON (0.01/sec)");

  tx = await farming.addPool(deployed.DEnergyToken, FARMING_REWARD_RATE_ENERGY);
  await tx.wait();
  console.log("  ✅ Farming Pool 1: Stake DLUZ → earn dENERGY (0.005/sec)");

  // ══════════════════════════════════════════════════════════
  // SAVE DEPLOYMENT
  // ══════════════════════════════════════════════════════════
  const deployerBalance = await dluz.balanceOf(deployer.address);
  const saleBalance = await dluz.balanceOf(deployed.DLuzSale);

  const deployment = {
    network: network,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployed,
    tokenomics: {
      maxSupply: "1,000,000,000 DLUZ",
      initialMint: "500,000,000 DLUZ",
      deployerBalance: hre.ethers.formatEther(deployerBalance) + " DLUZ",
      saleBalance: hre.ethers.formatEther(saleBalance) + " DLUZ",
      remainingMintable: hre.ethers.formatEther(await dluz.remainingMintable()) + " DLUZ",
    },
    roles: {
      "DCarbonToken.MINTER_ROLE": [deployed.CarbonBridge, deployer.address],
      "DEnergyToken.MINTER_ROLE": [deployed.CarbonRegistry, deployer.address],
      "DLuzToken.owner": deployer.address,
      "CarbonBridge.MANAGER_ROLE": deployer.address,
      "CarbonRegistry.owner": deployer.address,
      "DLuzSale.owner": deployer.address,
      "DLuzDEX.owner": deployer.address,
      "DLuzFarming.owner": deployer.address,
      "TeamVesting.owner": deployer.address,
    },
    dex: {
      pools: ["DLUZ/dCARBON", "DLUZ/dENERGY"],
      fee: "0.3%",
    },
    farming: {
      pools: [
        { id: 0, stake: "DLUZ", reward: "dCARBON", rate: "0.01/sec" },
        { id: 1, stake: "DLUZ", reward: "dENERGY", rate: "0.005/sec" },
      ],
    },
  };

  const deployDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir, { recursive: true });

  const filename = `${network}-${Date.now()}.json`;
  fs.writeFileSync(path.join(deployDir, filename), JSON.stringify(deployment, null, 2));
  // Also overwrite the network file for latest reference
  fs.writeFileSync(path.join(deployDir, `${network}.json`), JSON.stringify(deployment, null, 2));

  // Save to frontend if exists
  const frontendConfig = path.join(__dirname, "..", "frontend", "src", "config");
  if (fs.existsSync(frontendConfig)) {
    fs.writeFileSync(
      path.join(frontendConfig, "deployment.json"),
      JSON.stringify(deployment, null, 2)
    );
    console.log("\n  ✅ frontend/src/config/deployment.json updated");
  }

  // ══════════════════════════════════════════════════════════
  // VERIFY ON BASESCAN
  // ══════════════════════════════════════════════════════════
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n━━━ Basescan Verification ━━━\n");
    console.log("  ⏳ Waiting 30s for block indexing...");
    await new Promise((r) => setTimeout(r, 30000));

    const toVerify = [
      { name: "DLuzToken", addr: deployed.DLuzToken, args: [deployer.address] },
      { name: "DCarbonToken", addr: deployed.DCarbonToken, args: [] },
      { name: "DEnergyToken", addr: deployed.DEnergyToken, args: [] },
      { name: "CarbonBridge", addr: deployed.CarbonBridge, args: [deployed.DCarbonToken, deployer.address] },
      { name: "CarbonRegistry", addr: deployed.CarbonRegistry, args: [deployed.DCarbonToken, deployed.DEnergyToken, deployed.DLuzToken, deployer.address] },
      { name: "DLuzSale", addr: deployed.DLuzSale, args: [deployed.DLuzToken, SALE_RATE, deployer.address] },
      { name: "TeamVesting", addr: deployed.TeamVesting, args: [deployed.DLuzToken] },
      { name: "DLuzDEX", addr: deployed.DLuzDEX, args: [deployer.address, deployer.address] },
      { name: "DLuzFarming", addr: deployed.DLuzFarming, args: [deployer.address, deployed.DLuzToken] },
    ];

    if (deployed.MockBCT) {
      toVerify.push({ name: "MockBCT", addr: deployed.MockBCT, args: [] });
    }

    for (const c of toVerify) {
      try {
        await hre.run("verify:verify", {
          address: c.addr,
          constructorArguments: c.args,
        });
        console.log("  ✅", c.name, "verified");
      } catch (e) {
        const msg = e.message || "";
        if (msg.includes("Already Verified")) {
          console.log("  ⏭️ ", c.name, "already verified");
        } else {
          console.log("  ⚠️ ", c.name, ":", msg.slice(0, 120));
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║   ✅ dLuz Protocol — DEPLOY COMPLETE              ║");
  console.log("╠═══════════════════════════════════════════════════╣");
  console.log("║  TOKENS                                           ║");
  console.log("║  DLuzToken:      ", deployed.DLuzToken, "  ║");
  console.log("║  DCarbonToken:   ", deployed.DCarbonToken, "  ║");
  console.log("║  DEnergyToken:   ", deployed.DEnergyToken, "  ║");
  console.log("╠═══════════════════════════════════════════════════╣");
  console.log("║  INFRASTRUCTURE                                   ║");
  console.log("║  CarbonBridge:   ", deployed.CarbonBridge, "  ║");
  console.log("║  CarbonRegistry: ", deployed.CarbonRegistry, "  ║");
  console.log("║  DLuzSale:       ", deployed.DLuzSale, "  ║");
  console.log("║  TeamVesting:    ", deployed.TeamVesting, "  ║");
  console.log("╠═══════════════════════════════════════════════════╣");
  console.log("║  DEFI                                             ║");
  console.log("║  DLuzDEX:        ", deployed.DLuzDEX, "  ║");
  console.log("║  DLuzFarming:    ", deployed.DLuzFarming, "  ║");
  console.log("╠═══════════════════════════════════════════════════╣");
  console.log("║  BALANCES                                         ║");
  console.log("║  Deployer DLUZ:  ", hre.ethers.formatEther(deployerBalance));
  console.log("║  Sale DLUZ:      ", hre.ethers.formatEther(saleBalance));
  console.log("║  Remaining mint: ", hre.ethers.formatEther(await dluz.remainingMintable()));
  console.log("╠═══════════════════════════════════════════════════╣");
  console.log("║  Saved: deployments/" + filename);
  console.log("╚═══════════════════════════════════════════════════╝");
  console.log("");
  console.log("  NEXT STEPS:");
  console.log("  1. Run: npx hardhat run scripts/verify-deployment.js --network", network);
  console.log("  2. Run: npx hardhat run scripts/distribute-tokens.js --network", network);
  console.log("  3. Add liquidity to Uniswap V3 (DLUZ/ETH)");
  console.log("  4. Lock LP via Team.Finance");
  console.log("  5. Update frontend ABIs");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Deploy failed:", e);
    process.exit(1);
  });
