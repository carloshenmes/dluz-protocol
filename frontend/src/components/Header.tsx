"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo } from "./Logo";
import { useState } from "react";

const navLinks = [
  { label: "Protocolo", href: "#como-funciona" },
  { label: "Tokens", href: "#tokens" },
  { label: "DEX", href: "#dex" },
  { label: "Amazônia", href: "#amazonia" },
  { label: "Energia", href: "#energia" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <h1 className="text-lg font-bold text-green-400">dLuz Protocol</h1>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-green-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <ConnectButton />
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-400 hover:text-white text-2xl"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-md px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-gray-400 hover:text-green-400 transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <ConnectButton />
          </div>
        </div>
      )}
    </header>
  );
}
