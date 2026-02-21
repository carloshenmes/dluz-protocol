// frontend/src/components/FarmPanel.tsx
"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimateOnScroll } from "./AnimateOnScroll";
import deployment from "@/config/deployment.json";
import farmingAbi from "@/config/abis/DLuzFarming.json";
import erc20Abi from "@/config/abis/DLuzToken.json";

const FARMING_ADDRESS = deployment.contracts.DLuzFarming as `0x${string}`;
const DLUZ_ADDRESS = deployment.contracts.DLuzToken as `0x${string}`;

const POOL_NAMES: Record<number, { stake: string; reward: string; color: string }> = {
  0: { stake: "DLUZ", reward: "dCARBON", color: "from-green-400 to-emerald-300" },
  1: { stake: "DLUZ", reward: "dENERGY", color: "from-yellow-400 to-orange-300" },
};

interface PoolData {
  id: number;
  rewardToken: string;
  rewardPerSecond: bigint;
  totalStaked: bigint;
  active: boolean;
  userStaked: bigint;
  userPending: bigint;
  userRewardDebt: bigint;
}

function PoolCard({ pool, onAction }: { pool: PoolData; onAction: () => void }) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"stake" | "unstake">("stake");
  const meta = POOL_NAMES[pool.id] || { stake: "DLUZ", reward: "???", color: "from-gray-400 to-gray-300" };

  // Allowance check
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: DLUZ_ADDRESS,
    abi: erc20Abi.abi,
    functionName: "allowance",
    args: [address!, FARMING_ADDRESS],
    query: { enabled: !!address },
  });

  // dLuz balance
  const { data: dluzBalance } = useReadContract({
    address: DLUZ_ADDRESS,
    abi: erc20Abi.abi,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address },
  });

  // Approve
  const { writeContract: approve, data: approveTx } = useWriteContract();
  const { isLoading: isApproving, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTx,
  });

  // Stake
  const { writeContract: stakeWrite, data: stakeTx } = useWriteContract();
  const { isLoading: isStaking, isSuccess: stakeConfirmed } = useWaitForTransactionReceipt({
    hash: stakeTx,
  });

  // Unstake
  const { writeContract: unstakeWrite, data: unstakeTx } = useWriteContract();
  const { isLoading: isUnstaking, isSuccess: unstakeConfirmed } = useWaitForTransactionReceipt({
    hash: unstakeTx,
  });

  // Claim
  const { writeContract: claimWrite, data: claimTx } = useWriteContract();
  const { isLoading: isClaiming, isSuccess: claimConfirmed } = useWaitForTransactionReceipt({
    hash: claimTx,
  });

  // Refresh after tx
  useEffect(() => {
    if (approveConfirmed) refetchAllowance();
    if (stakeConfirmed || unstakeConfirmed || claimConfirmed) {
      setAmount("");
      onAction();
    }
  }, [approveConfirmed, stakeConfirmed, unstakeConfirmed, claimConfirmed]);

  const parsedAmount = amount ? parseEther(amount) : 0n;
  const needsApproval = mode === "stake" && parsedAmount > 0n && (allowance as bigint || 0n) < parsedAmount;

  const handleApprove = () => {
    approve({
      address: DLUZ_ADDRESS,
      abi: erc20Abi.abi,
      functionName: "approve",
      args: [FARMING_ADDRESS, parsedAmount],
    });
  };

  const handleStake = () => {
    stakeWrite({
      address: FARMING_ADDRESS,
      abi: farmingAbi.abi,
      functionName: "stake",
      args: [BigInt(pool.id), parsedAmount],
    });
  };

  const handleUnstake = () => {
    unstakeWrite({
      address: FARMING_ADDRESS,
      abi: farmingAbi.abi,
      functionName: "unstake",
      args: [BigInt(pool.id), parsedAmount],
    });
  };

  const handleClaim = () => {
    claimWrite({
      address: FARMING_ADDRESS,
      abi: farmingAbi.abi,
      functionName: "claim",
      args: [BigInt(pool.id)],
    });
  };

  const handleMax = () => {
    if (mode === "stake" && dluzBalance) {
      setAmount(formatUnits(dluzBalance as bigint, 18));
    } else if (mode === "unstake" && pool.userStaked > 0n) {
      setAmount(formatUnits(pool.userStaked, 18));
    }
  };

  // APY calc — reward e stake ambos em 18 decimais
  const rewardPerYearNum = Number(formatUnits(pool.rewardPerSecond, 18)) * 365 * 86400;
  const totalStakedNum = Number(formatUnits(pool.totalStaked, 18));
  console.log("DEBUG APY:", {rewardPerYearNum, totalStakedNum, rawTotalStaked: pool.totalStaked.toString(), rawRewardPerSec: pool.rewardPerSecond.toString()});
  const apy = totalStakedNum > 0 ? (rewardPerYearNum / totalStakedNum) * 100 : 0;

  const isLoading = isApproving || isStaking || isUnstaking || isClaiming;

  return (
    <div className="bg-gray-900/60 backdrop-blur border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">
            Stake {meta.stake} → Earn{" "}
            <span className={`bg-gradient-to-r ${meta.color} bg-clip-text text-transparent`}>
              {meta.reward}
            </span>
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Pool #{pool.id} • {pool.active ? "🟢 Ativa" : "🔴 Inativa"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{apy.toFixed(1)}%</p>
          <p className="text-xs text-gray-400">APY</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Total Staked</p>
          <p className="text-sm font-semibold text-white">
            {Number(formatUnits(pool.totalStaked, 18)).toLocaleString("pt-BR", {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Seu Stake</p>
          <p className="text-sm font-semibold text-white">
            {Number(formatUnits(pool.userStaked, 18)).toLocaleString("pt-BR", {
              maximumFractionDigits: 4,
            })}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Rewards</p>
          <p className="text-sm font-semibold text-green-400">
            {Number(formatUnits(pool.userPending, 18)).toLocaleString("pt-BR", {
              maximumFractionDigits: 6,
            })}
          </p>
        </div>
      </div>

      {/* Claim button */}
      {pool.userPending > 0n && (
        <button
          onClick={handleClaim}
          disabled={isClaiming}
          className="w-full mb-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 transition-all"
        >
          {isClaiming
            ? "Coletando..."
            : `Coletar ${Number(formatUnits(pool.userPending, 18)).toFixed(4)} ${meta.reward}`}
        </button>
      )}

      {/* Mode toggle */}
      <div className="flex bg-gray-800/50 rounded-lg p-1 mb-4">
        <button
          onClick={() => setMode("stake")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "stake"
              ? "bg-green-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Stake
        </button>
        <button
          onClick={() => setMode("unstake")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "unstake"
              ? "bg-red-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Unstake
        </button>
      </div>

      {/* Input */}
      <div className="relative mb-4">
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-gray-800/80 border border-gray-600/50 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-green-500/50 [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={handleMax}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-gray-700 text-green-400 px-2 py-1 rounded hover:bg-gray-600 transition-all"
        >
          MAX
        </button>
      </div>

      {/* Balance info */}
      <p className="text-xs text-gray-500 mb-4">
        {mode === "stake"
          ? `Disponível: ${dluzBalance ? Number(formatUnits(dluzBalance as bigint, 18)).toLocaleString("pt-BR", { maximumFractionDigits: 4 }) : "0"} DLUZ`
          : `Staked: ${Number(formatUnits(pool.userStaked, 18)).toLocaleString("pt-BR", { maximumFractionDigits: 4 })} DLUZ`}
      </p>

      {/* Action button */}
      {!isConnected ? (
        <ConnectButton />
      ) : mode === "stake" ? (
        needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={isApproving || !parsedAmount}
            className="w-full py-3 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-500 disabled:opacity-50 transition-all"
          >
            {isApproving ? "Aprovando..." : "Aprovar DLUZ"}
          </button>
        ) : (
          <button
            onClick={handleStake}
            disabled={isStaking || !parsedAmount || !pool.active}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 transition-all"
          >
            {isStaking ? "Staking..." : "Stake DLUZ"}
          </button>
        )
      ) : (
        <button
          onClick={handleUnstake}
          disabled={isUnstaking || !parsedAmount || pool.userStaked === 0n}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold hover:from-red-500 hover:to-rose-500 disabled:opacity-50 transition-all"
        >
          {isUnstaking ? "Retirando..." : "Unstake DLUZ"}
        </button>
      )}

      {/* Rate info */}
      <p className="text-xs text-gray-600 text-center mt-3">
        Rate: {formatUnits(pool.rewardPerSecond, 18)} {meta.reward}/seg
      </p>
    </div>
  );
}

export function FarmPanel() {
  const { address } = useAccount();

  // Pool count
  const { data: poolCount } = useReadContract({
    address: FARMING_ADDRESS,
    abi: farmingAbi.abi,
    functionName: "poolCount",
  });

  const count = Number(poolCount || 0);

  // Batch read all pools
  const poolContracts = Array.from({ length: count }, (_, i) => [
    {
      address: FARMING_ADDRESS,
      abi: farmingAbi.abi,
      functionName: "getPoolInfo",
      args: [BigInt(i)],
    },
    {
      address: FARMING_ADDRESS,
      abi: farmingAbi.abi,
      functionName: "pools",
      args: [BigInt(i)],
    },
    {
      address: FARMING_ADDRESS,
      abi: farmingAbi.abi,
      functionName: "pendingReward",
      args: [BigInt(i), address || "0x0000000000000000000000000000000000000000"],
    },
    {
      address: FARMING_ADDRESS,
      abi: farmingAbi.abi,
      functionName: "userInfo",
      args: [BigInt(i), address || "0x0000000000000000000000000000000000000000"],
    },
  ]).flat();

  const { data: poolResults, refetch: refetchPools } = useReadContracts({
    contracts: poolContracts as any,
    query: { enabled: count > 0 },
  });

  // Auto-refresh pending rewards every 10s
  useEffect(() => {
    if (count === 0) return;
    const interval = setInterval(() => refetchPools(), 10000);
    return () => clearInterval(interval);
  }, [count, refetchPools]);

  // Parse pool data
  const pools: PoolData[] = [];
  if (poolResults && poolResults.length > 0) {
    for (let i = 0; i < count; i++) {
      const base = i * 4;
      const poolInfo = poolResults[base]?.result as [string, bigint, bigint, boolean] | undefined;
      const poolRaw = poolResults[base + 1]?.result as [string, bigint, bigint, bigint, bigint, boolean] | undefined;
      const pending = poolResults[base + 2]?.result as bigint | undefined;
      const user = poolResults[base + 3]?.result as [bigint, bigint, bigint] | undefined;

      if (poolInfo && poolRaw) {
        pools.push({
          id: i,
          rewardToken: poolInfo[0],
          rewardPerSecond: poolInfo[1],
          totalStaked: poolRaw[4],
          active: poolInfo[3],
          userStaked: user?.[0] || 0n,
          userPending: pending || 0n,
          userRewardDebt: user?.[1] || 0n,
        });
      }
    }
  }

  // Total staked across all pools
  const totalStakedAll = pools.reduce((sum, p) => sum + p.totalStaked, 0n);

  return (
    <section id="farm" className="py-20 px-6 border-t border-gray-800/50">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll direction="up">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🌱 dLuz{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Farm
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Faça stake de DLUZ e ganhe rewards em tokens ambientais. Quanto mais tempo, mais você colhe.
            </p>

            {/* Global stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div>
                <p className="text-2xl font-bold text-white">
                  {Number(formatUnits(totalStakedAll, 18)).toLocaleString("pt-BR", {
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-gray-400">Total DLUZ Staked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{pools.length}</p>
                <p className="text-xs text-gray-400">Pools Ativas</p>
              </div>
            </div>
          </div>

          {/* Pool cards */}
          {pools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando pools...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} onAction={refetchPools} />
              ))}
            </div>
          )}

          {/* Footer info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-600">
              Contrato: {FARMING_ADDRESS.slice(0, 6)}...{FARMING_ADDRESS.slice(-4)} • Base Sepolia
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
