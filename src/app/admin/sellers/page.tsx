import Link from 'next/link';
import { db } from '@/lib/db';
import { dateFmt } from '@/lib/format';
import AdminShell from '@/components/admin/AdminShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { reviewSeller } from '@/app/actions/admin';
export default async function Page({ searchParams }: { searchParams: { status?: string } }) {
  const sellers = await db.seller.findMany({ where: searchParams.status ? { status: searchParams.status as any } : {}, include: { user: true, _count: { select: { products: true, orderItems: true } } }, orderBy: { createdAt: 'desc' } });
  return (
    <AdminShell title="Sellers">
      <div className="mb-4 flex gap-2 text-sm">{['', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map((s) => <Link key={s} href={`/admin/sellers${s ? `?status=${s}` : ''}`} className={`rounded-full px-3 py-1 ${(searchParams.status ?? '') === s ? 'bg-navy text-white' : 'border bg-white'}`}>{s || 'All'}</Link>)}</div>
      <div className="space-y-3">{sellers.map((s) => (
        <details key={s.id} className="card p-4"><summary className="flex cursor-pointer flex-wrap items-center gap-3"><span className="font-bold">{s.storeName}</span><StatusBadge s={s.status} /><span className="text-xs text-gray-500">{s.user.name} · {s.user.email} · applied {dateFmt(s.createdAt)} · {s._count.products} products · {s._count.orderItems} order items</span></summary>
          <div className="mt-3 grid gap-4 text-sm md:grid-cols-2">
            <dl className="grid grid-cols-[130px_1fr] gap-y-1"><dt className="font-semibold">Business</dt><dd>{s.businessType} · {s.legalName}</dd><dt className="font-semibold">PAN / GST</dt><dd>{s.pan} / {s.gstin ?? '—'}</dd><dt className="font-semibold">Pickup</dt><dd>{s.pickupAddress}, {s.pickupCity}, {s.pickupState} {s.pickupPincode}</dd><dt className="font-semibold">Bank</dt><dd>{s.bankAccountName} · {s.bankAccountNo} · {s.bankIfsc}{s.upiId ? ` · ${s.upiId}` : ''}</dd><dt className="font-semibold">Phone</dt><dd>{s.user.phone ?? '—'}</dd><dt className="font-semibold">Store</dt><dd><Link href={`/s/${s.slug}`} className="text-brand">/s/{s.slug}</Link></dd></dl>
            <form action={reviewSeller} className="space-y-2"><input type="hidden" name="id" value={s.id} /><input name="reason" placeholder="Reason / message to seller (optional)" className="input" /><div className="flex items-center gap-2"><label className="text-xs">Commission %</label><input name="commissionPercent" type="number" step="0.5" defaultValue={s.commissionPercent ? Number(s.commissionPercent) : ''} placeholder="default" className="input w-24 py-1" /></div><div className="flex flex-wrap gap-2"><button name="action" value="approve" className="btn-primary text-xs">Approve</button><button name="action" value="reject" className="btn-outline text-xs">Reject</button><button name="action" value="suspend" className="btn-danger text-xs">Suspend</button></div></form>
          </div>
        </details>
      ))}{sellers.length === 0 && <div className="card p-8 text-center text-gray-500">No sellers.</div>}</div>
    </AdminShell>
  );
}
