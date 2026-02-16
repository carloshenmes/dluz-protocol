"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
}

export function HoverCard({ children, className = "" }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
