import { db } from '@/lib/db';
import { inr, dateFmt } from '@/lib/format';
import AdminShell from '@/components/admin/AdminShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { adminUpdateReturn } from '@/app/actions/admin';
export default async function Page() {
  const list = await db.returnRequest.findMany({ include: { orderItem: { include: { order: { include: { user: { select: { name: true } } } }, seller: { select: { storeName: true } } } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <AdminShell title="Returns & refunds">
      <div className="space-y-3">{list.map((r) => <div key={r.id} className="card grid gap-3 p-4 text-sm md:grid-cols-[1fr_auto]"><div><p className="font-semibold">{r.orderItem.title}</p><p className="text-xs text-gray-500">{r.orderItem.order.orderNumber} · buyer {r.orderItem.order.user.name} · seller {r.orderItem.seller.storeName} · {dateFmt(r.createdAt)} · refund {inr(r.refundAmount ?? r.orderItem.lineTotal)}</p><p className="mt-1">{r.reason}{r.details && ` — ${r.details}`}</p><p className="mt-1"><StatusBadge s={r.status} /> {r.sellerNote}</p></div><form action={adminUpdateReturn} className="flex flex-col gap-1 text-xs"><input type="hidden" name="id" value={r.id} /><select name="status" defaultValue={r.status} className="input py-1">{['REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED'].map((s) => <option key={s}>{s}</option>)}</select><input name="note" placeholder="Note" className="input py-1" /><button className="btn-secondary">Override</button></form></div>)}{list.length === 0 && <div className="card p-8 text-center text-gray-500">No return requests.</div>}</div>
    </AdminShell>
  );
}
