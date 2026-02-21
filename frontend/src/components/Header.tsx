"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo } from "./Logo";
import { useState } from "react";

const navLinks = [
  { label: "Protocolo", href: "/#como-funciona" },
  { label: "Tokens", href: "/#tokens" },
  { label: "Comprar", href: "/#comprar" },
  { label: "DEX", href: "/#dex" },
  { label: "Amazônia", href: "/#amazonia" },
  { label: "Energia", href: "/#energia" },
  { label: "Retire", href: "/retire" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo size={32} />
          <h1 className="text-lg font-bold text-green-400">dLuz Protocol</h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/retire"
                ? pathname === "/retire"
                : pathname === "/" && link.href.startsWith("/#");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "text-green-400 font-medium"
                    : "text-gray-400 hover:text-green-400"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <ConnectButton />
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-400 hover:text-white text-2xl"
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-md px-6 py-4 space-y-3">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/retire"
                ? pathname === "/retire"
                : pathname === "/" && link.href.startsWith("/#");

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block text-sm py-2 transition-colors ${
                  isActive
                    ? "text-green-400 font-medium"
                    : "text-gray-400 hover:text-green-400"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2">
            <ConnectButton />
          </div>
        </div>
      )}
    </header>
  );
}
