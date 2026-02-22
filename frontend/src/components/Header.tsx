"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo } from "./Logo";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/i18n";

export function Header() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { lang, setLang, t } = useTranslation();

  const mainLinks = [
    { label: t("nav.howItWorks"), href: "/#como-funciona" },
    { label: t("nav.tokens"), href: "/#tokens" },
    { label: t("nav.buy"), href: "/#comprar" },
    { label: "Dashboard", href: "/#dashboard" },
    { label: "Farm", href: "/#farm" },
    { label: "Retire", href: "/retire" },
  ];

  const moreLinks = [
    { label: t("nav.energy"), href: "/#energia" },
    { label: t("nav.blog"), href: "/#blog" },
    { label: t("nav.faq"), href: "/#faq" },
    { label: t("nav.team"), href: "/#team" },
    { label: "Bug Bounty", href: "/bug-bounty" },
  ];

  const allLinks = [...mainLinks, ...moreLinks];

  const toggleLang = () => setLang(lang === "pt" ? "en" : "pt");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = (href: string) => {
    const isActive =
      pathname === href ||
      (pathname === "/" && href.startsWith("/#"));
    return `text-sm transition-colors ${
      isActive
        ? "text-green-400 font-medium"
        : "text-gray-400 hover:text-green-400"
    }`;
  };

  const moreLabel = lang === "pt" ? "Mais" : "More";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo size={32} />
          <h1 className="text-lg font-bold text-green-400">dLuz Protocol</h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}

          {/* Dropdown More */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`text-sm transition-colors flex items-center gap-1 ${
                moreOpen ? "text-green-400" : "text-gray-400 hover:text-green-400"
              }`}
            >
              {moreLabel}
              <svg
                className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 rounded-lg border border-gray-700 bg-gray-900/95 backdrop-blur-md shadow-xl py-1 z-50">
                {moreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-400 hover:text-green-400 hover:bg-gray-800/60 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/60 hover:border-green-500/40 transition-colors text-sm"
            aria-label="Toggle language"
          >
            <span className="text-base">{lang === "pt" ? "🇧🇷" : "🇺🇸"}</span>
            <span className="text-gray-300 font-medium text-xs uppercase">{lang}</span>
          </button>

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
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm py-2 text-gray-400 hover:text-green-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={toggleLang}
            className="flex items-center gap-2 py-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
          >
            <span className="text-base">{lang === "pt" ? "🇧🇷" : "🇺🇸"}</span>
            <span>{lang === "pt" ? "English" : "Português"}</span>
          </button>

          <div className="pt-2">
            <ConnectButton />
          </div>
        </div>
      )}
    </header>
  );
}
