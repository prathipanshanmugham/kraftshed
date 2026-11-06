import Link from 'next/link';
import { db } from '@/lib/db';
import { inr, num, dateFmt } from '@/lib/format';
import AdminShell from '@/components/admin/AdminShell';
import Stat from '@/components/ui/Stat';
import StatusBadge from '@/components/ui/StatusBadge';
export default async function Page() {
  const since = new Date(Date.now() - 30 * 86400000);
  const [gmv, orders, buyers, sellers, pendingSellers, pendingProducts, openDisputes, pendingReturns, commission, recent] = await Promise.all([
    db.order.aggregate({ where: { status: { in: ['PAID', 'COMPLETED'] }, createdAt: { gte: since } }, _sum: { grandTotal: true }, _count: true }),
    db.order.count({ where: { status: { in: ['PAID', 'COMPLETED'] } } }), db.user.count(), db.seller.count({ where: { status: 'APPROVED' } }),
    db.seller.count({ where: { status: 'PENDING' } }), db.product.count({ where: { status: 'PENDING_REVIEW' } }), db.dispute.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }), db.returnRequest.count({ where: { status: 'REQUESTED' } }),
    db.ledgerEntry.aggregate({ where: { type: 'COMMISSION', createdAt: { gte: since } }, _sum: { amount: true } }),
    db.order.findMany({ where: { status: { not: 'PENDING_PAYMENT' } }, include: { user: { select: { name: true } }, items: true }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);
  return (
    <AdminShell title="Marketplace overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="GMV (30 days)" value={inr(num(gmv._sum.grandTotal))} sub={`${gmv._count} paid orders`} accent /><Stat label="Commission earned (30d)" value={inr(-num(commission._sum.amount))} /><Stat label="Active sellers" value={sellers} sub={`${pendingSellers} awaiting approval`} /><Stat label="Registered users" value={buyers} sub={`${orders} lifetime orders`} /></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[['Seller applications', pendingSellers, '/admin/sellers?status=PENDING'], ['Listings to review', pendingProducts, '/admin/products?status=PENDING_REVIEW'], ['Open disputes', openDisputes, '/admin/disputes'], ['Return requests', pendingReturns, '/admin/returns']].map(([l, n, h]) => <Link key={String(l)} href={String(h)} className={`card flex items-center justify-between p-4 ${Number(n) > 0 ? 'border-l-4 border-brand' : ''}`}><span className="text-sm font-semibold">{l}</span><span className="text-2xl font-bold">{n}</span></Link>)}
      </div>
      <div className="card mt-6 p-5"><h2 className="font-bold">Recent orders</h2><table className="table mt-3"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>{recent.map((o) => <tr key={o.id}><td><Link href={`/admin/orders?q=${o.orderNumber}`} className="text-brand">{o.orderNumber}</Link></td><td>{o.user.name}</td><td>{o.items.length}</td><td>{inr(o.grandTotal)}</td><td><StatusBadge s={o.status} /></td><td className="text-xs">{dateFmt(o.createdAt)}</td></tr>)}</tbody></table></div>
    </AdminShell>
  );
}
