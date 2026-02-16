"use client";

import { useReadContract, useAccount } from "wagmi";
import { formatUnits } from "viem";
import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TokenBalanceProps {
  name: string;
  symbol: string;
  address: `0x${string}`;
  abi: any;
  icon: ReactNode;
  color: string;
}

const colorMap: Record<string, { border: string; hoverBorder: string; text: string; glow: string; bg: string }> = {
  yellow: {
    border: "border-gray-800",
    hoverBorder: "group-hover:border-yellow-500/50",
    text: "text-yellow-400",
    glow: "group-hover:shadow-yellow-500/15",
    bg: "group-hover:bg-yellow-500/5",
  },
  green: {
    border: "border-gray-800",
    hoverBorder: "group-hover:border-green-500/50",
    text: "text-green-400",
    glow: "group-hover:shadow-green-500/15",
    bg: "group-hover:bg-green-500/5",
  },
  blue: {
    border: "border-gray-800",
    hoverBorder: "group-hover:border-blue-500/50",
    text: "text-blue-400",
    glow: "group-hover:shadow-blue-500/15",
    bg: "group-hover:bg-blue-500/5",
  },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }

    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, value);
      setDisplay(current);
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {display.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}
    </span>
  );
}

export function TokenBalance({ name, symbol, address, abi, icon, color }: TokenBalanceProps) {
  const { address: userAddress, isConnected } = useAccount();
  const colors = colorMap[color] || colorMap.green;

  const { data: balance, isLoading } = useReadContract({
    address,
    abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: isConnected && !!userAddress },
  });

  const formatted = balance ? formatUnits(balance as bigint, 18) : "0.0";
  const numericValue = parseFloat(formatted);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`group rounded-xl border ${colors.border} ${colors.hoverBorder} bg-gray-900/60 ${colors.bg} p-6 transition-all duration-300 cursor-default shadow-lg shadow-transparent ${colors.glow} group-hover:shadow-xl`}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        <div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{name}</p>
          <p className="text-xs text-gray-500">{symbol}</p>
        </div>
      </div>

      <div className="text-2xl font-bold">
        {!isConnected ? (
          <span className="text-gray-600">—</span>
        ) : isLoading ? (
          <motion.span
            className="text-gray-500 inline-block"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.span>
        ) : (
          <span className={colors.text}>
            <AnimatedNumber value={numericValue} />
          </span>
        )}
      </div>
    </motion.div>
  );
}
