import Link from 'next/link';
import { requireApprovedSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr, num, dateFmt } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import Stat from '@/components/ui/Stat';
import StatusBadge from '@/components/ui/StatusBadge';
export default async function Page() {
  const { seller } = await requireApprovedSeller();
  const since = new Date(Date.now() - 30 * 86400000);
  const [sales, pendingShip, returns, lowStock, balance, recent, activeProducts, pendingReview] = await Promise.all([
    db.orderItem.aggregate({ where: { sellerId: seller.id, status: { notIn: ['CANCELLED', 'PENDING', 'REFUNDED', 'RETURNED'] }, order: { createdAt: { gte: since } } }, _sum: { lineTotal: true }, _count: true }),
    db.orderItem.count({ where: { sellerId: seller.id, status: { in: ['CONFIRMED', 'PACKED'] } } }),
    db.returnRequest.count({ where: { orderItem: { sellerId: seller.id }, status: 'REQUESTED' } }),
    db.product.findMany({ where: { sellerId: seller.id, status: 'ACTIVE', stock: { lte: 5 } }, take: 5 }),
    db.ledgerEntry.aggregate({ where: { sellerId: seller.id }, _sum: { amount: true } }),
    db.orderItem.findMany({ where: { sellerId: seller.id }, include: { order: true }, orderBy: { order: { createdAt: 'desc' } }, take: 8 }),
    db.product.count({ where: { sellerId: seller.id, status: 'ACTIVE' } }),
    db.product.count({ where: { sellerId: seller.id, status: 'PENDING_REVIEW' } }),
  ]);
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title={`Hello, ${seller.storeName}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Sales (30 days)" value={inr(num(sales._sum.lineTotal))} sub={`${sales._count} units`} accent />
        <Stat label="To ship" value={pendingShip} sub="Confirmed / packed orders" />
        <Stat label="Return requests" value={returns} sub="Awaiting your action" />
        <Stat label="Available balance" value={inr(num(balance._sum.amount))} sub="Net of commission & payouts" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">Recent orders</h2><Link href="/seller/orders" className="text-sm font-semibold text-brand">Orders →</Link></div>
          <table className="table mt-3"><thead><tr><th>Order</th><th>Item</th><th>Qty</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            {recent.map((it) => <tr key={it.id}><td className="text-xs">{it.order.orderNumber}<br /><span className="text-gray-500">{dateFmt(it.order.createdAt)}</span></td><td className="max-w-[200px] truncate">{it.title}</td><td>{it.quantity}</td><td>{inr(it.lineTotal)}</td><td><StatusBadge s={it.status} /></td></tr>)}
            {recent.length === 0 && <tr><td colSpan={5} className="text-center text-gray-500">No orders yet. Share your store link: <code>/s/{seller.slug}</code></td></tr>}
          </tbody></table>
        </div>
        <div className="space-y-4">
          <div className="card p-5"><h2 className="font-bold">Listings</h2><p className="mt-1 text-sm">{activeProducts} active · {pendingReview} pending review</p><div className="mt-3 flex gap-2"><Link href="/seller/products/new" className="btn-primary text-xs">New listing</Link><Link href="/seller/products" className="btn-outline text-xs">Manage</Link></div></div>
          <div className="card p-5"><h2 className="font-bold">Low stock</h2>{lowStock.length === 0 ? <p className="mt-1 text-sm text-gray-500">All good.</p> : <ul className="mt-2 space-y-1 text-sm">{lowStock.map((p) => <li key={p.id} className="flex justify-between"><span className="truncate">{p.title}</span><span className="font-semibold text-red-600">{p.stock} left</span></li>)}</ul>}<Link href="/seller/inventory" className="mt-2 block text-sm font-semibold text-brand">Update inventory →</Link></div>
          <div className="card p-5"><h2 className="font-bold">Shop health</h2><p className="mt-1 text-sm">Rating {Number(seller.ratingAvg).toFixed(1)} ★ ({seller.ratingCount})</p><p className="text-sm">Handling time: {seller.handlingDays} days</p><Link href={`/s/${seller.slug}`} className="mt-2 block text-sm font-semibold text-brand">View your shop →</Link></div>
        </div>
      </div>
    </SellerShell>
  );
}
