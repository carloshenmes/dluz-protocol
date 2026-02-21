"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import {
  fetchProtocolStats,
  fetchUserStats,
  ProtocolStats,
  UserStatsData,
} from "@/hooks/useSubgraph";

function StatCard({ label, value, unit, color = "text-white" }: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value} {unit && <span className="text-sm font-normal text-gray-400">{unit}</span>}
      </p>
    </div>
  );
}

function formatWei(value: string, decimals: number = 18, precision: number = 2): string {
  return parseFloat(formatUnits(BigInt(value), decimals)).toFixed(precision);
}

export default function ProtocolDashboard() {
  const { address } = useAccount();
  const [protocol, setProtocol] = useState<ProtocolStats | null>(null);
  const [user, setUser] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [p, u] = await Promise.all([
          fetchProtocolStats(),
          address ? fetchUserStats(address) : Promise.resolve(null),
        ]);
        setProtocol(p);
        setUser(u);
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      }
      setLoading(false);
    }
    load();
  }, [address]);

  if (loading) {
    return (
      <div className="animate-pulse text-center py-8 text-gray-400">
        Carregando stats...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Protocol Stats */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-200">📊 Protocolo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Carbon Retired"
            value={protocol ? formatWei(protocol.totalCarbonRetired) : "0"}
            unit="TCO₂"
            color="text-green-400"
          />
          <StatCard
            label="DLUZ Distribuído"
            value={protocol ? formatWei(protocol.totalDluzDistributed) : "0"}
            unit="DLUZ"
            color="text-yellow-400"
          />
          <StatCard
            label="dEnergy Mintado"
            value={protocol ? formatWei(protocol.totalDenergyMinted) : "0"}
            unit="dEnergy"
            color="text-purple-400"
          />
          <StatCard
            label="Total Retirements"
            value={protocol ? protocol.totalRetirements : "0"}
            color="text-blue-400"
          />
        </div>
      </div>

      {/* User Stats */}
      {address && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-200">👤 Suas Stats</h2>
          {user ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Seu Carbon Retired"
                value={formatWei(user.totalRetired)}
                unit="TCO₂"
                color="text-green-400"
              />
              <StatCard
                label="DLUZ Ganho"
                value={formatWei(user.totalDluzEarned)}
                unit="DLUZ"
                color="text-yellow-400"
              />
              <StatCard
                label="dEnergy Ganho"
                value={formatWei(user.totalDenergyEarned)}
                unit="dEnergy"
                color="text-purple-400"
              />
              <StatCard
                label="Seus Retirements"
                value={user.retirementCount}
                color="text-blue-400"
              />
            </div>
          ) : (
            <p className="text-gray-500">Nenhum retirement registrado ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}
