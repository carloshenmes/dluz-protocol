"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";

const skills = [
  { label: "Graphic Design", icon: "🎨" },
  { label: "Digital Media", icon: "📱" },
  { label: "Front-end / Web3", icon: "⚡" },
  { label: "Smart Contracts", icon: "📜" },
];

const links = [
  { label: "GitHub", href: "https://github.com/carloshenmes", icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
  )},
  { label: "X / Twitter", href: "https://x.com/carloshenmes", icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  )},
  { label: "LinkedIn", href: "https://linkedin.com/in/carloshenmes", icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  )},
];

export function TeamSection() {
  return (
    <section id="team" className="py-24 px-6 border-t border-gray-800/50">
      <div className="max-w-4xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              🐺 Quem Constrói
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Um protocolo,{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                um builder
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Construído com convicção por quem acredita que tecnologia e sustentabilidade 
              andam juntas — sem comitê, sem burocracia.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll scale blur>
          <div className="relative bg-gray-900/60 border border-gray-800 rounded-2xl p-8 md:p-10 glow-hover">
            {/* Tag lobo solitário */}
            <div className="absolute -top-3 right-6">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full">
                Solo Builder
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar placeholder */}
              <div className="shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 flex items-center justify-center">
                  <span className="text-5xl">🐺</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white">Carlos Henmes</h3>
                <p className="text-sm text-green-400 font-medium mb-1">aka C2 · RCK Dev</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-4">
                  Founder & Full-Stack Builder
                </p>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed max-w-lg">
                  Designer turned Web3 developer. Built the dLuz Protocol from scratch — 
                  concept, branding, smart contracts, and front-end. 
                  Focused on bridging real-world sustainability with decentralized tech.
                </p>

                {/* Skills */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                  {skills.map((s) => (
                    <span
                      key={s.label}
                      className="text-xs bg-gray-800/80 border border-gray-700/50 text-gray-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <span>{s.icon}</span>
                      {s.label}
                    </span>
                  ))}
                </div>

                {/* Social links */}
                <div className="flex justify-center md:justify-start gap-3">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-gray-800/80 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-all"
                      aria-label={link.label}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats mini */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-800/50">
              {[
                { value: "1", label: "Builder" },
                { value: "5+", label: "Deployed Contracts" },
                { value: "100%", label: "Open Source" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg font-bold text-green-400">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
