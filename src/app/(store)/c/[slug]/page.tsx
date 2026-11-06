import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import SearchResults from '@/components/store/SearchResults';
export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams: Record<string, string | undefined> }) {
  const cat = await db.category.findUnique({ where: { slug: params.slug }, include: { children: { where: { isActive: true } }, parent: true } });
  if (!cat) notFound();
  return (
    <div>
      <nav className="mb-3 text-xs text-gray-500"><Link href="/">Home</Link> › {cat.parent && <><Link href={`/c/${cat.parent.slug}`}>{cat.parent.name}</Link> › </>}<span className="text-ink">{cat.name}</span></nav>
      {cat.children.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">{cat.children.map((c) => <Link key={c.id} href={`/c/${c.slug}`} className="rounded-full border bg-white px-3 py-1 text-sm hover:border-brand hover:text-brand">{c.name}</Link>)}</div>
      )}
      <SearchResults params={searchParams} basePath={`/c/${cat.slug}`} title={cat.name} category={cat.slug} />
    </div>
  );
}
