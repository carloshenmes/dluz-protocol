"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { useTranslation } from "@/i18n";

export function PartnersSection() {
  const { t } = useTranslation();

  const standards = [
    { name: "Verra (VCS)", desc: t("partners.verra.desc"), color: "text-blue-400" },
    { name: "Gold Standard", desc: t("partners.gold.desc"), color: "text-yellow-400" },
    { name: "UNFCCC / CDM", desc: t("partners.unfccc.desc"), color: "text-cyan-400" },
    { name: "SBCE / CBE", desc: t("partners.sbce.desc"), color: "text-green-400" },
  ];

  const integrations = [
    { name: "Base", desc: t("partners.base.desc"), icon: "🔵" },
    { name: "Chainlink", desc: t("partners.chainlink.desc"), icon: "🔗" },
    { name: "IPFS", desc: t("partners.ipfs.desc"), icon: "📦" },
    { name: "The Graph", desc: t("partners.graph.desc"), icon: "📊" },
  ];

  return (
    <section id="partners" className="py-24 px-6 border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              {t("partners.tag")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("partners.title.1")}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                {t("partners.title.highlight")}
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t("partners.desc")}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Standards */}
          <AnimateOnScroll direction="left">
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">✓</span>
                {t("partners.standards.title")}
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
                {t("partners.tech.title")}
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
                  <p className="text-sm font-semibold text-white">{t("partners.audit.title")}</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t("partners.audit.desc")}
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
