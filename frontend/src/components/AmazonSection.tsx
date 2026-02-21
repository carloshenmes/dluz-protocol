"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { useTranslation } from "@/i18n";

export function AmazonSection() {
  const { t } = useTranslation();

  return (
    <section id="amazonia" className="relative py-24 px-6 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-15"
      >
        <source
          src="https://framerusercontent.com/assets/trv2g3UtRZ11RXsBeRxJ9sQSYCw.mp4"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950/90 to-gray-950" />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
        <AnimateOnScroll direction="left">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-green-500/20 shadow-2xl shadow-green-500/5">
              <img
                src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80"
                alt="Amazon Rainforest aerial view"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-6 right-4 bg-gray-900/90 backdrop-blur-md border border-green-500/30 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
                  🌳
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t("amazon.stat.area")}</p>
                  <p className="text-xs text-gray-400">{t("amazon.stat.area.label")}</p>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="right">
          <div>
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              {t("amazon.tag")}
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {t("amazon.title.1")}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                {t("amazon.title.highlight")}
              </span>{" "}
              {t("amazon.title.2")}
            </h2>

            <p className="text-gray-400 leading-relaxed mb-6">
              {t("amazon.desc")}
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: "🌿", title: t("amazon.redd.title"), desc: t("amazon.redd.desc") },
                { icon: "☀️", title: t("amazon.solar.title"), desc: t("amazon.solar.desc") },
                { icon: "🔗", title: t("amazon.chain.title"), desc: t("amazon.chain.desc") },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <span className="text-2xl mt-1">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#tokens"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all text-sm font-medium"
            >
              {t("amazon.cta")}
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
