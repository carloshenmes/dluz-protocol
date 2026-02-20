"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CONTRACTS } from "@/config/contracts";

type Step = "approve" | "retire" | "done";

export default function RetirePage() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<Step>("approve");

  const { data: balance } = useReadContract({
    ...CONTRACTS.DCarbonToken,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...CONTRACTS.DCarbonToken,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.CarbonRegistry.address] : undefined,
    query: { enabled: !!address },
  });

  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApproving,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isApproveTxLoading, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveTxHash });

  const {
    writeContract: writeRetire,
    data: retireTxHash,
    isPending: isRetiring,
    reset: resetRetire,
  } = useWriteContract();

  const { isLoading: isRetireTxLoading, isSuccess: isRetireConfirmed } =
    useWaitForTransactionReceipt({ hash: retireTxHash });

  const parsedAmount = amount ? parseUnits(amount, 18) : BigInt(0);
  const hasEnoughBalance = balance !== undefined && parsedAmount > BigInt(0) && parsedAmount <= (balance as bigint);
  const isAlreadyApproved = allowance !== undefined && parsedAmount > BigInt(0) && (allowance as bigint) >= parsedAmount;

  useEffect(() => {
    if (isApproveConfirmed) {
      refetchAllowance();
      setStep("retire");
    }
  }, [isApproveConfirmed, refetchAllowance]);

  useEffect(() => {
    if (isRetireConfirmed) {
      setStep("done");
    }
  }, [isRetireConfirmed]);

  useEffect(() => {
    if (isAlreadyApproved && step === "approve") {
      setStep("retire");
    }
  }, [isAlreadyApproved, step]);

  function handleApprove() {
    writeApprove({
      ...CONTRACTS.DCarbonToken,
      functionName: "approve",
      args: [CONTRACTS.CarbonRegistry.address, parsedAmount],
    });
  }

  function handleRetire() {
    writeRetire({
      ...CONTRACTS.CarbonRegistry,
      functionName: "retire",
      args: [parsedAmount, reason || "Voluntary carbon retirement"],
    });
  }

  function handleReset() {
    setAmount("");
    setReason("");
    setStep("approve");
    resetApprove();
    resetRetire();
  }

  const formattedBalance = balance !== undefined ? formatUnits(balance as bigint, 18) : "0";
  const isProcessing = isApproving || isApproveTxLoading || isRetiring || isRetireTxLoading;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-green-400">Aposentar Carbono</h1>
            <p className="text-sm text-gray-400 mt-1">
              Queime dCARBON e receba dLUZ como recompensa
            </p>
          </div>

          {!isConnected ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center space-y-4">
              <p className="text-gray-400">Conecte sua wallet para continuar</p>
              <ConnectButton />
            </div>
          ) : step === "done" ? (
            <div className="rounded-xl border border-green-800/50 bg-green-950/30 p-8 text-center space-y-4">
              <div className="text-4xl">🌱</div>
              <h2 className="text-lg font-semibold text-green-400">Carbono aposentado!</h2>
              <p className="text-sm text-gray-400">
                {amount} dCARBON queimados. Recompensa dLUZ creditada.
              </p>
              {retireTxHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${retireTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-400 underline hover:text-green-300"
                >
                  Ver transacao ↗
                </a>
              )}
              <button
                onClick={handleReset}
                className="mt-4 w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Aposentar mais
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Saldo dCARBON</span>
                <span className="text-white font-mono">
                  {Number(formattedBalance).toLocaleString("pt-BR", { maximumFractionDigits: 4 })}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Quantidade</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setStep("approve");
                      resetApprove();
                      resetRetire();
                    }}
                    disabled={isProcessing}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={() => setAmount(formattedBalance)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400 hover:text-green-300"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Motivo (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Compensacao voluntaria 2026"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isProcessing}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={step === "approve" ? "text-green-400 font-medium" : "text-gray-500"}>
                  1. Approve
                </span>
                <span>→</span>
                <span className={step === "retire" ? "text-green-400 font-medium" : "text-gray-500"}>
                  2. Retire
                </span>
              </div>

              {step === "approve" ? (
                <button
                  onClick={handleApprove}
                  disabled={!hasEnoughBalance || isProcessing || parsedAmount === BigInt(0)}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isApproving || isApproveTxLoading
                    ? "Aprovando..."
                    : !amount || parsedAmount === BigInt(0)
                      ? "Insira um valor"
                      : !hasEnoughBalance
                        ? "Saldo insuficiente"
                        : "Aprovar dCARBON"}
                </button>
              ) : (
                <button
                  onClick={handleRetire}
                  disabled={isProcessing}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isRetiring || isRetireTxLoading ? "Aposentando..." : "Aposentar Carbono"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
