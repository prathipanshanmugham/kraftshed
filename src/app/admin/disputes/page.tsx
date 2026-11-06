import { db } from '@/lib/db';
import { dateFmt } from '@/lib/format';
import AdminShell from '@/components/admin/AdminShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { resolveDispute } from '@/app/actions/admin';
export default async function Page() {
  const list = await db.dispute.findMany({ include: { user: { select: { name: true, email: true } }, order: { include: { items: { include: { seller: { select: { storeName: true } } } } } } }, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }] });
  return (
    <AdminShell title="Disputes">
      <div className="space-y-3">{list.map((d) => <div key={d.id} className="card grid gap-3 p-4 text-sm md:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-2"><StatusBadge s={d.status} /><span className="font-semibold">{d.subject}</span></div><p className="text-xs text-gray-500">{d.order.orderNumber} · {d.user.name} ({d.user.email}) · {dateFmt(d.createdAt)} · sellers: {[...new Set(d.order.items.map((i) => i.seller.storeName))].join(', ')}</p><p className="mt-1">{d.details}</p>{d.resolution && <p className="mt-1 rounded bg-gray-50 p-2 text-xs"><strong>Resolution:</strong> {d.resolution}</p>}</div><form action={resolveDispute} className="flex flex-col gap-1 text-xs"><input type="hidden" name="id" value={d.id} /><select name="status" defaultValue={d.status} className="input py-1">{['OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'CLOSED'].map((s) => <option key={s}>{s}</option>)}</select><input name="resolution" placeholder="Resolution note" className="input py-1" /><button className="btn-secondary">Update</button></form></div>)}{list.length === 0 && <div className="card p-8 text-center text-gray-500">No disputes.</div>}</div>
    </AdminShell>
  );
}
