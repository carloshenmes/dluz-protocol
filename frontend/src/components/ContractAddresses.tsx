"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n";

const CONTRACTS = [
  { key: "DLuzToken",      label: "dLuz",          symbol: "DLUZ",     address: "0xF4FEECc50A0D3b81931AC8A1638fa419C0217Dd3" },
  { key: "DCarbonToken",   label: "dCarbon",        symbol: "dCARBON",  address: "0x1fA05a3c388066069A500157B9B43b287deA973f" },
  { key: "DEnergyToken",   label: "dEnergy",        symbol: "dENERGY",  address: "0x6519F9b10C598652945c7b4cAc113251cf108b92" },
  { key: "DLuzDEX",        label: "DEX",            symbol: "DEX",      address: "0x576a60085100D2d2Ec612B28E6cCAF63E7CCa277" },
  { key: "DLuzFarming",    label: "Farming",        symbol: "FARM",     address: "0xd9021f25aA780753484484A9c874b4a222F3e7Cb" },
  { key: "CarbonBridge",   label: "Carbon Bridge",  symbol: "BRIDGE",   address: "0xA31Ecd8968AE3fa35969918c5e0F89D1d76c4c78" },
  { key: "CarbonRegistry", label: "Carbon Registry",symbol: "REGISTRY", address: "0x9dbCfA6FF1357C4Af642464bBe2FeBf17aCcD1bc" },
  { key: "DLuzSale",       label: "Token Sale",     symbol: "SALE",     address: "0xBC3D26485f76d3a4BE14a4dfE7840c4afa62184a" },
];

const BASESCAN = "https://sepolia.basescan.org/address/";

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
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          {t("contracts.title")}
        </h2>
        <p className="text-center text-gray-400 mb-10 text-sm">
          {t("contracts.subtitle")}
        </p>

        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0f1a0f]">
          {/* Header */}
          <div className="grid grid-cols-12 px-4 py-3 bg-white/5 text-xs text-gray-500 uppercase tracking-wider">
            <span className="col-span-3">{t("contracts.col.contract")}</span>
            <span className="col-span-7">{t("contracts.col.address")}</span>
            <span className="col-span-2 text-right">{t("contracts.col.actions")}</span>
          </div>

          {/* Rows */}
          {CONTRACTS.map((c, i) => (
            <div
              key={c.key}
              className={`grid grid-cols-12 items-center px-4 py-3 text-sm border-t border-white/5 ${
                i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
              }`}
            >
              {/* Label */}
              <div className="col-span-3">
                <span className="text-white font-medium">{c.label}</span>
                <span className="ml-2 text-xs text-gray-500">{c.symbol}</span>
              </div>

              {/* Address */}
              <div className="col-span-7 font-mono text-xs text-gray-300 truncate pr-2">
                {c.address}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end gap-2">
                {/* Copy */}
                <button
                  onClick={() => copy(c.address, c.key)}
                  title={t("contracts.copy")}
                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white"
                >
                  {copied === c.key ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>

                {/* BaseScan */}
                <a
                  href={`${BASESCAN}${c.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="BaseScan"
                  className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-blue-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Network badge */}
        <div className="mt-4 flex justify-center">
          <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            🔗 Base Sepolia — Chain ID 84532
          </span>
        </div>
      </div>
    </section>
  );
}
