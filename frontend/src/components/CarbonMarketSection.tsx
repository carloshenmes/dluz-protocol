"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { useTranslation } from "@/i18n";

export function CarbonMarketSection() {
  const { t } = useTranslation();

  const timeline = [
    { phase: "Fase 1", year: "2024-2025", label: t("market.phase1"), status: "active" },
    { phase: "Fase 2", year: "2026", label: t("market.phase2"), status: "next" },
    { phase: "Fase 3", year: "2027-2028", label: t("market.phase3"), status: "future" },
    { phase: "Fase 4", year: "2029-2030", label: t("market.phase4"), status: "future" },
    { phase: "Fase 5", year: "2031+", label: t("market.phase5"), status: "future" },
  ];

  return (
    <section id="carbon-market" className="py-24 px-6 border-t border-gray-800/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-emerald-900/5" />

      <div className="relative max-w-6xl mx-auto z-10">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              {t("market.tag")}
            </span>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {t("market.title.1")}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                {t("market.title.sbce")}
              </span>{" "}
              {t("market.title.2")}
            </h2>

            <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t("market.desc")}
            </p>
          </div>
        </AnimateOnScroll>

        {/* Timeline SBCE */}
        <AnimateOnScroll delay={0.1}>
          <div className="mb-16">
            <h3 className="text-lg font-semibold text-white text-center mb-8">
              {t("market.timeline.title")}
            </h3>
            <div className="flex flex-col md:flex-row items-stretch gap-3 max-w-5xl mx-auto">
              {timeline.map((item) => (
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
            { icon: "🏛️", title: t("market.card1.title"), desc: t("market.card1.desc") },
            { icon: "🌍", title: t("market.card2.title"), desc: t("market.card2.desc") },
            { icon: "⛓️", title: t("market.card3.title"), desc: t("market.card3.desc") },
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
              { value: "US$ 100bi", label: t("market.stat1") },
              { value: "10K tCO₂e", label: t("market.stat2") },
              { value: "5 fases", label: t("market.stat3") },
              { value: "Cap & Trade", label: t("market.stat4") },
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
              <p className="text-lg font-bold text-white">{t("market.cta.title")}</p>
              <p className="text-sm text-gray-400">{t("market.cta.desc")}</p>
            </div>
            <a
              href="#farm"
              className="px-6 py-3 rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 transition-colors whitespace-nowrap"
            >
              {t("market.cta.btn")}
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
