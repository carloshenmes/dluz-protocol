"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";

const posts = [
  {
    title: "Brasil regulamenta mercado de carbono com o SBCE",
    source: "Carbon Credits",
    date: "20 Jan 2026",
    tag: "Regulação",
    tagColor: "bg-blue-500/20 text-blue-400",
    excerpt:
      "A Lei 15.042/2024 cria o Sistema Brasileiro de Comércio de Emissões, colocando o Brasil no mapa global do mercado regulado de carbono.",
    href: "#",
  },
  {
    title: "Tokenização de REC: como blockchain transforma energia renovável",
    source: "CoinDesk",
    date: "15 Jan 2026",
    tag: "Energia",
    tagColor: "bg-yellow-500/20 text-yellow-400",
    excerpt:
      "Certificados de energia renovável tokenizados permitem rastreabilidade e negociação peer-to-peer, eliminando intermediários.",
    href: "#",
  },
  {
    title: "Créditos de carbono da Amazônia ganham premium no mercado global",
    source: "Bloomberg Green",
    date: "08 Jan 2026",
    tag: "Amazônia",
    tagColor: "bg-emerald-500/20 text-emerald-400",
    excerpt:
      "Projetos REDD+ na Amazônia brasileira estão sendo negociados com ágio de até 40% sobre créditos convencionais.",
    href: "#",
  },
];

export function BlogSection() {
  return (
    <section id="blog" className="py-24 px-6 border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              📰 Blog & Notícias
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Fique por dentro do{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                mercado verde
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Conteúdo curado sobre mercado de carbono, energia renovável e Web3 — 
              sempre com crédito aos autores originais.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateOnScroll key={post.title} delay={i * 0.1} scale>
              <a
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full bg-gray-900/40 border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all glow-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${post.tagColor}`}>
                    {post.tag}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {post.date}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white mb-3 leading-snug group-hover:text-green-400 transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-400 leading-relaxed mb-5 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-800/50">
                  <span className="w-2 h-2 rounded-full bg-green-500/60"></span>
                  <span className="text-xs text-gray-500">
                    Fonte:{" "}
                    <span className="text-gray-400 font-medium">{post.source}</span>
                  </span>
                </div>
              </a>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={0.3}>
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-900/40 border border-gray-800 rounded-full px-5 py-2.5">
              <span className="text-orange-400 text-sm">📡</span>
              <span className="text-xs text-gray-400">
                Feed automatizado via RSS — conteúdo curado com crédito aos autores originais
              </span>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
