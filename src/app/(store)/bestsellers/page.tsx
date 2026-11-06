import { db } from '@/lib/db';
import { productInclude } from '@/lib/catalog';
import ProductGrid from '@/components/store/ProductGrid';
export const metadata = { title: 'Most loved' };
export default async function Page() {
  const items = await db.product.findMany({ where: { status: 'ACTIVE' }, include: productInclude, orderBy: [{ salesCount: 'desc' }, { ratingCount: 'desc' }], take: 50 });
  return <div><h1 className="text-2xl font-bold">Most loved</h1><p className="text-sm text-gray-600">What the Kraftshed community keeps coming back for.</p><ProductGrid products={items} /></div>;
}
