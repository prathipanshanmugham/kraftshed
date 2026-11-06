import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr, num } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import Stat from '@/components/ui/Stat';
export default async function Page() {
  const { seller } = await requireSeller();
  const since = new Date(Date.now() - 90 * 86400000);
  const items = await db.orderItem.findMany({ where: { sellerId: seller.id, status: { notIn: ['CANCELLED', 'PENDING'] }, order: { createdAt: { gte: since } } }, include: { order: { select: { createdAt: true } }, product: { select: { title: true, categoryId: true, category: { select: { name: true } } } } } });
  const byMonth = new Map<string, { units: number; revenue: number }>();
  const byProduct = new Map<string, { title: string; units: number; revenue: number }>();
  const byCat = new Map<string, number>();
  for (const it of items) {
    const m = it.order.createdAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const a = byMonth.get(m) ?? { units: 0, revenue: 0 }; a.units += it.quantity; a.revenue += num(it.lineTotal); byMonth.set(m, a);
    const b = byProduct.get(it.productId) ?? { title: it.product.title, units: 0, revenue: 0 }; b.units += it.quantity; b.revenue += num(it.lineTotal); byProduct.set(it.productId, b);
    byCat.set(it.product.category.name, (byCat.get(it.product.category.name) ?? 0) + num(it.lineTotal));
  }
  const total = items.reduce((a, i) => a + num(i.lineTotal), 0);
  const top = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const max = Math.max(1, ...[...byMonth.values()].map((v) => v.revenue));
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="Shop reports (last 90 days)">
      <div className="grid gap-4 sm:grid-cols-3"><Stat label="Revenue" value={inr(total)} accent /><Stat label="Units sold" value={items.reduce((a, i) => a + i.quantity, 0)} /><Stat label="Avg. order value" value={inr(items.length ? total / items.length : 0)} /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5"><h2 className="font-bold">Revenue by month</h2><div className="mt-3 space-y-2">{[...byMonth.entries()].map(([m, v]) => <div key={m} className="flex items-center gap-2 text-sm"><span className="w-20 text-xs">{m}</span><div className="h-5 flex-1 rounded bg-gray-100"><div className="h-5 rounded bg-brand" style={{ width: `${(v.revenue / max) * 100}%` }} /></div><span className="w-24 text-right font-medium">{inr(v.revenue)}</span></div>)}{byMonth.size === 0 && <p className="text-sm text-gray-500">No sales in this period.</p>}</div></div>
        <div className="card p-5"><h2 className="font-bold">Top products</h2><table className="table mt-3"><thead><tr><th>Product</th><th>Units</th><th className="text-right">Revenue</th></tr></thead><tbody>{top.map((t) => <tr key={t.title}><td className="max-w-xs truncate">{t.title}</td><td>{t.units}</td><td className="text-right">{inr(t.revenue)}</td></tr>)}</tbody></table></div>
        <div className="card p-5"><h2 className="font-bold">Sales by category</h2><ul className="mt-3 space-y-1 text-sm">{[...byCat.entries()].sort((a, b) => b[1] - a[1]).map(([c, v]) => <li key={c} className="flex justify-between"><span>{c}</span><span className="font-medium">{inr(v)}</span></li>)}</ul></div>
        <div className="card p-5"><h2 className="font-bold">Export</h2><p className="mt-1 text-sm text-gray-600">Download your orders as CSV for accounting or GST filing.</p><a href="/seller/reports/orders.csv" className="btn-outline mt-3">Download orders CSV</a></div>
      </div>
    </SellerShell>
  );
}
