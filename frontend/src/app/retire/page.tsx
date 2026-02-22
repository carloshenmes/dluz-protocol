"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CONTRACTS } from "@/config/contracts";
import ProtocolDashboard from "@/components/ProtocolDashboard";
import RetirementHistory from "@/components/RetirementHistory";
import { useTranslation } from "@/i18n";

type Step = "approve" | "retire" | "done";
type Tab = "my" | "all";

export default function RetirePage() {
  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<Step>("approve");
  const [historyTab, setHistoryTab] = useState<Tab>("my");
  const [refreshKey, setRefreshKey] = useState(0);

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
      setTimeout(() => setRefreshKey((k) => k + 1), 3000);
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

      <div className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full space-y-10">

        {/* Stats Dashboard */}
        <section key={`stats-${refreshKey}`}>
          <ProtocolDashboard />
        </section>

        {/* Retire Form */}
        <section className="max-w-md mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-green-400">{t("retire.title")}</h1>
            <p className="text-sm text-gray-400 mt-1">{t("retire.desc")}</p>
          </div>

          {!isConnected ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center space-y-4">
              <p className="text-gray-400">{t("retire.connect")}</p>
              <ConnectButton />
            </div>
          ) : step === "done" ? (
            <div className="rounded-xl border border-green-800/50 bg-green-950/30 p-8 text-center space-y-4">
              <div className="text-4xl">🌱</div>
              <h2 className="text-lg font-semibold text-green-400">{t("retire.success.title")}</h2>
              <p className="text-sm text-gray-400">
                {t("retire.success.desc.1")}{amount}{t("retire.success.desc.2")}
              </p>
              {retireTxHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${retireTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-400 underline hover:text-green-300"
                >
                  {t("retire.success.tx")}
                </a>
              )}
              <button
                onClick={handleReset}
                className="mt-4 w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {t("retire.btn.more")}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{t("retire.balance")}</span>
                <span className="text-white font-mono">
                  {Number(formattedBalance).toLocaleString("en-US", { maximumFractionDigits: 4 })}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">{t("retire.amount")}</label>
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
                <label className="text-sm text-gray-400">{t("retire.reason")}</label>
                <input
                  type="text"
                  placeholder={t("retire.reason.placeholder")}
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
                    ? t("retire.btn.approving")
                    : !amount || parsedAmount === BigInt(0)
                      ? t("retire.btn.noAmount")
                      : !hasEnoughBalance
                        ? t("retire.btn.noBalance")
                        : t("retire.btn.approve")}
                </button>
              ) : (
                <button
                  onClick={handleRetire}
                  disabled={isProcessing}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isRetiring || isRetireTxLoading ? t("retire.btn.retiring") : t("retire.btn.retire")}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Retirement History */}
        <section key={`history-${refreshKey}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-200">📜 {t("retire.history")}</h2>
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setHistoryTab("my")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  historyTab === "my"
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t("retire.history.mine")}
              </button>
              <button
                onClick={() => setHistoryTab("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  historyTab === "all"
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t("retire.history.all")}
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <RetirementHistory userOnly={historyTab === "my"} />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
