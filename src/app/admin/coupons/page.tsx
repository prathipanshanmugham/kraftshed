import { db } from '@/lib/db';
import { inr, dateFmt } from '@/lib/format';
import AdminShell from '@/components/admin/AdminShell';
import { savePlatformCoupon, toggleAnyCoupon } from '@/app/actions/admin';
export default async function Page() {
  const coupons = await db.coupon.findMany({ include: { seller: { select: { storeName: true } } }, orderBy: { startsAt: 'desc' } });
  return (
    <AdminShell title="Coupons & promotions">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <form action={savePlatformCoupon} className="card h-fit space-y-3 p-5"><h2 className="font-bold">Platform-wide coupon</h2><div><label className="label">Code</label><input name="code" className="input uppercase" required /></div><div><label className="label">Description</label><input name="description" className="input" /></div><div className="grid grid-cols-2 gap-3"><div><label className="label">% off</label><input name="percentOff" type="number" className="input" /></div><div><label className="label">or ₹ off</label><input name="amountOff" type="number" className="input" /></div></div><div className="grid grid-cols-2 gap-3"><div><label className="label">Min order</label><input name="minOrder" type="number" className="input" /></div><div><label className="label">Max uses</label><input name="maxUses" type="number" className="input" /></div></div><div><label className="label">Expires</label><input name="endsAt" type="date" className="input" /></div><button className="btn-primary w-full">Create</button></form>
        <div className="card overflow-x-auto"><table className="table"><thead><tr><th>Code</th><th>Scope</th><th>Discount</th><th>Used</th><th>Expires</th><th>Status</th></tr></thead><tbody>{coupons.map((c) => <tr key={c.id}><td className="font-mono font-semibold">{c.code}</td><td className="text-xs">{c.seller?.storeName ?? 'Platform'}</td><td>{c.percentOff ? `${c.percentOff}%` : inr(c.amountOff ?? 0)}</td><td>{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td><td className="text-xs">{c.endsAt ? dateFmt(c.endsAt) : 'Never'}</td><td><form action={toggleAnyCoupon}><input type="hidden" name="id" value={c.id} /><button className={`badge ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{c.isActive ? 'Active' : 'Inactive'}</button></form></td></tr>)}</tbody></table></div>
      </div>
    </AdminShell>
  );
}
