import deployment from "./deployment.json";
import CarbonRegistryABI from "./abis/CarbonRegistry.json";
import DLuzTokenABI from "./abis/DLuzToken.json";
import DCarbonTokenABI from "./abis/DCarbonToken.json";
import DEnergyTokenABI from "./abis/DEnergyToken.json";
import DLuzDEXABI from "./abis/DLuzDEX.json";
import DLuzFarmingABI from "./abis/DLuzFarming.json";
import CarbonBridgeABI from "./abis/CarbonBridge.json";
import MockBCTABI from "./abis/MockBCT.json";

export const CONTRACTS = {
  CarbonRegistry: {
    address: deployment.contracts.CarbonRegistry as `0x${string}`,
    abi: CarbonRegistryABI.abi,
  },
  DLuzToken: {
    address: deployment.contracts.DLuzToken as `0x${string}`,
    abi: DLuzTokenABI.abi,
  },
  DCarbonToken: {
    address: deployment.contracts.DCarbonToken as `0x${string}`,
    abi: DCarbonTokenABI.abi,
  },
  DEnergyToken: {
    address: deployment.contracts.DEnergyToken as `0x${string}`,
    abi: DEnergyTokenABI.abi,
  },
  DLuzDEX: {
    address: deployment.contracts.DLuzDEX as `0x${string}`,
    abi: DLuzDEXABI.abi,
  },
  DLuzFarming: {
    address: deployment.contracts.DLuzFarming as `0x${string}`,
    abi: DLuzFarmingABI.abi,
  },
  CarbonBridge: {
    address: deployment.contracts.CarbonBridge as `0x${string}`,
    abi: CarbonBridgeABI.abi,
  },
  MockBCT: {
    address: deployment.contracts.MockBCT as `0x${string}`,
    abi: MockBCTABI.abi,
  },
} as const;
