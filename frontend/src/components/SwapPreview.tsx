"use client";

import { Logo } from "./Logo";
import { LogoDCarbon } from "./LogoDCarbon";
import { AnimateOnScroll } from "./AnimateOnScroll";

export function SwapPreview() {
  return (
    <section id="dex" className="py-20 px-6 border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <AnimateOnScroll direction="left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              DEX Nativa para{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Créditos de Carbono
              </span>
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Negocie tokens ambientais com liquidez, sem intermediários e com taxas mínimas.
              Pools de liquidez incentivadas com rewards em dLUZ.
            </p>
            <ul className="space-y-3 text-sm text-gray-300">
              {[
                "Swap instantâneo entre dLUZ ↔ dCARBON ↔ dENERGY",
                "Pools de liquidez com APY em dLUZ",
                "Sem KYC — conecte a wallet e negocie",
                "Taxas de 0.3% revertidas para holders",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="right">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 max-w-sm mx-auto w-full hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Swap</h3>
              <button className="text-gray-500 hover:text-gray-300 text-xl">⚙️</button>
            </div>

            <div className="rounded-xl bg-gray-800/60 p-4 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">De</span>
                <span className="text-xs text-gray-500">Saldo: 1,000.00</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="0.0"
                  className="bg-transparent text-2xl font-bold text-white outline-none w-full"
                  disabled
                />
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700 text-sm font-medium text-white">
                  <Logo size={22} /> dLUZ
                </button>
              </div>
            </div>

            <div className="flex justify-center -my-1 z-10 relative">
              <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-green-400 text-lg hover:bg-gray-700 transition-colors cursor-pointer">
                ↓
              </div>
            </div>

            <div className="rounded-xl bg-gray-800/60 p-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Para</span>
                <span className="text-xs text-gray-500">Saldo: 250.00</span>
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

            <button className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-black font-bold text-lg hover:opacity-90 transition-opacity">
              Conectar Wallet
            </button>

            <p className="text-center text-xs text-gray-600 mt-3">
              1 dLUZ ≈ 0.42 dCARBON • Slippage: 0.5%
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
