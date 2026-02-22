"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/i18n";

export default function BugBountyPage() {
  const { t } = useTranslation();

  const severityLevels = [
    {
      level: t("bounty.critical"),
      color: "red",
      reward: "1,000 – 5,000 dLuz",
      examples: [
        t("bounty.ex.c1"),
        t("bounty.ex.c2"),
        t("bounty.ex.c3"),
        t("bounty.ex.c4"),
      ],
    },
    {
      level: t("bounty.high"),
      color: "orange",
      reward: "500 – 1,000 dLuz",
      examples: [
        t("bounty.ex.h1"),
        t("bounty.ex.h2"),
        t("bounty.ex.h3"),
        t("bounty.ex.h4"),
      ],
    },
    {
      level: t("bounty.medium"),
      color: "yellow",
      reward: "100 – 500 dLuz",
      examples: [
        t("bounty.ex.m1"),
        t("bounty.ex.m2"),
        t("bounty.ex.m3"),
        t("bounty.ex.m4"),
      ],
    },
    {
      level: t("bounty.low"),
      color: "green",
      reward: "25 – 100 dLuz",
      examples: [
        t("bounty.ex.l1"),
        t("bounty.ex.l2"),
        t("bounty.ex.l3"),
        t("bounty.ex.l4"),
      ],
    },
  ];

  const rules = [
    t("bounty.rule.1"),
    t("bounty.rule.2"),
    t("bounty.rule.3"),
    t("bounty.rule.4"),
    t("bounty.rule.5"),
    t("bounty.rule.6"),
    t("bounty.rule.7"),
    t("bounty.rule.8"),
  ];

  const inScope = [
    { name: t("bounty.in.1.name"), desc: t("bounty.in.1.desc") },
    { name: t("bounty.in.2.name"), desc: t("bounty.in.2.desc") },
    { name: t("bounty.in.3.name"), desc: t("bounty.in.3.desc") },
  ];

  const outOfScope = [
    t("bounty.out.1"),
    t("bounty.out.2"),
    t("bounty.out.3"),
    t("bounty.out.4"),
    t("bounty.out.5"),
  ];

  const colorMap: Record<string, { border: string; bg: string; text: string; dot: string }> = {
    red: { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500" },
    orange: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
    yellow: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500" },
    green: { border: "border-green-500/30", bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-500" },
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Header />

      {/* Hero */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium mb-6">
            <span>🛡️</span>
            <span>{t("bounty.tag")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("bounty.title")}
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              {t("bounty.title.highlight")}
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t("bounty.desc")}
          </p>
        </div>
      </section>

      {/* Severity Levels */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">{t("bounty.severity.title")}</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            {t("bounty.severity.desc")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {severityLevels.map((s) => {
              const c = colorMap[s.color];
              return (
                <div
                  key={s.level}
                  className={`rounded-xl border ${c.border} bg-gray-900/50 p-6 hover:bg-gray-900/80 transition-colors`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${c.dot}`} />
                      <h3 className={`text-lg font-bold ${c.text}`}>{s.level}</h3>
                    </div>
                    <span className={`text-sm font-mono px-3 py-1 rounded-full ${c.bg} ${c.text}`}>
                      {s.reward}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {s.examples.map((ex, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-gray-600 mt-0.5">›</span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scope */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">{t("bounty.scope.title")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <span>✅</span> {t("bounty.scope.in")}
              </h3>
              <div className="space-y-4">
                {inScope.map((item) => (
                  <div key={item.name} className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <h4 className="font-semibold text-white text-sm mb-1">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-500 mb-4 flex items-center gap-2">
                <span>⛔</span> {t("bounty.scope.out")}
              </h3>
              <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-5">
                <ul className="space-y-3">
                  {outOfScope.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="text-gray-700 mt-0.5">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">{t("bounty.rules.title")}</h2>
          <p className="text-gray-500 text-center mb-10">{t("bounty.rules.desc")}</p>

          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-8">
            <ol className="space-y-4">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-800 text-green-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-400 pt-1">{rule}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* How to Report */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">{t("bounty.report.title")}</h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">{t("bounty.report.desc")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 hover:border-green-500/30 transition-colors">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold text-white mb-2">Email</h3>
              <a href="mailto:dluzprotocol@gmail.com" className="text-sm text-green-400 hover:text-green-300 break-all">
                security@dluz.cc
              </a>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 hover:border-green-500/30 transition-colors">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-white mb-2">GitHub</h3>
              <a
                href="https://github.com/carloshenmes/dluz-protocol/security/advisories/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:text-green-300"
              >
                Security Advisory
              </a>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 hover:border-green-500/30 transition-colors">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-white mb-2">Telegram</h3>
              <a
                href="https://t.me/dluzprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:text-green-300"
              >
                @dluzprotocol
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-500/5 to-transparent p-12">
            <h2 className="text-2xl font-bold mb-4">{t("bounty.cta.title")}</h2>
            <p className="text-gray-400 mb-8">{t("bounty.cta.desc")}</p>
            <a
              href="mailto:dluzprotocol@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded-xl transition-colors"
            >
              🛡️ {t("bounty.cta.btn")}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
