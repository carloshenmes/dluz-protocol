"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";

const timeline = [
  { phase: "Fase 1", year: "2024-2025", label: "Estruturação & Regulamentação", status: "active" },
  { phase: "Fase 2", year: "2026", label: "Monitoramento & Registro Piloto", status: "next" },
  { phase: "Fase 3", year: "2027-2028", label: "Operação Assistida do SBCE", status: "future" },
  { phase: "Fase 4", year: "2029-2030", label: "Operação Plena + Penalidades", status: "future" },
  { phase: "Fase 5", year: "2031+", label: "Maturidade & Expansão Global", status: "future" },
];

export function CarbonMarketSection() {
  return (
    <section id="carbon-market" className="py-24 px-6 border-t border-gray-800/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-emerald-900/5" />

      <div className="relative max-w-6xl mx-auto z-10">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              📊 Mercado Regulado de Carbono
            </span>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              O Brasil criou o{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                SBCE
              </span>{" "}
              — e o dLuz é a ponte on-chain
            </h2>

            <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A Lei nº 15.042/2024 instituiu o Sistema Brasileiro de Comércio de Emissões (SBCE),
              regulamentando o mercado de carbono no modelo cap-and-trade. Empresas que emitem acima de
              10 mil tCO₂e/ano serão reguladas. O dLuz Protocol tokeniza esses ativos — Cotas Brasileiras
              de Emissão (CBEs) e Certificados de Redução (CRVEs) — com transparência total na blockchain.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Timeline SBCE */}
        <AnimateOnScroll delay={0.1}>
          <div className="mb-16">
            <h3 className="text-lg font-semibold text-white text-center mb-8">
              Roadmap de Implementação do SBCE
            </h3>
            <div className="flex flex-col md:flex-row items-stretch gap-3 max-w-5xl mx-auto">
              {timeline.map((item, i) => (
                <div
                  key={item.phase}
                  className={`flex-1 rounded-xl p-4 border transition-all ${
                    item.status === "active"
                      ? "border-green-500/60 bg-green-500/10"
                      : item.status === "next"
                      ? "border-yellow-500/40 bg-yellow-500/5"
                      : "border-gray-800 bg-gray-900/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.status === "active"
                          ? "bg-green-400 animate-pulse"
                          : item.status === "next"
                          ? "bg-yellow-400"
                          : "bg-gray-600"
                      }`}
                    />
                    <span className="text-xs font-bold text-gray-300">{item.phase}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{item.year}</p>
                  <p className={`text-sm font-medium ${
                    item.status === "active" ? "text-green-300" : "text-gray-400"
                  }`}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* Cards info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {[
            {
              icon: "🏛️",
              title: "Regulamentado pela CVM",
              desc: "CBEs são classificadas como valores mobiliários. A CVM regula a negociação e custódia desses ativos no mercado brasileiro.",
            },
            {
              icon: "🌍",
              title: "Padrões Internacionais",
              desc: "Compatível com Verra (VCS), Gold Standard e UNFCCC. Créditos brasileiros reconhecidos globalmente via Artigo 6 do Acordo de Paris.",
            },
            {
              icon: "⛓️",
              title: "Tokenização On-Chain",
              desc: "dLuz registra CBEs e CRVEs na Base (Ethereum L2). Cada ativo tem hash verificável, imutável e auditável por qualquer pessoa.",
            },
          ].map((item, i) => (
            <AnimateOnScroll key={item.title} delay={i * 0.15}>
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all text-left h-full hover:scale-[1.02]">
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Stats do mercado */}
        <AnimateOnScroll delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {[
              { value: "US$ 100bi", label: "Projeção do mercado até 2030" },
              { value: "10K tCO₂e", label: "Limiar de regulação no SBCE" },
              { value: "5 fases", label: "Implementação até 2031+" },
              { value: "Cap & Trade", label: "Modelo adotado pelo Brasil" },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-gray-900/40 border border-gray-800 rounded-xl py-4 px-3 hover:border-green-500/20 transition-colors">
                <p className="text-xl font-bold text-green-400">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>

        {/* CTA */}
        <AnimateOnScroll delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl px-8 py-6">
            <div className="text-left">
              <p className="text-lg font-bold text-white">Pronto pra tokenizar?</p>
              <p className="text-sm text-gray-400">Conecte sua wallet e comece a negociar créditos de carbono on-chain.</p>
            </div>
            <a
              href="#dex"
              className="px-6 py-3 rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 transition-colors whitespace-nowrap"
            >
              Acessar DEX
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
