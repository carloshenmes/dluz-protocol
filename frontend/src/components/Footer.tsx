"use client";

import { Logo } from "./Logo";

const protocolLinks = [
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Tokens", href: "#tokens" },
  { label: "DEX", href: "#dex" },
  { label: "Amazônia", href: "#amazonia" },
  { label: "Energia", href: "#energia" },
  { label: "Dashboard", href: "#dashboard" },
];

const devLinks = [
  { label: "GitHub", href: "https://github.com/MindDevelopment" },
  { label: "BaseScan Contracts", href: "https://basescan.org" },
  { label: "Docs / Whitepaper", href: "#" },
  { label: "Bug Bounty", href: "#" },
];

const communityLinks = [
  { label: "Twitter / X", href: "https://x.com/dlaboratory_" },
  { label: "Telegram", href: "https://t.me/dluzprotocol" },
  { label: "Blog", href: "#blog" },
  { label: "FAQ", href: "#faq" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo size={28} />
              <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                dLuz Protocol
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Protocolo descentralizado para tokenização e negociação de créditos
              de carbono e certificados de energia renovável na Base.
            </p>
          </div>

          {/* Protocolo */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Protocolo</h4>
            <ul className="space-y-2.5">
              {protocolLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Desenvolvedores */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Desenvolvedores</h4>
            <ul className="space-y-2.5">
              {devLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-gray-500 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Comunidade */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Comunidade</h4>
            <ul className="space-y-2.5">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-gray-500 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © 2026 dLuz Protocol · Built on{" "}
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Base
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/MindDevelopment"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a
              href="https://x.com/dlaboratory_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a
              href="https://t.me/dluzprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
