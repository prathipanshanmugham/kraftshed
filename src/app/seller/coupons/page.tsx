import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr, dateFmt } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import { saveCoupon, toggleCoupon } from '@/app/actions/seller';
export default async function Page() {
  const { seller } = await requireSeller();
  const coupons = await db.coupon.findMany({ where: { sellerId: seller.id }, orderBy: { startsAt: 'desc' } });
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="Coupons">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <form action={saveCoupon} className="card h-fit space-y-3 p-5"><h2 className="font-bold">Create coupon</h2>
          <div><label className="label">Code</label><input name="code" className="input uppercase" placeholder="DIWALI20" required /></div>
          <div><label className="label">Description</label><input name="description" className="input" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">% off</label><input name="percentOff" type="number" className="input" /></div><div><label className="label">or ₹ off</label><input name="amountOff" type="number" className="input" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Min order (₹)</label><input name="minOrder" type="number" className="input" /></div><div><label className="label">Max uses</label><input name="maxUses" type="number" className="input" /></div></div>
          <div><label className="label">Expires</label><input name="endsAt" type="date" className="input" /></div>
          <button className="btn-primary w-full">Create</button>
        </form>
        <div className="card overflow-x-auto"><table className="table"><thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Used</th><th>Expires</th><th>Status</th></tr></thead><tbody>
          {coupons.map((c) => <tr key={c.id}><td className="font-mono font-semibold">{c.code}<p className="text-xs font-sans font-normal text-gray-500">{c.description}</p></td><td>{c.percentOff ? `${c.percentOff}%` : inr(c.amountOff ?? 0)}</td><td>{c.minOrder ? inr(c.minOrder) : '—'}</td><td>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td><td className="text-xs">{c.endsAt ? dateFmt(c.endsAt) : 'Never'}</td><td><form action={toggleCoupon}><input type="hidden" name="id" value={c.id} /><button className={`badge ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{c.isActive ? 'Active' : 'Inactive'}</button></form></td></tr>)}
          {coupons.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No coupons yet.</td></tr>}
        </tbody></table></div>
      </div>
    </SellerShell>
  );
}
