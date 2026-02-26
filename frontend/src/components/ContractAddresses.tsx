"use client";

import { useState } from "react";

const CONTRACTS = [
  {
    key: "DLuzToken",
    label: "dLuz",
    symbol: "DLUZ",
    color: "yellow",
    address: "0xF4FEECc50A0D3b81931AC8A1638fa419C0217Dd3",
  },
  {
    key: "DCarbonToken",
    label: "dCarbon",
    symbol: "dCARBON",
    color: "green",
    address: "0x1fA05a3c388066069A500157B9B43b287deA973f",
  },
  {
    key: "DEnergyToken",
    label: "dEnergy",
    symbol: "dENERGY",
    color: "blue",
    address: "0x6519F9b10C598652945c7b4cAc113251cf108b92",
  },
];

const BASESCAN = "https://sepolia.basescan.org/address/";

const colorMap: Record<string, { dot: string; badge: string; glow: string }> = {
  yellow: {
    dot: "bg-yellow-400",
    badge: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    glow: "hover:border-yellow-500/40",
  },
  green: {
    dot: "bg-green-400",
    badge: "bg-green-400/10 text-green-400 border-green-400/20",
    glow: "hover:border-green-500/40",
  },
  blue: {
    dot: "bg-blue-400",
    badge: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    glow: "hover:border-blue-500/40",
  },
};

export default function ContractAddresses() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (address: string, key: string) => {
    navigator.clipboard.writeText(address);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3 block">
            Base Sepolia · Chain ID 84532
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Contratos Verificados
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Endereços oficiais do protocolo dLuz deployados na testnet.
            Verifique sempre antes de interagir.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {CONTRACTS.map((c) => {
            const cl = colorMap[c.color];
            return (
              <div
                key={c.key}
                className={`group flex items-center justify-between gap-4 rounded-xl border border-white/8 ${cl.glow} bg-white/[0.03] px-5 py-4 transition-all`}
              >
                {/* Left — label + symbol */}
                <div className="flex items-center gap-3 min-w-[120px]">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${cl.dot}`} />
                  <span className="text-white font-semibold text-sm">{c.label}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${cl.badge}`}>
                    {c.symbol}
                  </span>
                </div>

                {/* Center — address */}
                <span className="font-mono text-xs text-gray-400 truncate flex-1 text-center hidden sm:block">
                  {c.address}
                </span>
                <span className="font-mono text-xs text-gray-400 sm:hidden">
                  {c.address.slice(0, 10)}…{c.address.slice(-6)}
                </span>

                {/* Right — actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copy(c.address, c.key)}
                    title="Copiar endereço"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-500 hover:text-white"
                  >
                    {copied === c.key ? (
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>

                  <a
                    href={`${BASESCAN}${c.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver no BaseScan"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-500 hover:text-blue-400"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-600 mt-6">
          Rede de produção (mainnet) em breve · Auditoria em andamento
        </p>
      </div>
    </section>
  );
}
