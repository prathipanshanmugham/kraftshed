import { db } from '@/lib/db';
import { inr, dateFmt } from '@/lib/format';
import AdminShell from '@/components/admin/AdminShell';
import StatusBadge from '@/components/ui/StatusBadge';
export default async function Page({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const orders = await db.order.findMany({ where: { ...(searchParams.q ? { OR: [{ orderNumber: { contains: searchParams.q, mode: 'insensitive' } }, { user: { email: { contains: searchParams.q, mode: 'insensitive' } } }] } : {}), ...(searchParams.status ? { status: searchParams.status as any } : {}) }, include: { user: { select: { name: true, email: true } }, items: { include: { seller: { select: { storeName: true } } } }, payment: true, address: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <AdminShell title="Orders">
      <form className="mb-4 flex flex-wrap gap-2 text-sm"><input name="q" defaultValue={searchParams.q} placeholder="Order # or customer email" className="input w-64 py-1" /><select name="status" defaultValue={searchParams.status ?? ''} className="input w-44 py-1"><option value="">All statuses</option><option>PENDING_PAYMENT</option><option>PAID</option><option>COMPLETED</option><option>CANCELLED</option></select><button className="btn-outline py-1">Filter</button></form>
      <div className="space-y-3">{orders.map((o) => (
        <details key={o.id} className="card p-4"><summary className="flex cursor-pointer flex-wrap items-center gap-3 text-sm"><span className="font-bold">{o.orderNumber}</span><StatusBadge s={o.status} /><span>{o.user.name} ({o.user.email})</span><span className="font-semibold">{inr(o.grandTotal)}</span><span className="text-xs text-gray-500">{dateFmt(o.createdAt)} · {o.paymentMethod} · {o.payment?.status ?? '—'} {o.payment?.razorpayPaymentId ?? ''}</span></summary>
          <div className="mt-3 text-sm"><p className="text-xs text-gray-600">Ship to: {o.address.fullName}, {o.address.line1}, {o.address.city}, {o.address.state} {o.address.pincode} · {o.address.phone}</p><table className="table mt-2"><thead><tr><th>Item</th><th>Seller</th><th>Qty</th><th>Total</th><th>Commission</th><th>Status</th><th>Tracking</th></tr></thead><tbody>{o.items.map((it) => <tr key={it.id}><td>{it.title}</td><td>{it.seller.storeName}</td><td>{it.quantity}</td><td>{inr(it.lineTotal)}</td><td>{inr(it.commission)}</td><td><StatusBadge s={it.status} /></td><td className="text-xs">{it.courier} {it.trackingNo}</td></tr>)}</tbody></table></div>
        </details>
      ))}{orders.length === 0 && <div className="card p-8 text-center text-gray-500">No orders.</div>}</div>
    </AdminShell>
  );
}
