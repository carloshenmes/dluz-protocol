"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";

const TELEGRAM_URL = "https://t.me/dluzprotocol";

export function NewsletterSection() {
  return (
    <section className="py-24 px-6 border-t border-gray-800/50">
      <div className="max-w-2xl mx-auto">
        <AnimateOnScroll scale blur>
          <div className="relative bg-gray-900/60 border border-gray-800 rounded-2xl p-8 md:p-12 text-center glow-hover overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

            <div className="relative z-10">
              <span className="text-4xl mb-4 block">🐺</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Junte-se à{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  matilha
                </span>
              </h2>
              <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
                Atualizações do protocolo, novos tokens, parcerias e conteúdo sobre 
                mercado de carbono — direto no Telegram, sem ruído.
              </p>

              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#2AABEE] hover:bg-[#229ED9] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-[0_0_25px_rgba(42,171,238,0.3)] hover:scale-[1.02]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Entrar no Canal
              </a>

              <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-800/50">
                <div className="text-center">
                  <span className="text-lg font-bold text-green-400">📢</span>
                  <p className="text-[11px] text-gray-500 mt-1">Canal de updates</p>
                </div>
                <div className="w-px h-8 bg-gray-800"></div>
                <div className="text-center">
                  <span className="text-lg font-bold text-green-400">💬</span>
                  <p className="text-[11px] text-gray-500 mt-1">Grupo da comunidade</p>
                </div>
                <div className="w-px h-8 bg-gray-800"></div>
                <div className="text-center">
                  <span className="text-lg font-bold text-green-400">🤖</span>
                  <p className="text-[11px] text-gray-500 mt-1">Bot de alertas</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-600 mt-5">
                100% gratuito · sem spam · saia quando quiser
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
