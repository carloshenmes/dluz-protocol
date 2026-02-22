"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS } from "@/config/contracts";

// ─── Types ───────────────────────────────────────────────────

interface RetirementTuple {
  retiree: `0x${string}`;
  amount: bigint;
  reason: string;
  timestamp: bigint;
  blockNumber: bigint;
}

// ─── Helpers ─────────────────────────────────────────────────

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtAmount(value: bigint): string {
  return parseFloat(formatUnits(value, 18)).toFixed(2);
}

// ─── Component ───────────────────────────────────────────────

const MAX_DISPLAY = 20;

export default function RetirementHistory({ userOnly = true }: { userOnly?: boolean }) {
  const { address } = useAccount();

  // 1. Get total count
  const { data: totalRetirements } = useReadContract({
    ...CONTRACTS.CarbonRegistry,
    functionName: "totalRetirements",
  });

  const total = totalRetirements ? Number(totalRetirements as bigint) : 0;

  // 2. Calculate offset to fetch the most recent entries
  //    We fetch more if userOnly (need to filter client-side)
  const fetchLimit = userOnly ? Math.min(total, 100) : Math.min(total, MAX_DISPLAY);
  const offset = Math.max(0, total - fetchLimit);

  // 3. Fetch retirements batch
  const { data: retirementsData, isLoading } = useReadContract({
    ...CONTRACTS.CarbonRegistry,
    functionName: "getRetirements",
    args: [BigInt(offset), BigInt(fetchLimit)],
    query: { enabled: total > 0 },
  });

  // 4. Process and filter
  const retirements = useMemo(() => {
    if (!retirementsData) return [];

    const raw = retirementsData as RetirementTuple[];

    // Reverse to show newest first
    let list = [...raw].reverse();

    // Filter by user if needed
    if (userOnly && address) {
      list = list.filter(
        (r) => r.retiree.toLowerCase() === address.toLowerCase()
      );
    }

    return list.slice(0, MAX_DISPLAY);
  }, [retirementsData, userOnly, address]);

  // ─── Render ──────────────────────────────────────────────

  if (isLoading || (total > 0 && !retirementsData)) {
    return (
      <div className="animate-pulse text-center py-8 text-gray-400">
        Loading history...
      </div>
    );
  }

  if (retirements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No retirements found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400">
            <th className="text-left py-3 px-2">Date</th>
            <th className="text-left py-3 px-2">Wallet</th>
            <th className="text-right py-3 px-2">TCO₂</th>
            <th className="text-left py-3 px-2">Reason</th>
            <th className="text-right py-3 px-2">Block</th>
          </tr>
        </thead>
        <tbody>
          {retirements.map((r, i) => (
            <tr
              key={`${r.retiree}-${r.timestamp}-${i}`}
              className="border-b border-gray-800 hover:bg-gray-800/50 transition"
            >
              <td className="py-3 px-2 whitespace-nowrap">
                {formatDate(r.timestamp)}
              </td>
              <td className="py-3 px-2 font-mono text-xs">
                <a
                  href={`https://sepolia.basescan.org/address/${r.retiree}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {shortenAddress(r.retiree)}
                </a>
              </td>
              <td className="py-3 px-2 text-right font-semibold text-green-400">
                {fmtAmount(r.amount)}
              </td>
              <td className="py-3 px-2 max-w-[200px] truncate">
                {r.reason || "—"}
              </td>
              <td className="py-3 px-2 text-right">
                <a
                  href={`https://sepolia.basescan.org/block/${r.blockNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-mono text-xs"
                >
                  {r.blockNumber.toString()}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
