import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import SellerShell from '@/components/seller/SellerShell';
import { quickUpdateInventory } from '@/app/actions/seller';
export default async function Page() {
  const { seller } = await requireSeller();
  const products = await db.product.findMany({ where: { sellerId: seller.id, status: { in: ['ACTIVE', 'INACTIVE'] } }, orderBy: { stock: 'asc' } });
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="Inventory">
      <p className="mb-3 text-sm text-gray-600">Quickly update stock and prices. Changes go live immediately.</p>
      <div className="card overflow-x-auto"><table className="table"><thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Price (₹)</th><th>M.R.P. (₹)</th><th></th></tr></thead><tbody>
        {products.map((p) => <tr key={p.id} className={p.stock <= p.lowStockAt ? 'bg-red-50' : ''}><td className="max-w-xs truncate">{p.title}</td><td className="text-xs">{p.sku ?? '—'}</td>
          <td colSpan={4}><form action={quickUpdateInventory} className="flex items-center gap-2"><input type="hidden" name="id" value={p.id} /><input name="stock" type="number" defaultValue={p.stock} className="input w-20 py-1" /><input name="price" type="number" defaultValue={Number(p.price)} className="input w-24 py-1" /><input name="mrp" type="number" defaultValue={Number(p.mrp)} className="input w-24 py-1" /><button className="btn-outline py-1 text-xs">Save</button></form></td></tr>)}
      </tbody></table></div>
    </SellerShell>
  );
}
