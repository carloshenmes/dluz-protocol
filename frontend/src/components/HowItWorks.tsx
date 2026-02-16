"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { Logo } from "./Logo";
import { LogoDCarbon } from "./LogoDCarbon";
import { LogoDEnergy } from "./LogoDEnergy";

const steps = [
  {
    number: "01",
    icon: "📋",
    title: "Registro & Verificação",
    description:
      "Projetos REDD+, energia solar, eólica ou biomassa registram créditos de carbono no smart contract. Dados verificados por auditores independentes conforme padrões Verra/Gold Standard.",
    detail: "Compatível com UNFCCC e Acordo de Paris",
  },
  {
    number: "02",
    icon: "🪙",
    title: "Tokenização On-Chain",
    description:
      "Cada crédito verificado gera tokens dCARBON (1 token = 1 tCO₂) ou dENERGY (1 token = 1 MWh REC). Imutáveis, rastreáveis e auditáveis na Base (Ethereum L2).",
    detail: "ERC-20 na rede Base • Gas < $0.01",
  },
  {
    number: "03",
    icon: "🔄",
    title: "Negocie na DEX",
    description:
      "Troque dCARBON, dLUZ e dENERGY na DEX nativa com liquidez, sem intermediários. Pools incentivadas com rewards em dLUZ para provedores de liquidez.",
    detail: "AMM com taxas de 0.3%",
  },
  {
    number: "04",
    icon: "🔥",
    title: "Retire & Compense",
    description:
      "Queime (burn) tokens dCARBON para compensar emissões. Um certificado on-chain imutável é gerado automaticamente, servindo como prova auditável de offsetting.",
    detail: "Burn-to-Retire • Certificado NFT",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-6 border-t border-gray-800/50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto z-10">
        <AnimateOnScroll>
          <div className="text-center mb-6">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              ⚙️ Protocolo
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Do registro ao offsetting em 4 etapas — tudo on-chain, auditável e transparente.
              Baseado nos padrões internacionais do Protocolo de Kyoto e do Acordo de Paris.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Token flow visual */}
        <AnimateOnScroll delay={0.1}>
          <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2">
              <Logo size={24} />
              <span className="text-sm text-gray-300">dLUZ</span>
            </div>
            <span className="text-green-500">↔</span>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2">
              <LogoDCarbon size={24} />
              <span className="text-sm text-gray-300">dCARBON</span>
            </div>
            <span className="text-green-500">↔</span>
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2">
              <LogoDEnergy size={24} />
              <span className="text-sm text-gray-300">dENERGY</span>
            </div>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <AnimateOnScroll key={step.number} delay={i * 0.15}>
              <div className="relative group rounded-2xl border border-gray-800 bg-gray-900/40 p-6 hover:border-green-500/40 transition-all h-full flex flex-col">
                <span className="text-5xl font-black text-gray-800 group-hover:text-green-900/50 transition-colors absolute top-4 right-4">
                  {step.number}
                </span>
                <span className="text-4xl mb-4 block">{step.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-grow">{step.description}</p>
                <span className="text-xs text-green-400/70 font-mono">{step.detail}</span>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-gray-700">→</div>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
