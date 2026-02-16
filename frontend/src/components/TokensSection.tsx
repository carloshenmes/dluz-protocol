"use client";

import { Logo } from "./Logo";
import { LogoDCarbon } from "./LogoDCarbon";
import { LogoDEnergy } from "./LogoDEnergy";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { ReactNode } from "react";

interface TokenData {
  name: string;
  symbol: string;
  logo: ReactNode;
  border: string;
  hoverBorder: string;
  description: string;
  features: string[];
}

const tokens: TokenData[] = [
  {
    name: "dLuz",
    symbol: "dLUZ",
    logo: <Logo size={48} />,
    border: "border-yellow-500/30",
    hoverBorder: "hover:border-yellow-500/60",
    description:
      "Token de governança do protocolo. Holders votam em propostas, validam projetos e recebem rewards.",
    features: ["Governança", "Staking", "Rewards"],
  },
  {
    name: "dCarbon",
    symbol: "dCARBON",
    logo: <LogoDCarbon size={48} />,
    border: "border-green-500/30",
    hoverBorder: "hover:border-green-500/60",
    description:
      "1 dCARBON = 1 tonelada de CO₂ compensada. Lastreado em créditos de carbono verificados on-chain.",
    features: ["Lastro Real", "Offsetting", "Burn to Retire"],
  },
  {
    name: "dEnergy",
    symbol: "dENERGY",
    logo: <LogoDEnergy size={48} />,
    border: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500/60",
    description:
      "Representa certificados de energia renovável (RECs). Cada token prova geração limpa verificada.",
    features: ["RECs On-Chain", "Rastreável", "Certificável"],
  },
];

export function TokensSection() {
  return (
    <section id="tokens" className="py-20 px-6 border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nossos Tokens
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Três tokens com propósito real — governança, compensação de carbono e energia renovável.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tokens.map((token, i) => (
            <AnimateOnScroll key={token.symbol} delay={i * 0.15}>
              <div
                className={`rounded-2xl border ${token.border} ${token.hoverBorder} bg-gray-900/60 p-8 transition-all group h-full hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-4 mb-6">
                  {token.logo}
                  <div>
                    <h3 className="text-xl font-bold text-white">{token.name}</h3>
                    <p className="text-sm text-gray-500">{token.symbol}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  {token.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {token.features.map((f) => (
                    <span
                      key={f}
                      className={`text-xs px-3 py-1 rounded-full border ${token.border} bg-gray-800/50 text-gray-300`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
