"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS } from "@/config/contracts";
import { AnimateOnScroll } from "./AnimateOnScroll";

type TabType = "deposit" | "retire";

export function CarbonBridgePanel() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("deposit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [needsApproval, setNeedsApproval] = useState(true);

  // ─── Read: dCARBON total supply ───
  const { data: dcarbonSupply } = useReadContract({
    ...CONTRACTS.DCarbonToken,
    functionName: "totalSupply",
  });

  // ─── Read: BCT backing in bridge ───
  const { data: bctBacking } = useReadContract({
    ...CONTRACTS.CarbonBridge,
    functionName: "getBackingBalance",
    args: [CONTRACTS.MockBCT.address],
  });

  // ─── Read: user MockBCT balance ───
  const { data: userBCT } = useReadContract({
    ...CONTRACTS.MockBCT,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // ─── Read: user dCARBON balance ───
  const { data: userDCarbon } = useReadContract({
    ...CONTRACTS.DCarbonToken,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // ─── Read: MockBCT allowance ───
  const { data: allowance } = useReadContract({
    ...CONTRACTS.MockBCT,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.CarbonBridge.address] : undefined,
  });

  // ─── Read: dCARBON allowance for bridge ───
  const { data: dcarbonAllowance } = useReadContract({
    ...CONTRACTS.DCarbonToken,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.CarbonBridge.address] : undefined,
  });

  useEffect(() => {
    if (activeTab === "deposit" && allowance && amount) {
      try {
        const needed = parseEther(amount);
        setNeedsApproval((allowance as bigint) < needed);
      } catch {
        setNeedsApproval(true);
      }
    } else if (activeTab === "retire" && dcarbonAllowance && amount) {
      try {
        const needed = parseEther(amount);
        setNeedsApproval((dcarbonAllowance as bigint) < needed);
      } catch {
        setNeedsApproval(true);
      }
    }
  }, [allowance, dcarbonAllowance, amount, activeTab]);

  // ─── Write: approve ───
  const { writeContract: approve, data: approveTx, isPending: approving } = useWriteContract();
  const { isLoading: waitingApprove, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTx });

  // ─── Write: deposit ───
  const { writeContract: deposit, data: depositTx, isPending: depositing } = useWriteContract();
  const { isLoading: waitingDeposit, isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositTx });

  // ─── Write: retire ───
  const { writeContract: retire, data: retireTx, isPending: retiring } = useWriteContract();
  const { isLoading: waitingRetire, isSuccess: retireSuccess } = useWaitForTransactionReceipt({ hash: retireTx });

  useEffect(() => {
    if (approveSuccess) setNeedsApproval(false);
  }, [approveSuccess]);

  useEffect(() => {
    if (depositSuccess || retireSuccess) setAmount("");
  }, [depositSuccess, retireSuccess]);

  // ─── Handlers ───
  function handleApprove() {
    if (!amount) return;
    const contract = activeTab === "deposit" ? CONTRACTS.MockBCT : CONTRACTS.DCarbonToken;
    approve({
      ...contract,
      functionName: "approve",
      args: [CONTRACTS.CarbonBridge.address, parseEther(amount)],
    });
  }

  function handleDeposit() {
    if (!amount) return;
    deposit({
      ...CONTRACTS.CarbonBridge,
      functionName: "deposit",
      args: [CONTRACTS.MockBCT.address, parseEther(amount)],
    });
  }

  function handleRetire() {
    if (!amount || !reason.trim()) return;
    retire({
      ...CONTRACTS.CarbonBridge,
      functionName: "retire",
      args: [parseEther(amount), reason.trim()],
    });
  }

  // ─── Helpers ───
  const fmt = (val: unknown) => {
    if (!val) return "0.00";
    try { return Number(formatEther(val as bigint)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch { return "0.00"; }
  };

  const backingRatio = () => {
    if (!dcarbonSupply || !bctBacking) return "—";
    const supply = Number(formatEther(dcarbonSupply as bigint));
    const backing = Number(formatEther(bctBacking as bigint));
    if (supply === 0) return "∞";
    return ((backing / supply) * 100).toFixed(1) + "%";
  };

  const isLoading = approving || waitingApprove || depositing || waitingDeposit || retiring || waitingRetire;

  return (
    <section id="carbon-bridge" className="max-w-5xl mx-auto px-6 py-16">
      <AnimateOnScroll>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            🌉 Carbon<span className="text-green-400">Bridge</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Deposite créditos de carbono (BCT) e receba dCARBON 1:1. 
            Aposente dCARBON para compensar emissões de forma verificável e permanente.
          </p>
        </div>
      </AnimateOnScroll>

      {/* ─── Stats Cards ─── */}
      <AnimateOnScroll delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">BCT Backing</p>
            <p className="text-2xl font-bold text-green-400">{fmt(bctBacking)}</p>
            <p className="text-xs text-gray-600 mt-1">toneladas travadas</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">dCARBON Supply</p>
            <p className="text-2xl font-bold text-yellow-400">{fmt(dcarbonSupply)}</p>
            <p className="text-xs text-gray-600 mt-1">em circulação</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Backing Ratio</p>
            <p className="text-2xl font-bold text-emerald-300">{backingRatio()}</p>
            <p className="text-xs text-gray-600 mt-1">lastro verificável</p>
          </div>
        </div>
      </AnimateOnScroll>

      {/* ─── Main Panel ─── */}
      <AnimateOnScroll delay={0.2}>
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => { setActiveTab("deposit"); setAmount(""); setNeedsApproval(true); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === "deposit"
                  ? "text-green-400 border-b-2 border-green-400 bg-green-400/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              ⬇️ Deposit BCT → dCARBON
            </button>
            <button
              onClick={() => { setActiveTab("retire"); setAmount(""); setReason(""); setNeedsApproval(true); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === "retire"
                  ? "text-orange-400 border-b-2 border-orange-400 bg-orange-400/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              🔥 Retire dCARBON
            </button>
          </div>

          <div className="p-6">
            {!isConnected ? (
              <p className="text-center text-gray-500 py-8">Conecte sua wallet para usar o Bridge</p>
            ) : (
              <>
                {/* User balances */}
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>Seu saldo MockBCT: <strong className="text-green-300">{fmt(userBCT)}</strong></span>
                  <span>Seu saldo dCARBON: <strong className="text-yellow-300">{fmt(userDCarbon)}</strong></span>
                </div>

                {/* Amount input */}
                <div className="mb-4">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                    {activeTab === "deposit" ? "Quantidade de BCT" : "Quantidade de dCARBON"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-green-500 transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => {
                        const bal = activeTab === "deposit" ? userBCT : userDCarbon;
                        if (bal) setAmount(formatEther(bal as bigint));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400 hover:text-green-300 font-semibold"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Reason (retire only) */}
                {activeTab === "retire" && (
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                      Motivo da aposentadoria
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ex: Compensação de emissões 2026 - Empresa XYZ"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                )}

                {/* Preview */}
                {amount && Number(amount) > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
                    {activeTab === "deposit" ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Você deposita</span>
                        <span className="text-green-400 font-semibold">{amount} BCT</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Você aposenta</span>
                        <span className="text-orange-400 font-semibold">{amount} dCARBON</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center my-2 text-gray-600">↓</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {activeTab === "deposit" ? "Você recebe" : "Resultado"}
                      </span>
                      <span className={`font-semibold ${activeTab === "deposit" ? "text-yellow-400" : "text-red-400"}`}>
                        {activeTab === "deposit"
                          ? `${amount} dCARBON`
                          : `${amount} dCARBON queimados permanentemente 🔥`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  {needsApproval && (
                    <button
                      onClick={handleApprove}
                      disabled={!amount || Number(amount) <= 0 || isLoading}
                      className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      {approving || waitingApprove ? "Aprovando..." : "1. Approve"}
                    </button>
                  )}
                  <button
                    onClick={activeTab === "deposit" ? handleDeposit : handleRetire}
                    disabled={
                      !amount ||
                      Number(amount) <= 0 ||
                      needsApproval ||
                      isLoading ||
                      (activeTab === "retire" && !reason.trim())
                    }
                    className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      activeTab === "deposit"
                        ? "bg-green-600 hover:bg-green-500 text-white"
                        : "bg-orange-600 hover:bg-orange-500 text-white"
                    }`}
                  >
                    {depositing || waitingDeposit
                      ? "Depositando..."
                      : retiring || waitingRetire
                        ? "Aposentando..."
                        : activeTab === "deposit"
                          ? `${needsApproval ? "2. " : ""}Deposit`
                          : `${needsApproval ? "2. " : ""}Retire 🔥`}
                  </button>
                </div>

                {/* Success messages */}
                {depositSuccess && (
                  <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-center">
                    <p className="text-green-400 text-sm font-semibold">✅ Deposit realizado com sucesso!</p>
                    <a
                      href={`https://sepolia.basescan.org/tx/${depositTx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-400 underline"
                    >
                      Ver transação →
                    </a>
                  </div>
                )}
                {retireSuccess && (
                  <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700 rounded-lg text-center">
                    <p className="text-orange-400 text-sm font-semibold">🔥 dCARBON aposentado permanentemente!</p>
                    <a
                      href={`https://sepolia.basescan.org/tx/${retireTx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-600 hover:text-orange-400 underline"
                    >
                      Ver transação →
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - contract link */}
          <div className="border-t border-gray-800 px-6 py-3 flex justify-between items-center">
            <span className="text-xs text-gray-600">CarbonBridge v1.0</span>
            <a
              href={`https://sepolia.basescan.org/address/${CONTRACTS.CarbonBridge.address}#code`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-green-400 transition-colors"
            >
              📄 Contrato verificado →
            </a>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
