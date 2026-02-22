const hre = require("hardhat");
const dep = require("../deployments/baseSepolia.json");

async function main() {
  const c = dep.contracts;
  const [signer] = await hre.ethers.getSigners();
  const fmt = hre.ethers.formatEther;
  const parse = hre.ethers.parseEther;
  const farming = await hre.ethers.getContractAt("DLuzFarming", c.DLuzFarming);
  const dluz = await hre.ethers.getContractAt("DLuzToken", c.DLuzToken);

  // Current state
  const info = await farming.userInfo(0, signer.address);
  console.log(`Staked: ${fmt(info[0])} DLUZ`);
  console.log(`DLUZ balance before: ${fmt(await dluz.balanceOf(signer.address))}`);

  // Method 1: populateTransaction
  console.log("\n--- Method 1: populateTransaction ---");
  const populated = await farming.unstake.populateTransaction(0, parse("100"));
  console.log(`  to: ${populated.to}`);
  console.log(`  data: ${populated.data}`);
  console.log(`  data length: ${populated.data?.length}`);

  // Send the populated tx directly through the provider
  console.log("\n--- Sending via provider.send ---");
  const provider = hre.ethers.provider;
  
  // Use the populated tx with signer
  const tx = await signer.sendTransaction({
    to: populated.to,
    data: populated.data,
    gasLimit: 300000n,
  });
  console.log(`  tx hash: ${tx.hash}`);
  
  // Check what was actually sent
  const txData = await provider.getTransaction(tx.hash);
  console.log(`  on-chain tx.data: ${txData.data}`);
  console.log(`  on-chain tx.data length: ${txData.data?.length}`);

  const receipt = await tx.wait();
  console.log(`  status: ${receipt.status}`);
  console.log(`  gasUsed: ${receipt.gasUsed}`);

  console.log(`\nDLUZ balance after: ${fmt(await dluz.balanceOf(signer.address))}`);
  const infoAfter = await farming.userInfo(0, signer.address);
  console.log(`Staked after: ${fmt(infoAfter[0])} DLUZ`);
}

main().catch(e => { console.error(e); process.exit(1); });
