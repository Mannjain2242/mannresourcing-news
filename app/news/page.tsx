"use client";

import { useEffect, useState } from "react";

type Article = {
  title: string
  description: string
  url: string
  publishedAt: string
  image?: string
  source?: {
    id?: string
    name?: string
    url?: string
    country?: string
  }
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Failed to load news", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  if (loading) return <p style={{ padding: "20px" }}>Loading…</p>;
  if (articles.length === 0)
    return <p style={{ padding: "20px" }}>No news found.</p>;

const categories = [
  { label: "Trade", q: "export import trade" },
  { label: "Logistics", q: "logistics shipping transport" },
  { label: "Economy", q: "global economy economic news" },
];

return (
  <main style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
    <h1 style={{ marginBottom: "16px" }}>
      Export-Import & Global Trade News
    </h1>

    <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
      {categories.map((c) => (
        <button
          key={c.label}
          onClick={() => {
            setLoading(true);
            fetch(`/api/news?q=${encodeURIComponent(c.q)}`)
              .then((r) => r.json())
              .then((d) => setArticles(d.articles || []))
              .finally(() => setLoading(false));
          }}
          style={{
            padding: "8px 12px",
            border: "1px solid #555",
            background: "#f4f4f4",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
      <div style={{ display: "grid", gap: "16px" }}>
        {articles.map((a, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            {a.image && (
              <img
                src={a.image}
                alt=""
                style={{
                  width: "120px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <a
                href={a.url}
                target="_blank"
                style={{ textDecoration: "none", color: "#111" }}
              >
                <h2 style={{ margin: "0 0 8px" }}>{a.title}</h2>
              </a>

              <p style={{ margin: "0 0 8px", color: "#444" }}>
                {a.description}
              </p>

             <small style={{ color: "#777", fontSize: "13px" }}>
  {a.source?.name || "Unknown source"} •{" "}
  {new Date(a.publishedAt).toLocaleString()}
</small>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

