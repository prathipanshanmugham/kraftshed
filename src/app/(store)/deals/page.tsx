import { db } from '@/lib/db';
import { productInclude } from '@/lib/catalog';
import ProductGrid from '@/components/store/ProductGrid';
import Empty from '@/components/ui/Empty';
export const metadata = { title: "Offers" };
export default async function Page() {
  const now = new Date();
  const items = await db.product.findMany({ where: { status: 'ACTIVE', deal: { startsAt: { lte: now }, endsAt: { gte: now } } }, include: productInclude, orderBy: { salesCount: 'desc' } });
  return <div><h1 className="text-2xl font-bold">Offers</h1><p className="text-sm text-gray-600">Limited-time prices set by makers themselves.</p>{items.length ? <ProductGrid products={items} /> : <div className="mt-6"><Empty title="No offers running right now" body="Makers add new offers often — check back soon." cta="See most loved" href="/bestsellers" /></div>}</div>;
}
