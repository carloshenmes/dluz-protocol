"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS } from "@/config/contracts";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { useTranslation } from "@/i18n";

type TabType = "deposit" | "retire";

function BackingNote() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div id="bridge" className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors"
      >
        <span className="text-sm font-medium text-green-400">{t("bridge.note.toggle")}</span>
        <span className={`text-green-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="mt-3 px-5 py-5 rounded-xl border border-gray-700 bg-gray-900/60 space-y-4 text-sm text-gray-400 leading-relaxed animate-fadeIn">
          <p>{t("bridge.note.p1")}</p>
          <p>{t("bridge.note.p2")}</p>
          <p>{t("bridge.note.p3")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2 bg-green-500/5 border border-green-500/15 rounded-lg p-3">
              <span className="text-green-400 mt-0.5">📥</span>
              <span className="text-xs text-gray-300">{t("bridge.note.deposit")}</span>
            </div>
            <div className="flex items-start gap-2 bg-orange-500/5 border border-orange-500/15 rounded-lg p-3">
              <span className="text-orange-400 mt-0.5">🔥</span>
              <span className="text-xs text-gray-300">{t("bridge.note.retire")}</span>
            </div>
          </div>

          <p className="text-xs text-gray-600 pt-2 border-t border-gray-800">
            {t("bridge.note.source")}
          </p>
        </div>
      )}
    </div>
  );
}

export function CarbonBridgePanel() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("deposit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [needsApproval, setNeedsApproval] = useState(true);
  const { t } = useTranslation();

  const { data: dcarbonSupply } = useReadContract({
    ...CONTRACTS.DCarbonToken,
    functionName: "totalSupply",
  });

  const { data: bctBacking } = useReadContract({
    ...CONTRACTS.CarbonBridge,
    functionName: "getBackingBalance",
    args: [CONTRACTS.MockBCT.address],
  });

  const { data: userBCT } = useReadContract({
    ...CONTRACTS.MockBCT,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: userDCarbon } = useReadContract({
    ...CONTRACTS.DCarbonToken,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    ...CONTRACTS.MockBCT,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.CarbonBridge.address] : undefined,
  });

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

  const { writeContract: approve, data: approveTx, isPending: approving } = useWriteContract();
  const { isLoading: waitingApprove, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveTx });

  const { writeContract: deposit, data: depositTx, isPending: depositing } = useWriteContract();
  const { isLoading: waitingDeposit, isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositTx });

  const { writeContract: retire, data: retireTx, isPending: retiring } = useWriteContract();
  const { isLoading: waitingRetire, isSuccess: retireSuccess } = useWaitForTransactionReceipt({ hash: retireTx });

  useEffect(() => {
    if (approveSuccess) setNeedsApproval(false);
  }, [approveSuccess]);

  useEffect(() => {
    if (depositSuccess || retireSuccess) setAmount("");
  }, [depositSuccess, retireSuccess]);

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
            🌉 {t("bridge.title")}<span className="text-green-400">{t("bridge.title.green")}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t("bridge.desc")}
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("bridge.bct.label")}</p>
            <p className="text-2xl font-bold text-green-400">{fmt(bctBacking)}</p>
            <p className="text-xs text-gray-600 mt-1">{t("bridge.bct.sub")}</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("bridge.supply.label")}</p>
            <p className="text-2xl font-bold text-yellow-400">{fmt(dcarbonSupply)}</p>
            <p className="text-xs text-gray-600 mt-1">{t("bridge.supply.sub")}</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("bridge.ratio.label")}</p>
            <p className="text-2xl font-bold text-emerald-300">{backingRatio()}</p>
            <p className="text-xs text-gray-600 mt-1">{t("bridge.ratio.sub")}</p>
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll delay={0.2}>
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => { setActiveTab("deposit"); setAmount(""); setNeedsApproval(true); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === "deposit"
                  ? "text-green-400 border-b-2 border-green-400 bg-green-400/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t("bridge.tab.deposit")}
            </button>
            <button
              onClick={() => { setActiveTab("retire"); setAmount(""); setReason(""); setNeedsApproval(true); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === "retire"
                  ? "text-orange-400 border-b-2 border-orange-400 bg-orange-400/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t("bridge.tab.retire")}
            </button>
          </div>

          <div className="p-6">
            {!isConnected ? (
              <p className="text-center text-gray-500 py-8">{t("bridge.connect")}</p>
            ) : (
              <>
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                  <span>{t("bridge.balance.bct")} <strong className="text-green-300">{fmt(userBCT)}</strong></span>
                  <span>{t("bridge.balance.dcarbon")} <strong className="text-yellow-300">{fmt(userDCarbon)}</strong></span>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                    {activeTab === "deposit" ? t("bridge.input.deposit") : t("bridge.input.retire")}
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

                {activeTab === "retire" && (
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                      {t("bridge.reason")}
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t("bridge.reason.placeholder")}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                )}

                {amount && Number(amount) > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
                    {activeTab === "deposit" ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{t("bridge.preview.deposit")}</span>
                        <span className="text-green-400 font-semibold">{amount} BCT</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{t("bridge.preview.retire")}</span>
                        <span className="text-orange-400 font-semibold">{amount} dCARBON</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center my-2 text-gray-600">↓</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {activeTab === "deposit" ? t("bridge.preview.receive") : t("bridge.preview.result")}
                      </span>
                      <span className={`font-semibold ${activeTab === "deposit" ? "text-yellow-400" : "text-red-400"}`}>
                        {activeTab === "deposit"
                          ? `${amount} dCARBON`
                          : `${amount} ${t("bridge.preview.burned")}`}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {needsApproval && (
                    <button
                      onClick={handleApprove}
                      disabled={!amount || Number(amount) <= 0 || isLoading}
                      className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      {approving || waitingApprove ? t("bridge.btn.approving") : t("bridge.btn.approve")}
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
                      ? t("bridge.btn.depositing")
                      : retiring || waitingRetire
                        ? t("bridge.btn.retiring")
                        : activeTab === "deposit"
                          ? `${needsApproval ? "2. " : ""}${t("bridge.btn.deposit")}`
                          : `${needsApproval ? "2. " : ""}${t("bridge.btn.retire")}`}
                  </button>
                </div>

                {depositSuccess && (
                  <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-center">
                    <p className="text-green-400 text-sm font-semibold">{t("bridge.success.deposit")}</p>
                    <a
                      href={`https://sepolia.basescan.org/tx/${depositTx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-400 underline"
                    >
                      {t("bridge.tx.link")}
                    </a>
                  </div>
                )}
                {retireSuccess && (
                  <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700 rounded-lg text-center">
                    <p className="text-orange-400 text-sm font-semibold">{t("bridge.success.retire")}</p>
                    <a
                      href={`https://sepolia.basescan.org/tx/${retireTx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-600 hover:text-orange-400 underline"
                    >
                      {t("bridge.tx.link")}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-gray-800 px-6 py-3 flex justify-between items-center">
            <span className="text-xs text-gray-600">{t("bridge.footer.version")}</span>
            <a
              href={`https://sepolia.basescan.org/address/${CONTRACTS.CarbonBridge.address}#code`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-green-400 transition-colors"
            >
              {t("bridge.footer.contract")}
            </a>
          </div>
        </div>

        {/* ─── Nota explicativa do lastro 1:1 ─── */}
        <BackingNote />
      </AnimateOnScroll>
    </section>
  );
}
