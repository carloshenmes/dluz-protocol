"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import {
  fetchUserRetirements,
  fetchRetirements,
  RetirementEntry,
} from "@/hooks/useSubgraph";

function shortenHash(hash: string): string {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatDate(timestamp: string): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RetirementHistory({ userOnly = true }: { userOnly?: boolean }) {
  const { address } = useAccount();
  const [retirements, setRetirements] = useState<RetirementEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = userOnly && address
          ? await fetchUserRetirements(address)
          : await fetchRetirements(20);
        setRetirements(data);
      } catch (e) {
        console.error("Failed to fetch retirements:", e);
      }
      setLoading(false);
    }
    load();
  }, [address, userOnly]);

  if (loading) {
    return (
      <div className="animate-pulse text-center py-8 text-gray-400">
        Carregando histórico...
      </div>
    );
  }

  if (retirements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum retirement encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="text-left py-3 px-2">Data</th>
            <th className="text-left py-3 px-2">Wallet</th>
            <th className="text-right py-3 px-2">TCO₂</th>
            <th className="text-left py-3 px-2">Motivo</th>
            <th className="text-right py-3 px-2">Tx</th>
          </tr>
        </thead>
        <tbody>
          {retirements.map((r) => (
            <tr key={r.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
              <td className="py-3 px-2 whitespace-nowrap">{formatDate(r.blockTimestamp)}</td>
              <td className="py-3 px-2 font-mono text-xs">{shortenHash(r.user)}</td>
              <td className="py-3 px-2 text-right font-semibold text-green-400">
                {parseFloat(formatUnits(BigInt(r.amount), 18)).toFixed(2)}
              </td>
              <td className="py-3 px-2 max-w-[200px] truncate">{r.reason}</td>
              <td className="py-3 px-2 text-right">
                <a
                  href={`https://sepolia.basescan.org/tx/${r.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-mono text-xs"
                >
                  {shortenHash(r.transactionHash)}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
