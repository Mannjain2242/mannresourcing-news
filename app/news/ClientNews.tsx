// app/news/ClientNews.tsx
'use client';

import React, { useState } from 'react';

type Article = any; // you can tighten these types later

export default function ClientNews({ articles }: { articles: Article[] }) {
  const [page, setPage] = useState(1); // client-side state for pagination/search
  const perPage = 10;
  const start = (page - 1) * perPage;
  const pageArticles = articles.slice(start, start + perPage);

  return (
    <div>
      {/* filters / buttons you already had */}
      <div style={{ marginBottom: 16 }}>
        <button>Trade</button>
        <button>Logistics</button>
        <button>Economy</button>
      </div>

      {/* list */}
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {pageArticles.map((a: Article, i: number) => (
          <li key={a.id || i} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 6 }}>
            <a href={a.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#111' }}>
              <h2 style={{ margin: '0 0 8px' }}>{a.title}</h2>
            </a>
            <p style={{ margin: '0 0 8px', color: '#444' }}>{a.description}</p>
            <small style={{ color: '#777' }}>
              {(a.source && (a.source.name || a.source)) || 'Unknown source'} ·{' '}
              {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : 'No date'}
            </small>
          </li>
        ))}
      </ul>

      {/* basic pagination */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={start + perPage >= articles.length}>Next</button>
      </div>
    </div>
  );
}