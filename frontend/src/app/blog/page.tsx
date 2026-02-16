"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  source: string;
  date: string;
  tag: string;
  tagColor: string;
  excerpt: string;
  url: string;
}

const tagColorMap: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-400",
  yellow: "bg-yellow-500/20 text-yellow-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  green: "bg-green-500/20 text-green-400",
  red: "bg-red-500/20 text-red-400",
  orange: "bg-orange-500/20 text-orange-400",
  purple: "bg-purple-500/20 text-purple-400",
};

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/data/blog-posts.json")
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        const sorted = data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setPosts(sorted);
      })
      .catch(() => {});
  }, []);

  const tags = ["all", ...Array.from(new Set(posts.map((p) => p.tag)))];
  const filtered = filter === "all" ? posts : posts.filter((p) => p.tag === filter);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Header />

      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              📰 Blog & Notícias
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Todas as{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                publicações
              </span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Conteúdo curado sobre mercado de carbono, energia renovável e Web3.
            </p>
          </div>

          {/* Filter tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`text-xs font-medium px-4 py-2 rounded-full border transition-colors ${
                  filter === tag
                    ? "border-green-500/50 bg-green-500/10 text-green-400"
                    : "border-gray-800 bg-gray-900/40 text-gray-500 hover:text-gray-300"
                }`}
              >
                {tag === "all" ? "Todos" : tag}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full bg-gray-900/40 border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      tagColorMap[post.tagColor] || tagColorMap.green
                    }`}
                  >
                    {post.tag}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {formatDate(post.date)}
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
                    <span className="text-gray-400 font-medium">
                      {post.source}
                    </span>
                  </span>
                </div>
              </a>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600">Nenhum post encontrado para esse filtro.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
