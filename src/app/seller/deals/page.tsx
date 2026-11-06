import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr, dateFmt } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import { saveDeal, deleteDeal } from '@/app/actions/seller';
export default async function Page() {
  const { seller } = await requireSeller();
  const [deals, products] = await Promise.all([db.deal.findMany({ where: { product: { sellerId: seller.id } }, include: { product: true }, orderBy: { endsAt: 'desc' } }), db.product.findMany({ where: { sellerId: seller.id, status: 'ACTIVE' }, select: { id: true, title: true, price: true } })]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="Deals">
      <p className="mb-4 text-sm text-gray-600">Deals show a red &quot;Deal&quot; badge, appear on the Offers page and on the home page.</p>
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <form action={saveDeal} className="card h-fit space-y-3 p-5"><h2 className="font-bold">Create a deal</h2>
          <div><label className="label">Product</label><select name="productId" className="input" required>{products.map((p) => <option key={p.id} value={p.id}>{p.title} ({inr(p.price)})</option>)}</select></div>
          <div><label className="label">Deal price (₹)</label><input name="dealPrice" type="number" className="input" required /></div>
          <div><label className="label">Label</label><input name="label" className="input" defaultValue="Limited-time offer" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Starts</label><input name="startsAt" type="date" defaultValue={today} className="input" required /></div><div><label className="label">Ends</label><input name="endsAt" type="date" className="input" required /></div></div>
          <button className="btn-primary w-full" disabled={products.length === 0}>Create deal</button>
        </form>
        <div className="card overflow-x-auto"><table className="table"><thead><tr><th>Product</th><th>Regular</th><th>Deal price</th><th>Window</th><th></th></tr></thead><tbody>
          {deals.map((d) => <tr key={d.id}><td>{d.product.title}</td><td>{inr(d.product.price)}</td><td className="font-semibold text-red-600">{inr(d.dealPrice)}</td><td className="text-xs">{dateFmt(d.startsAt)} – {dateFmt(d.endsAt)}</td><td><form action={deleteDeal}><input type="hidden" name="id" value={d.id} /><button className="text-xs text-red-600">End deal</button></form></td></tr>)}
          {deals.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No deals yet.</td></tr>}
        </tbody></table></div>
      </div>
    </SellerShell>
  );
}
