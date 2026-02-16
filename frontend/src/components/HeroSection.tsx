"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo } from "./Logo";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center px-6">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source
          src="https://framerusercontent.com/assets/qMZ2Orb9iADjnbyqmbRS2bmK0.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950" />
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-transparent to-emerald-900/10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/8 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-6"
        >
          <Logo size={90} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Construído na Base • Powered by Ethereum
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6"
        >
          <span className="text-white">Da </span>
          <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent animate-shimmer">
            Amazônia
          </span>
          <span className="text-white"> para o</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent animate-shimmer">
            Blockchain
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          O primeiro protocolo brasileiro descentralizado para tokenização e negociação
          de créditos de carbono. Protegendo florestas, incentivando energia limpa e
          gerando valor real para o planeta.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex items-center justify-center gap-4 flex-wrap mb-16"
        >
          <ConnectButton />
          <a
            href="#como-funciona"
            className="px-6 py-3 rounded-xl border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all backdrop-blur-sm"
          >
            Explorar Protocolo →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { label: "Hectares Protegidos", value: "12,500+" },
            { label: "tCO₂ Tokenizados", value: "50,000+" },
            { label: "Energia Limpa (MWh)", value: "3,200" },
            { label: "Holders", value: "128" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
              className="text-center backdrop-blur-sm bg-gray-900/30 rounded-xl py-4 px-3 border border-gray-800/50 hover:border-green-500/30 transition-colors"
            >
              <p className="text-2xl md:text-3xl font-bold text-green-400">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-green-500/40 flex items-start justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
