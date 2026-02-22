"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";

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

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const { t, lang } = useTranslation();

  function formatDate(iso: string) {
    return new Date(iso + "T12:00:00").toLocaleDateString(
      lang === "pt" ? "pt-BR" : "en-US",
      { day: "2-digit", month: "short", year: "numeric" }
    );
  }

  useEffect(() => {
    fetch("/data/blog-posts.json")
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        const sorted = data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setPosts(sorted.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="blog" className="py-24 px-6 border-t border-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              📰 {t("blog.tag")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("blog.title.1")}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                {t("blog.title.highlight")}
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t("blog.desc")}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimateOnScroll key={post.id} delay={i * 0.1} scale>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full bg-gray-900/40 border border-gray-800 rounded-2xl p-6 hover:border-green-500/30 transition-all glow-hover"
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
                    {t("blog.source")}{" "}
                    <span className="text-gray-400 font-medium">
                      {post.source}
                    </span>
                  </span>
                </div>
              </a>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={0.3}>
          <div className="mt-10 text-center">
            <a
              href="/blog"
              className="inline-flex items-center gap-2 bg-gray-900/40 border border-gray-800 rounded-full px-5 py-2.5 hover:border-green-500/30 transition-colors"
            >
              <span className="text-orange-400 text-sm">📡</span>
              <span className="text-xs text-gray-400">
                {t("blog.feed")}
              </span>
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
