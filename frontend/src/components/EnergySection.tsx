"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const energyData = [
  { source: "Solar", percent: 45, icon: "☀️", color: "bg-yellow-400" },
  { source: "Eólica", percent: 30, icon: "💨", color: "bg-cyan-400" },
  { source: "Biomassa", percent: 15, icon: "🌱", color: "bg-green-400" },
  { source: "PCH", percent: 10, icon: "💧", color: "bg-blue-400" },
];

function AnimatedBar({ percent, color, delay }: { percent: number; color: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
      <motion.div
        className={`${color} h-3 rounded-full`}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${percent}%` } : { width: 0 }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
      />
    </div>
  );
}

export function EnergySection() {
  return (
    <section id="energia" className="py-24 px-6 border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <AnimateOnScroll direction="left">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4 block">
              ⚡ Energia Renovável
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Brasil:{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
                83% da matriz elétrica
              </span>{" "}
              é renovável
            </h2>

            <p className="text-gray-400 leading-relaxed mb-8">
              Somos potência global em energia limpa. O dLuz Protocol tokeniza Certificados de
              Energia Renovável (RECs) de projetos solares, eólicos e de biomassa do Brasil,
              transformando cada MWh gerado em tokens dENERGY negociáveis na DEX.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "180 GW", label: "Capacidade Instalada" },
                { value: "83%", label: "Matriz Renovável" },
                { value: "#1", label: "Eólica na América Latina" },
                { value: "3x", label: "Crescimento Solar (5 anos)" },
              ].map((stat, i) => (
                <AnimateOnScroll key={stat.label} delay={i * 0.1}>
                  <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center hover:border-green-500/30 transition-colors">
                    <p className="text-xl font-bold text-green-400">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="right">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-white mb-6">
              Fontes tokenizadas no protocolo
            </h3>

            <div className="space-y-5">
              {energyData.map((item, i) => (
                <div key={item.source}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm text-gray-300">{item.source}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.percent}%</span>
                  </div>
                  <AnimatedBar percent={item.percent} color={item.color} delay={i * 0.2} />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total tokenizado</span>
                <span className="text-lg font-bold text-green-400">3,200 MWh</span>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
