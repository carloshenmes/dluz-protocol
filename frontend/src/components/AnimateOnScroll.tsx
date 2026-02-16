"use client";

import { motion, type Variant } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  scale?: boolean;
  blur?: boolean;
  className?: string;
}

const directionOffset = {
  up:    { y: 40, x: 0 },
  down:  { y: -40, x: 0 },
  left:  { y: 0, x: -40 },
  right: { y: 0, x: 40 },
  none:  { y: 0, x: 0 },
};

export function AnimateOnScroll({
  children,
  delay = 0,
  direction = "up",
  scale = false,
  blur = false,
  className,
}: Props) {
  const offset = directionOffset[direction];

  const hidden: Variant = {
    opacity: 0,
    ...offset,
    ...(scale && { scale: 0.97 }),
    ...(blur && { filter: "blur(6px)" }),
  };

  const visible: Variant = {
    opacity: 1,
    y: 0,
    x: 0,
    ...(scale && { scale: 1 }),
    ...(blur && { filter: "blur(0px)" }),
  };

  return (
    <motion.div
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.1, 0.25, 1],        // custom cubic-bezier
        ...(scale && {
          scale: { type: "spring", stiffness: 200, damping: 20, delay },
        }),
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
