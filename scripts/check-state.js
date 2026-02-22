const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");
async function main() {
  const c = dep.contracts;
  const [s] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);
  const dc = await hre.ethers.getContractAt("IERC20", c.DCarbonToken);
  const de = await hre.ethers.getContractAt("IERC20", c.DEnergyToken);
  const bct = await hre.ethers.getContractAt("IERC20", c.MockBCT);
  console.log("=== Saldos do Signer ===");
  console.log("DLUZ:", fmt(await dluz.balanceOf(s.address)));
  console.log("dCARBON:", fmt(await dc.balanceOf(s.address)));
  console.log("dENERGY:", fmt(await de.balanceOf(s.address)));
  console.log("MockBCT:", fmt(await bct.balanceOf(s.address)));
  console.log("\n=== Saldos dos Contratos ===");
  console.log("DLUZ no Sale:", fmt(await dluz.balanceOf(c.DLuzSale)));
  console.log("DLUZ no Farming:", fmt(await dluz.balanceOf(c.DLuzFarming)));
  console.log("MockBCT no Bridge:", fmt(await bct.balanceOf(c.CarbonBridge)));
  console.log("\n=== Bridge Config ===");
  const bridge = await hre.ethers.getContractAt("CarbonBridge", c.CarbonBridge);
  try { console.log("MockBCT accepted:", await bridge.acceptedTokens(c.MockBCT)); } catch(e) { console.log("acceptedTokens failed:", e.message.slice(0,120)); }
  console.log("\n=== Farming Pending ===");
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  try { console.log("Pending pool 0:", fmt(await farming.pendingReward(0, s.address))); } catch(e) { console.log("pendingReward failed:", e.message.slice(0,120)); }
}
main().catch(console.error);
