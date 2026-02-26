"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n";

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

const colorMap: Record<string, { dot: string; badge: string; row: string; icon: string }> = {
  yellow: {
    dot: "bg-yellow-400",
    badge: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/25 ring-0",
    row: "hover:border-yellow-500/30 hover:bg-yellow-500/5",
    icon: "hover:text-yellow-400",
  },
  green: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/25",
    row: "hover:border-emerald-500/30 hover:bg-emerald-500/5",
    icon: "hover:text-emerald-400",
  },
  blue: {
    dot: "bg-blue-400",
    badge: "bg-blue-400/10 text-blue-400 border border-blue-400/25",
    row: "hover:border-blue-500/30 hover:bg-blue-500/5",
    icon: "hover:text-blue-400",
  },
};

export default function ContractAddresses() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (address: string, key: string) => {
    navigator.clipboard.writeText(address);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest text-gray-500 uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t("contracts.tag")}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            {t("contracts.title")}
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            {t("contracts.subtitle")}
          </p>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2">
          {CONTRACTS.map((c, i) => {
            const cl = colorMap[c.color];
            return (
              <div
                key={c.key}
                className={`group flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] ${cl.row} bg-white/[0.025] px-5 py-4 transition-all duration-200`}
              >
                {/* Index */}
                <span className="text-[11px] font-mono text-gray-600 w-4 shrink-0 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Dot + label + badge */}
                <div className="flex items-center gap-2.5 min-w-[140px] shrink-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${cl.dot}`} />
                  <span className="text-white font-semibold text-sm">{c.label}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${cl.badge}`}>
                    {c.symbol}
                  </span>
                </div>

                {/* Address — full on desktop, truncated on mobile */}
                <span className="font-mono text-xs text-gray-500 truncate flex-1 text-center hidden sm:block select-all">
                  {c.address}
                </span>
                <span className="font-mono text-xs text-gray-500 sm:hidden select-all">
                  {c.address.slice(0, 8)}…{c.address.slice(-6)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copy(c.address, c.key)}
                    title={t("contracts.copy")}
                    className={`p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 transition text-gray-600 ${cl.icon}`}
                  >
                    {copied === c.key ? (
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>

                  <a
                    href={`${BASESCAN}${c.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("contracts.scan")}
                    className={`p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 transition text-gray-600 ${cl.icon}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-600 mt-6 tracking-wide">
          {t("contracts.footer")}
        </p>
      </div>
    </section>
  );
}
