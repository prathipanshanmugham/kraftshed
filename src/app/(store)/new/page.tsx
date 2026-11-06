import { db } from '@/lib/db';
import { productInclude } from '@/lib/catalog';
import ProductGrid from '@/components/store/ProductGrid';
export const metadata = { title: 'Just in' };
export default async function Page() {
  const items = await db.product.findMany({ where: { status: 'ACTIVE' }, include: productInclude, orderBy: { createdAt: 'desc' }, take: 50 });
  return <div><h1 className="text-2xl font-bold">Just in</h1><p className="text-sm text-gray-600">The newest pieces from studios across India.</p><ProductGrid products={items} /></div>;
}
