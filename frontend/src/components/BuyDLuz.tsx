// frontend/src/components/BuyDLuz.tsx
"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatUnits, formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo } from "./Logo";
import { AnimateOnScroll } from "./AnimateOnScroll";
import deployment from "@/config/deployment.json";
import saleAbi from "@/config/abis/DLuzSale.json";

const SALE_ADDRESS = deployment.contracts.DLuzSale as `0x${string}`;

export function BuyDLuz() {
  const [ethAmount, setEthAmount] = useState("");
  const { address, isConnected } = useAccount();

  // Lê dados do contrato
  const { data: rate } = useReadContract({
    address: SALE_ADDRESS,
    abi: saleAbi.abi,
    functionName: "rate",
  });

  const { data: saleActive } = useReadContract({
    address: SALE_ADDRESS,
    abi: saleAbi.abi,
    functionName: "saleActive",
  });

  const { data: availableDLuz, refetch: refetchAvailable } = useReadContract({
    address: SALE_ADDRESS,
    abi: saleAbi.abi,
    functionName: "availableDLuz",
  });

  const { data: totalSold } = useReadContract({
    address: SALE_ADDRESS,
    abi: saleAbi.abi,
    functionName: "totalSold",
  });

  const { data: totalRaised } = useReadContract({
    address: SALE_ADDRESS,
    abi: saleAbi.abi,
    functionName: "totalRaised",
  });

  // Estimativa de dLuz que o usuário vai receber
  const { data: estimate } = useReadContract({
    address: SALE_ADDRESS,
    abi: saleAbi.abi,
    functionName: "getEstimate",
    args: ethAmount ? [parseEther(ethAmount)] : undefined,
    query: { enabled: !!ethAmount && parseFloat(ethAmount) > 0 },
  });

  // Escrita: comprar
  const { data: txHash, writeContract, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetchAvailable();
      setEthAmount("");
    }
  }, [isSuccess, refetchAvailable]);

  const handleBuy = () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) return;
    writeContract({
      address: SALE_ADDRESS,
      abi: saleAbi.abi,
      functionName: "buy",
      value: parseEther(ethAmount),
    });
  };

  const formattedRate = rate ? Number(formatEther(rate as bigint)).toLocaleString("pt-BR") : "—";
  const formattedAvailable = availableDLuz
    ? Number(formatUnits(availableDLuz as bigint, 18)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
    : "—";
  const formattedSold = totalSold
    ? Number(formatUnits(totalSold as bigint, 18)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
    : "0";
  const formattedRaised = totalRaised
    ? Number(formatEther(totalRaised as bigint)).toLocaleString("pt-BR", { maximumFractionDigits: 4 })
    : "0";
  const formattedEstimate = estimate
    ? Number(formatUnits(estimate as bigint, 18)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
    : "0";

  return (
    <section id="comprar" className="py-20 px-6 border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <AnimateOnScroll direction="left">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Compre{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                dLuz
              </span>{" "}
              na Pré-Venda
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Adquira tokens dLuz diretamente com ETH. Preço fixo durante a fase de pré-venda
              — sem slippage, sem intermediários.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
                <p className="text-xs text-gray-500 mb-1">Preço</p>
                <p className="text-lg font-bold text-green-400">
                  1 ETH = {formattedRate} dLuz
                </p>
              </div>
              <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
                <p className="text-xs text-gray-500 mb-1">Disponível</p>
                <p className="text-lg font-bold text-white">{formattedAvailable} dLuz</p>
              </div>
              <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
                <p className="text-xs text-gray-500 mb-1">Total Vendido</p>
                <p className="text-lg font-bold text-white">{formattedSold} dLuz</p>
              </div>
              <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
                <p className="text-xs text-gray-500 mb-1">ETH Arrecadado</p>
                <p className="text-lg font-bold text-white">{formattedRaised} ETH</p>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-gray-300">
              {[
                "Preço fixo — sem variação durante a pré-venda",
                "Tokens enviados instantaneamente para sua wallet",
                "Contrato verificado na Base Sepolia",
                "Sem lock-up — tokens livres após a compra",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll direction="right">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 max-w-sm mx-auto w-full hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Comprar dLuz</h3>
              {saleActive ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                  ● Ativa
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-medium">
                  ● Pausada
                </span>
              )}
            </div>

            {/* Input ETH */}
            <div className="rounded-xl bg-gray-800/60 p-4 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Você paga</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.0"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-white outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700 text-sm font-medium text-white shrink-0">
                  <span className="text-lg">⟠</span> ETH
                </div>
              </div>
            </div>

            {/* Seta */}
            <div className="flex justify-center -my-1 z-10 relative">
              <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-green-400 text-lg">
                ↓
              </div>
            </div>

            {/* Output dLuz */}
            <div className="rounded-xl bg-gray-800/60 p-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Você recebe</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">
                  {formattedEstimate}
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700 text-sm font-medium text-white shrink-0">
                  <Logo size={22} /> dLuz
                </div>
              </div>
            </div>

            {/* Botão */}
            {!isConnected ? (
              <div className="mt-6">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-black font-bold text-lg hover:opacity-90 transition-opacity"
                    >
                      Conectar Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            ) : (
              <button
                onClick={handleBuy}
                disabled={isPending || isConfirming || !saleActive || !ethAmount || parseFloat(ethAmount) <= 0}
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending
                  ? "Confirme na wallet..."
                  : isConfirming
                  ? "Processando..."
                  : !saleActive
                  ? "Venda Pausada"
                  : "Comprar dLuz"}
              </button>
            )}

            {/* Feedback */}
            {isSuccess && (
              <p className="text-center text-sm text-green-400 mt-3">
                ✅ Compra realizada com sucesso!
              </p>
            )}
            {writeError && (
              <p className="text-center text-xs text-red-400 mt-3 break-all">
                {writeError.message.includes("User rejected")
                  ? "Transação cancelada pelo usuário."
                  : "Erro na transação. Verifique seu saldo."}
              </p>
            )}

            <p className="text-center text-xs text-gray-600 mt-3">
              Taxa: 0% • Rede: Base Sepolia
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}