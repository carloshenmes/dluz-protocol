"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { CONTRACTS } from "@/config/contracts";

// ─── Helpers ─────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  color = "text-white",
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value}{" "}
        {unit && (
          <span className="text-sm font-normal text-gray-400">{unit}</span>
        )}
      </p>
    </div>
  );
}

function fmt(value: bigint | undefined, decimals = 18, precision = 2): string {
  if (value === undefined) return "0";
  return parseFloat(formatUnits(value, decimals)).toFixed(precision);
}

// ─── Component ───────────────────────────────────────────────

export default function ProtocolDashboard() {
  const { address } = useAccount();

  // --- Protocol-level reads (no address dependency) ---
  const {
    data: protocolData,
    isLoading: protocolLoading,
    isError: protocolError,
  } = useReadContracts({
    contracts: [
      {
        ...CONTRACTS.CarbonRegistry,
        functionName: "totalRetired",
      },
      {
        ...CONTRACTS.CarbonRegistry,
        functionName: "totalRetirements",
      },
      {
        ...CONTRACTS.DLuzToken,
        functionName: "totalSupply",
      },
      {
        ...CONTRACTS.DEnergyToken,
        functionName: "totalSupply",
      },
    ],
  });

  // --- User-level reads (individual hooks, enabled only when connected) ---
  const { data: userRetiredData, isLoading: userRetiredLoading } = useReadContract({
    ...CONTRACTS.CarbonRegistry,
    functionName: "totalRetiredBy",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: userDluzData, isLoading: userDluzLoading } = useReadContract({
    ...CONTRACTS.DLuzToken,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: userDenergyData, isLoading: userDenergyLoading } = useReadContract({
    ...CONTRACTS.DEnergyToken,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // --- Parse protocol results ---
  const totalCarbonRetired = protocolData?.[0]?.result as bigint | undefined;
  const totalRetirements = protocolData?.[1]?.result as bigint | undefined;
  const totalDluzSupply = protocolData?.[2]?.result as bigint | undefined;
  const totalDenergySupply = protocolData?.[3]?.result as bigint | undefined;

  // --- Parse user results ---
  const userCarbonRetired = userRetiredData as bigint | undefined;
  const userDluzBalance = userDluzData as bigint | undefined;
  const userDenergyBalance = userDenergyData as bigint | undefined;
  const userLoading = userRetiredLoading || userDluzLoading || userDenergyLoading;

  // --- Loading state ---
  if (protocolLoading) {
    return (
      <div className="animate-pulse text-center py-8 text-gray-400">
        Loading on-chain stats...
      </div>
    );
  }

  if (protocolError) {
    return (
      <div className="text-center py-8 text-red-400">
        Failed to read contracts. Check your network connection.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Protocol Stats */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-200">📊 Protocol</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Carbon Retired"
            value={fmt(totalCarbonRetired)}
            unit="TCO₂"
            color="text-green-400"
          />
          <StatCard
            label="DLUZ Supply"
            value={fmt(totalDluzSupply)}
            unit="DLUZ"
            color="text-yellow-400"
          />
          <StatCard
            label="dEnergy Minted"
            value={fmt(totalDenergySupply)}
            unit="dEnergy"
            color="text-purple-400"
          />
          <StatCard
            label="Total Retirements"
            value={totalRetirements?.toString() ?? "0"}
            color="text-blue-400"
          />
        </div>
      </div>

      {/* User Stats */}
      {address && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-200">
            👤 Your Stats
          </h2>
          {userLoading ? (
            <div className="animate-pulse text-gray-400">Loading...</div>
          ) : userCarbonRetired !== undefined && userCarbonRetired > 0n ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                label="Your Carbon Retired"
                value={fmt(userCarbonRetired)}
                unit="TCO₂"
                color="text-green-400"
              />
              <StatCard
                label="DLUZ Balance"
                value={fmt(userDluzBalance)}
                unit="DLUZ"
                color="text-yellow-400"
              />
              <StatCard
                label="dEnergy Balance"
                value={fmt(userDenergyBalance)}
                unit="dEnergy"
                color="text-purple-400"
              />
            </div>
          ) : (
            <p className="text-gray-500">
              No retirements recorded yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
