import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "public", "data", "blog-posts.json");
const API_KEY = process.env.BLOG_API_KEY || "dluz-blog-secret-2026";

function getPosts(): any[] {
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function savePosts(posts: any[]) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(posts, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
  // Autenticação simples
  const key = req.headers.get("x-api-key");
  if (key !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, tag, tagColor, date, excerpt, source, url } = body;

    if (!title || !tag || !excerpt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const posts = getPosts();
    const newId = String(posts.length + 1);

    const newPost = {
      id: newId,
      title,
      tag: tag.toUpperCase(),
      tagColor: tagColor || "green",
      date: date || new Date().toISOString().split("T")[0],
      excerpt,
      source: source || "dLuz Protocol",
      url: url || "#",
    };

    posts.unshift(newPost); // adiciona no início
    savePosts(posts);

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const posts = getPosts();
  return NextResponse.json(posts);
}
