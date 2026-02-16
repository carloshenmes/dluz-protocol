"use client";

import { useAccount } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { TokenBalance } from "./TokenBalance";
import { Logo } from "./Logo";
import { LogoDCarbon } from "./LogoDCarbon";
import { LogoDEnergy } from "./LogoDEnergy";
import { AnimateOnScroll } from "./AnimateOnScroll";

const tokens = [
  { name: "dLuz Token", symbol: "dLUZ", contract: "DLuzToken", color: "yellow" },
  { name: "dCarbon Token", symbol: "dCARBON", contract: "DCarbonToken", color: "green" },
  { name: "dEnergy Token", symbol: "dENERGY", contract: "DEnergyToken", color: "blue" },
] as const;

const icons: Record<string, (size: number) => JSX.Element> = {
  DLuzToken: (size) => <Logo size={size} />,
  DCarbonToken: (size) => <LogoDCarbon size={size} />,
  DEnergyToken: (size) => <LogoDEnergy size={size} />,
};

export function Dashboard() {
  const { isConnected } = useAccount();

  return (
    <section id="dashboard" className="max-w-5xl mx-auto px-6 py-10">
      <AnimateOnScroll>
        <h2 className="text-lg font-semibold text-gray-300 mb-6">
          {isConnected ? "Seus Saldos" : "Conecte sua wallet para começar"}
        </h2>
      </AnimateOnScroll>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tokens.map((token, i) => (
          <AnimateOnScroll key={token.symbol} delay={i * 0.15}>
            <TokenBalance
              name={token.name}
              symbol={token.symbol}
              address={CONTRACTS[token.contract].address}
              abi={CONTRACTS[token.contract].abi}
              icon={icons[token.contract](36)}
              color={token.color}
            />
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
