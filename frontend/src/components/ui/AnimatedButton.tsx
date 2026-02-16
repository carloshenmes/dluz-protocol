"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
}

export function AnimatedButton({
  children,
  className = "",
  onClick,
  variant = "primary",
}: AnimatedButtonProps) {
  const base =
    variant === "primary"
      ? "bg-green-500 hover:bg-green-400 text-gray-950 font-semibold"
      : "border border-green-500/50 hover:border-green-400 text-green-400 hover:text-green-300";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl transition-colors duration-300 ${base} ${className}`}
    >
      {children}
    </motion.button>
  );
}
