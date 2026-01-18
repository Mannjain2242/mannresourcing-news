// app/api/news/route.ts
import { NextResponse } from "next/server";
import Parser from "rss-parser";

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

// Add RSS feed URLs here
const RSS_FEEDS = [
  "https://www.business-standard.com/rss",
  "https://b2b.economictimes.indiatimes.com/rss",
  "https://www.livemint.com/rss",
  "https://indianexpress.com/rss",
  "https://feeds.bbci.co.uk/news/business/rss.xml",
  "https://in.investing.com/webmaster-tools/rss",
];

function normalizeArticle(a: any) {
  return {
    title: a.title || "",
    description: a.description || a.content || a.contentSnippet || "",
    url: a.url || a.link || "",
    source: a.source || a.creator || a.author || "Unknown",
    publishedAt: a.publishedAt || a.pubDate || new Date().toISOString(),
  };
}

async function fetchFromGNews(q: string, page: number, pageSize: number) {
  if (!GNEWS_API_KEY) throw new Error("no-key");
  const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=${pageSize}&token=${GNEWS_API_KEY}&page=${page}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("gnews fetch failed");

  const data = await res.json();
  const articles = (data.articles || []).map(normalizeArticle);
  return { articles, total: data.totalArticles ?? data.totalResults ?? articles.length };
}

async function fetchFromRss(feeds: string[], limit = 10) {
  const parser = new Parser();
  const out: any[] = [];

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const src = feed.title || feedUrl;
      for (const item of feed.items || []) {
        out.push(
          normalizeArticle({
            title: item.title,
            description: item.contentSnippet || item.content || item.summary,
            url: item.link,
            source: src,
            publishedAt: item.isoDate || item.pubDate,
          })
        );
        if (out.length >= limit) break;
      }
    } catch (err) {
      console.warn("RSS fetch failed for", feedUrl, err);
    }
    if (out.length >= limit) break;
  }

  out.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return out.slice(0, limit);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "export import India OR global economy").trim();
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = 10;

  try {
    const g = await fetchFromGNews(q, page, pageSize);
    if (g.articles.length > 0) {
      return NextResponse.json(
        { source: "gnews", page, pageSize, totalResults: g.total, articles: g.articles },
        { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } }
      );
    }
  } catch (err) {
    console.warn("GNews failed, falling back to RSS", err);
  }

  try {
    const rssArticles = await fetchFromRss(RSS_FEEDS, pageSize);
    return NextResponse.json(
      { source: "rss-fallback", page, pageSize, totalResults: rssArticles.length, articles: rssArticles },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "RSS fetch failed" }, { status: 500 });
  }
}