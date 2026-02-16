"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";

const standards = [
  { name: "Verra (VCS)", desc: "Verified Carbon Standard — maior registro global de créditos voluntários", color: "text-blue-400" },
  { name: "Gold Standard", desc: "Fundado pelo WWF — foco em co-benefícios sociais e ambientais", color: "text-yellow-400" },
  { name: "UNFCCC / CDM", desc: "Mecanismo de Desenvolvimento Limpo das Nações Unidas", color: "text-cyan-400" },
  { name: "SBCE / CBE", desc: "Sistema Brasileiro de Comércio de Emissões — Lei 15.042/2024", color: "text-green-400" },
];

const integrations = [
  { name: "Base", desc: "Ethereum L2", icon: "🔵" },
  { name: "Chainlink", desc: "Oráculos de dados", icon: "🔗" },
  { name: "IPFS", desc: "Armazenamento descentralizado", icon: "📦" },
  { name: "The Graph", desc: "Indexação on-chain", icon: "📊" },
];

export function PartnersSection() {
  return (
    <section id="partners" className="py-24 px-6 border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              🔍 Verificação & Infraestrutura
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Padrões que{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                garantem confiança
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              O dLuz Protocol só aceita créditos verificados por registros reconhecidos internacionalmente.
              Toda a infraestrutura é construída sobre tecnologias descentralizadas e auditáveis.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Standards */}
          <AnimateOnScroll direction="left">
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">✓</span>
                Padrões de Verificação Aceitos
              </h3>
              <div className="space-y-4">
                {standards.map((std) => (
                  <div key={std.name} className="flex items-start gap-4 bg-gray-900/40 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-colors">
                    <div className={`text-xl font-bold ${std.color} mt-0.5 whitespace-nowrap`}>
                      {std.name.split(" ")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{std.name}</p>
                      <p className="text-xs text-gray-400">{std.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          {/* Tech stack */}
          <AnimateOnScroll direction="right">
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">⚡</span>
                Infraestrutura Técnica
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {integrations.map((tech) => (
                  <div key={tech.name} className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 hover:border-green-500/30 transition-colors text-center">
                    <span className="text-3xl mb-3 block">{tech.icon}</span>
                    <p className="text-sm font-semibold text-white">{tech.name}</p>
                    <p className="text-xs text-gray-500">{tech.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-gray-900/40 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">🛡️</span>
                  <p className="text-sm font-semibold text-white">Smart Contracts Auditáveis</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Todos os contratos são open-source, verificados na BaseScan e seguem padrões OpenZeppelin.
                  Código disponível no GitHub para auditoria pública.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
