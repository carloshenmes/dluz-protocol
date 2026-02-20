import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia, base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "dLuz Protocol",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
  chains: [base, baseSepolia],
  ssr: true,
});
