import Link from 'next/link';
import { db } from '@/lib/db';
export const metadata = { title: 'All categories' };
export default async function Page() {
  const cats = await db.category.findMany({ where: { parentId: null, isActive: true }, orderBy: { sortOrder: 'asc' }, include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } } });
  return (
    <div>
      <h1 className="text-2xl font-bold">Shop all categories</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <div key={c.id} className="card p-5">
            <Link href={`/c/${c.slug}`} className="text-lg font-bold hover:text-brand">{c.name}</Link>
            {c.description && <p className="mt-1 text-sm text-gray-600">{c.description}</p>}
            <ul className="mt-3 space-y-1 text-sm">{c.children.map((s) => <li key={s.id}><Link href={`/c/${s.slug}`} className="text-gray-700 hover:text-brand hover:underline">{s.name}</Link></li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}
