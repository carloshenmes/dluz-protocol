"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { Logo } from "./Logo";
import { LogoDCarbon } from "./LogoDCarbon";
import { LogoDEnergy } from "./LogoDEnergy";
import { useTranslation } from "@/i18n";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      icon: "📋",
      title: t("how.step1.title"),
      description: t("how.step1.desc"),
      detail: t("how.step1.detail"),
    },
    {
      number: "02",
      icon: "🪙",
      title: t("how.step2.title"),
      description: t("how.step2.desc"),
      detail: t("how.step2.detail"),
    },
    {
      number: "03",
      icon: "🔄",
      title: t("how.step3.title"),
      description: t("how.step3.desc"),
      detail: t("how.step3.detail"),
    },
    {
      number: "04",
      icon: "🔥",
      title: t("how.step4.title"),
      description: t("how.step4.desc"),
      detail: t("how.step4.detail"),
    },
  ];

  return (
    <section id="como-funciona" className="py-24 px-6 border-t border-gray-800/50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto z-10">
        <AnimateOnScroll>
          <div className="text-center mb-6">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              {t("how.tag")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("how.title")}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t("how.desc")}
            </p>
          </div>
        </AnimateOnScroll>

        {/* Token flow visual */}
        <AnimateOnScroll delay={0.1}>
          <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2">
              <Logo size={24} />
              <span className="text-sm text-gray-300">dLuz</span>
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
