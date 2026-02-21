"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { pt } from "./pt";
import { en } from "./en";

export type Lang = "pt" | "en";
type Dict = Record<string, string>;

const dicts: Record<Lang, Dict> = { pt, en };

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "pt",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const saved = localStorage.getItem("dluz-lang") as Lang | null;
    if (saved && (saved === "pt" || saved === "en")) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("dluz-lang", l);
    document.documentElement.lang = l === "pt" ? "pt-BR" : "en";
  }, []);

  const t = useCallback(
    (key: string): string => {
      return dicts[lang][key] || dicts["pt"][key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
