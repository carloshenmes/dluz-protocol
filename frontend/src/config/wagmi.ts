import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia, base } from "wagmi/chains";
import deployment from "./deployment.json";

const chainMap = {
  84532: baseSepolia,
  8453: base,
} as const;

const primaryChain = chainMap[deployment.chainId as keyof typeof chainMap] || baseSepolia;
const secondaryChain = primaryChain === base ? baseSepolia : base;

export const config = getDefaultConfig({
  appName: "dLuz Protocol",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
  chains: [primaryChain, secondaryChain],
  ssr: true,
});
