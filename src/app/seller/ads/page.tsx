import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import { saveCampaign, toggleCampaign } from '@/app/actions/seller';
export default async function Page() {
  const { seller } = await requireSeller();
  const [campaigns, products] = await Promise.all([db.adCampaign.findMany({ where: { sellerId: seller.id }, include: { product: { select: { title: true } } }, orderBy: { createdAt: 'desc' } }), db.product.findMany({ where: { sellerId: seller.id, status: 'ACTIVE' }, select: { id: true, title: true } })]);
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="Advertising — Promoted listings">
      <p className="mb-4 text-sm text-gray-600">Promoted listings appear at the top of search results for your keywords. You pay only per click; spend is deducted from your balance.</p>
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <form action={saveCampaign} className="card space-y-3 p-5 h-fit"><h2 className="font-bold">New campaign</h2>
          <div><label className="label">Product</label><select name="productId" className="input" required>{products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
          <div><label className="label">Campaign name</label><input name="name" className="input" /></div>
          <div><label className="label">Keywords (comma separated)</label><input name="keywords" className="input" placeholder="pottery, planter, terracotta" required /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Daily budget (₹)</label><input name="dailyBudget" type="number" defaultValue={100} className="input" /></div><div><label className="label">Bid per click (₹)</label><input name="bidPerClick" type="number" step="0.5" defaultValue={2} className="input" /></div></div>
          <button className="btn-primary w-full" disabled={products.length === 0}>Launch campaign</button>
        </form>
        <div className="card overflow-x-auto"><table className="table"><thead><tr><th>Campaign</th><th>Keywords</th><th>Budget/day</th><th>Bid</th><th>Impr.</th><th>Clicks</th><th>Spend</th><th>Status</th></tr></thead><tbody>
          {campaigns.map((c) => <tr key={c.id}><td><p className="font-medium">{c.name}</p><p className="text-xs text-gray-500">{c.product.title}</p></td><td className="text-xs">{c.keywords.join(', ')}</td><td>{inr(c.dailyBudget)}</td><td>{inr(c.bidPerClick)}</td><td>{c.impressions}</td><td>{c.clicks}</td><td>{inr(c.spend)}</td><td><form action={toggleCampaign}><input type="hidden" name="id" value={c.id} /><button className={`badge ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{c.isActive ? 'Active · pause' : 'Paused · resume'}</button></form></td></tr>)}
          {campaigns.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-gray-500">No campaigns yet.</td></tr>}
        </tbody></table></div>
      </div>
    </SellerShell>
  );
}
