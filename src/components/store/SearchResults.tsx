import Link from 'next/link';
import { searchProducts, sponsoredFor } from '@/lib/catalog';
import ProductCard from './ProductCard';
import Pagination from '@/components/ui/Pagination';
import Empty from '@/components/ui/Empty';

export default async function SearchResults({ params, basePath, title, category }: { params: Record<string, string | undefined>; basePath: string; title: string; category?: string }) {
  const sort = params.sort ?? 'popular';
  const res = await searchProducts({ q: params.q, category: category ?? params.category, min: params.min ? Number(params.min) : undefined, max: params.max ? Number(params.max) : undefined, rating: params.rating ? Number(params.rating) : undefined, sort, page: Number(params.page ?? 1), freeShip: params.freeship === '1' });
  const sponsored = await sponsoredFor(params.q);
  const qs = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, ...overrides })) if (v && k !== 'page') p.set(k, v);
    const s = p.toString();
    return `${basePath}${s ? `?${s}` : ''}`;
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="card h-fit p-4 text-sm">
        <h3 className="font-bold">Filters</h3>
        <div className="mt-3">
          <p className="font-semibold text-gray-700">Rating</p>
          {[4, 3, 2].map((r) => <Link key={r} href={qs({ rating: String(r) })} className={`block py-0.5 hover:text-brand ${params.rating === String(r) ? 'font-bold text-brand' : ''}`}>{'★'.repeat(r)}{'☆'.repeat(5 - r)} &amp; up</Link>)}
        </div>
        <div className="mt-3">
          <p className="font-semibold text-gray-700">Price</p>
          {[['Under ₹500', '', '500'], ['₹500 – ₹1,000', '500', '1000'], ['₹1,000 – ₹2,500', '1000', '2500'], ['Over ₹2,500', '2500', '']].map(([l, mn, mx]) => (
            <Link key={l} href={qs({ min: mn || undefined, max: mx || undefined })} className={`block py-0.5 hover:text-brand ${params.min === mn && params.max === mx && (mn || mx) ? 'font-bold text-brand' : ''}`}>{l}</Link>
          ))}
        </div>
        <div className="mt-3">
          <p className="font-semibold text-gray-700">Shipping</p>
          <Link href={qs({ freeship: params.freeship === '1' ? undefined : '1' })} className={`block py-0.5 hover:text-brand ${params.freeship === '1' ? 'font-bold text-brand' : ''}`}>Free shipping</Link>
        </div>
        <Link href={basePath} className="mt-4 block text-xs text-gray-500 underline">Clear all filters</Link>
      </aside>
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-bold">{title} <span className="text-sm font-normal text-gray-500">({res.total} results)</span></h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Sort by</span>
            {[['popular', 'Recommended'], ['price_asc', 'Price: Low to High'], ['price_desc', 'Price: High to Low'], ['rating', 'Top rated'], ['newest', 'Newest']].map(([v, l]) => (
              <Link key={v} href={qs({ sort: v })} className={`rounded-full px-3 py-1 ${sort === v ? 'bg-navy text-white' : 'bg-white hover:bg-gray-100'}`}>{l}</Link>
            ))}
          </div>
        </div>
        {res.items.length === 0 ? (
          <Empty title="No results found" body="Try different keywords or remove some filters." cta="Browse all categories" href="/categories" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sponsored.map((p) => <ProductCard key={'s' + p.id} p={p} sponsored />)}
            {res.items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
        <Pagination page={res.page} pages={res.pages} base={qs({})} />
      </div>
    </div>
  );
}
