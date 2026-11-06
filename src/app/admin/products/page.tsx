import Link from 'next/link';
import { db } from '@/lib/db';
import { inr } from '@/lib/format';
import AdminShell from '@/components/admin/AdminShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { reviewProduct } from '@/app/actions/admin';
export default async function Page({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const products = await db.product.findMany({ where: { ...(searchParams.status ? { status: searchParams.status as any } : {}), ...(searchParams.q ? { title: { contains: searchParams.q, mode: 'insensitive' } } : {}) }, include: { seller: { select: { storeName: true } }, category: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } }, orderBy: { updatedAt: 'desc' }, take: 100 });
  return (
    <AdminShell title="Products">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">{['', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'INACTIVE', 'DRAFT'].map((s) => <Link key={s} href={`/admin/products${s ? `?status=${s}` : ''}`} className={`rounded-full px-3 py-1 ${(searchParams.status ?? '') === s ? 'bg-navy text-white' : 'border bg-white'}`}>{s ? s.replace('_', ' ').toLowerCase() : 'All'}</Link>)}<form className="ml-auto"><input name="q" defaultValue={searchParams.q} placeholder="Search title…" className="input py-1" /></form></div>
      <div className="space-y-3">{products.map((p) => (
        <div key={p.id} className="card flex flex-wrap items-center gap-4 p-4">
          {p.images[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.images[0].url} alt="" className="h-16 w-16 rounded object-cover" /> : <div className="h-16 w-16 rounded bg-gray-100" />}
          <div className="min-w-0 flex-1 text-sm"><p className="font-semibold">{p.title}</p><p className="text-xs text-gray-500">{p.seller.storeName} · {p.category.name} · {inr(p.price)} · stock {p.stock}</p><div className="mt-1 flex items-center gap-2"><StatusBadge s={p.status} />{p.isFeatured && <span className="badge bg-brand-light text-brand-dark">Recommended</span>}<Link href={`/p/${p.slug}`} className="text-xs text-brand">Preview</Link></div></div>
          <form action={reviewProduct} className="flex flex-wrap items-center gap-2 text-xs"><input type="hidden" name="id" value={p.id} /><input name="reason" placeholder="Rejection reason" className="input w-44 py-1" />{p.status !== 'ACTIVE' && <button name="action" value="approve" className="btn-primary">Approve</button>}{p.status !== 'REJECTED' && <button name="action" value="reject" className="btn-outline">Reject</button>}{p.status === 'ACTIVE' && <button name="action" value="deactivate" className="btn-outline">Take down</button>}<button name="action" value={p.isFeatured ? 'unfeature' : 'feature'} className="btn-ghost">{p.isFeatured ? 'Unfeature' : 'Feature'}</button></form>
        </div>
      ))}{products.length === 0 && <div className="card p-8 text-center text-gray-500">No products.</div>}</div>
    </AdminShell>
  );
}
