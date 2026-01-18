import React, { useState } from "react";

export default function Home() {
  // inside app/news/page.tsx (client component)

  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<Array<{
    url: string;
    title: string;
    description: string;
    source: any;
    publishedAt: string;
  }>>([]);

  function handleFilter(filter: string) {
    // TODO: Implement filter logic here
    console.log("Filter selected:", filter);
  }

return (
  <main className="container">
    <div className="header">
      <h1 className="title">Export-Import & Global Trade News</h1>
      <div className="filters">
        <button className="btn" onClick={() => handleFilter("export import trade")}>Trade</button>
        <button className="btn" onClick={() => handleFilter("logistics shipping transport")}>Logistics</button>
        <button className="btn" onClick={() => handleFilter("global economy economics")}>Economy</button>
      </div>
    </div>

    {loading && <p>Loading…</p>}
    {!loading && articles.length===0 && <p>No news found.</p>}

    <div>
      {articles.map((a, i) => (
        <article className="card" key={i}>
          <div style={{flex:1}}>
            <a href={a.url} target="_blank" rel="noreferrer">
              <h2 className="card-title">{a.title}</h2>
            </a>
            <p className="card-desc">{a.description}</p>
            <div className="card-meta">
              {typeof a.source === "object" ? a.source.name : a.source || "Unknown source"} • {new Date(a.publishedAt).toLocaleString()}
            </div>
          </div>
        </article>
      ))}
    </div>
  </main>
);
}