import deployment from "./deployment.json";
import CarbonRegistryABI from "./abis/CarbonRegistry.json";
import DLuzTokenABI from "./abis/DLuzToken.json";
import DCarbonTokenABI from "./abis/DCarbonToken.json";
import DEnergyTokenABI from "./abis/DEnergyToken.json";

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
} as const;
