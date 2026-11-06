'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar({ categories }: { categories: { name: string; slug: string }[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [cat, setCat] = useState(sp.get('category') ?? '');
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const p = new URLSearchParams(); if (q) p.set('q', q); if (cat) p.set('category', cat); router.push(`/search?${p}`); }}
      className="flex w-full items-center overflow-hidden rounded-full border border-sand-dark bg-white pl-4 text-ink focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/15"
    >
      <svg className="h-5 w-5 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pottery, yarn, leather, paints…" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none" />
      <select value={cat} onChange={(e) => setCat(e.target.value)} className="hidden max-w-[140px] border-l border-sand bg-transparent px-2 py-2 text-xs text-ink-soft outline-none sm:block">
        <option value="">Everywhere</option>
        {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <button type="submit" className="m-1 rounded-full bg-forest px-4 py-1.5 text-sm font-bold text-white hover:bg-forest-dark">Search</button>
    </form>
  );
}
