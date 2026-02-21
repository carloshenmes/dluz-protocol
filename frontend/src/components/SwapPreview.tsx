"use client";

import { Logo } from "./Logo";
import { LogoDCarbon } from "./LogoDCarbon";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { useTranslation } from "@/i18n";

export function SwapPreview() {
  const { t } = useTranslation();

  return (
    <section id="dex" className="py-20 px-6 border-t border-gray-800/50 bg-gradient-to-b from-transparent via-teal-950/10 to-transparent">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <AnimateOnScroll direction="left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("swap.title.1")}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                {t("swap.title.highlight")}
              </span>
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t("swap.desc")}
            </p>
            <ul className="space-y-3 text-sm text-gray-300">
              {[
                { icon: "🔄", text: t("swap.feat1") },
                { icon: "💧", text: t("swap.feat2") },
                { icon: "🔓", text: t("swap.feat3") },
                { icon: "💎", text: t("swap.feat4") },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-2">
                  <span className="mt-0.5">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="right">
          <div className="rounded-2xl border border-teal-500/20 bg-gray-900/80 p-6 max-w-sm mx-auto w-full hover:border-teal-400/40 transition-colors shadow-lg shadow-teal-500/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                🔄 Swap
              </h3>
              <button className="text-gray-500 hover:text-gray-300 text-xl">⚙️</button>
            </div>

            <div className="rounded-xl bg-gray-800/60 p-4 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{t("swap.from")}</span>
                <span className="text-xs text-gray-500">{t("swap.balance")} 1,000.00</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="0.0"
                  className="bg-transparent text-2xl font-bold text-white outline-none w-full"
                  disabled
                />
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700 text-sm font-medium text-white">
                  <Logo size={22} /> dLuz
                </button>
              </div>
            </div>

            <div className="flex justify-center -my-1 z-10 relative">
              <div className="w-10 h-10 rounded-xl bg-gray-800 border border-teal-500/30 flex items-center justify-center text-teal-400 text-lg hover:bg-gray-700 transition-colors cursor-pointer">
                ↓
              </div>
            </div>

            <div className="rounded-xl bg-gray-800/60 p-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{t("swap.to")}</span>
                <span className="text-xs text-gray-500">{t("swap.balance")} 250.00</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="0.0"
                  className="bg-transparent text-2xl font-bold text-white outline-none w-full"
                  disabled
                />
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700 text-sm font-medium text-white">
                  <LogoDCarbon size={22} /> dCARBON
                </button>
              </div>
            </div>

            <button className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-black font-bold text-lg hover:opacity-90 transition-opacity">
              {t("swap.connect")}
            </button>

            <p className="text-center text-xs text-gray-600 mt-3">
              {t("swap.rate")}
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
