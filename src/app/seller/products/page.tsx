import Link from 'next/link';
import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import StatusBadge from '@/components/ui/StatusBadge';
import Alert from '@/components/ui/Alert';
import { setProductStatus } from '@/app/actions/seller';
export default async function Page({ searchParams }: { searchParams: { saved?: string; status?: string } }) {
  const { seller } = await requireSeller();
  const products = await db.product.findMany({ where: { sellerId: seller.id, ...(searchParams.status ? { status: searchParams.status as any } : {}) }, include: { images: { take: 1, orderBy: { sortOrder: 'asc' } }, category: true }, orderBy: { updatedAt: 'desc' } });
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="My listings">
      {searchParams.saved && <div className="mb-4"><Alert type="success">Product saved.</Alert></div>}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        {['', 'ACTIVE', 'PENDING_REVIEW', 'DRAFT', 'INACTIVE', 'REJECTED'].map((s) => <Link key={s} href={`/seller/products${s ? `?status=${s}` : ''}`} className={`rounded-full px-3 py-1 ${(searchParams.status ?? '') === s ? 'bg-navy text-white' : 'bg-white border'}`}>{s ? s.replace('_', ' ').toLowerCase() : 'All'}</Link>)}
        <Link href="/seller/products/new" className="btn-primary ml-auto">+ New listing</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sales</th><th>Status</th><th></th></tr></thead><tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td><div className="flex items-center gap-3">{p.images[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.images[0].url} alt="" className="h-12 w-12 rounded object-cover" /> : <div className="h-12 w-12 rounded bg-gray-100" />}<div><Link href={`/seller/products/${p.id}`} className="font-medium hover:text-brand">{p.title}</Link><p className="text-xs text-gray-500">{p.sku ?? '—'}</p></div></div></td>
              <td className="text-xs">{p.category.name}</td><td>{inr(p.price)}</td><td className={p.stock <= p.lowStockAt ? 'font-semibold text-red-600' : ''}>{p.stock}</td><td>{p.salesCount}</td>
              <td><StatusBadge s={p.status} />{p.status === 'REJECTED' && p.rejectionReason && <p className="text-xs text-red-600">{p.rejectionReason}</p>}</td>
              <td><div className="flex gap-2 text-xs"><Link href={`/seller/products/${p.id}`} className="text-brand">Edit</Link>{p.status === 'ACTIVE' && <Link href={`/p/${p.slug}`} className="text-gray-600">View</Link>}<form action={setProductStatus}><input type="hidden" name="id" value={p.id} />{p.status === 'ACTIVE' ? <button name="action" value="deactivate" className="text-gray-600">Deactivate</button> : p.status === 'INACTIVE' ? <button name="action" value="activate" className="text-green-700">Activate</button> : null}</form><form action={setProductStatus}><input type="hidden" name="id" value={p.id} /><button name="action" value="delete" className="text-red-600">Delete</button></form></div></td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No products yet. <Link href="/seller/products/new" className="text-brand underline">Add your first product</Link>.</td></tr>}
        </tbody></table>
      </div>
    </SellerShell>
  );
}
