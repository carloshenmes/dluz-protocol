import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "dLuz Protocol",
  projectId: "dluz-protocol-dev", // WalletConnect projectId (placeholder p/ dev)
  chains: [baseSepolia],
  ssr: true,
});
