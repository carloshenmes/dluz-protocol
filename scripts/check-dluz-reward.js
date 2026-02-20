const hre = require("hardhat");

async function main() {
  const TX_HASH = "0x17b000c542654f6211cbf88c40932f83883e9c1dd5a61c7707eca2939d706e7f";
  const REGISTRY = "0x5f40481a41DF8588D88042F0a461Fcb237b7deB3";

  const registry = await hre.ethers.getContractAt("CarbonRegistry", REGISTRY);
  const receipt = await hre.ethers.provider.getTransactionReceipt(TX_HASH);

  console.log("═══════════════════════════════════════════");
  console.log("  Events from retire tx");
  console.log("═══════════════════════════════════════════\n");
  console.log("Tx:", TX_HASH);
  console.log("Total logs:", receipt.logs.length, "\n");

  receipt.logs.forEach(function (log, i) {
    try {
      const parsed = registry.interface.parseLog({ topics: log.topics, data: log.data });
      if (parsed) {
        console.log("Event #" + i + ":", parsed.name);
        parsed.fragment.inputs.forEach(function (input, j) {
          let val = parsed.args[j];
          if (typeof val === "bigint") val = hre.ethers.formatEther(val) + " (wei: " + val.toString() + ")";
          console.log("  " + input.name + ":", val);
        });
        console.log("");
      }
    } catch (e) {
      // Not a Registry event, try to decode as ERC20 Transfer
      try {
        const erc20Iface = new hre.ethers.Interface([
          "event Transfer(address indexed from, address indexed to, uint256 value)",
          "event Approval(address indexed owner, address indexed spender, uint256 value)"
        ]);
        const parsed = erc20Iface.parseLog({ topics: log.topics, data: log.data });
        if (parsed) {
          console.log("Event #" + i + ": [ERC20]", parsed.name, "on", log.address);
          parsed.fragment.inputs.forEach(function (input, j) {
            let val = parsed.args[j];
            if (typeof val === "bigint") val = hre.ethers.formatEther(val);
            console.log("  " + input.name + ":", val);
          });
          console.log("");
        }
      } catch (e2) {
        console.log("Event #" + i + ": (unrecognized) topic0:", log.topics[0], "\n");
      }
    }
  });
}

main().then(function () { process.exit(0); }).catch(function (e) { console.error(e); process.exit(1); });
