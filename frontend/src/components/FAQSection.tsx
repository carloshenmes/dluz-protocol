"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { useState } from "react";
import { useTranslation } from "@/i18n";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-xl cursor-pointer transition-all duration-300 ${
        open
          ? "border-green-500/40 bg-green-500/5 shadow-[0_0_16px_rgba(34,197,94,0.08)]"
          : "border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/60"
      }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-5">
        <h3 className="text-sm font-semibold text-white pr-4">{q}</h3>
        <span
          className={`text-green-400 text-xl transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </div>

      <div className="faq-answer" data-open={open}>
        <div className="faq-answer-inner">
          <div className="px-5 pb-5 -mt-1">
            <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const { t } = useTranslation();

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
  ];

  return (
    <section id="faq" className="py-24 px-6 border-t border-gray-800/50">
      <div className="max-w-3xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              ❓ {t("faq.tag")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("faq.title")}
            </h2>
            <p className="text-gray-400">
              {t("faq.desc")}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AnimateOnScroll key={faq.q} delay={i * 0.08}>
              <FAQItem q={faq.q} a={faq.a} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
