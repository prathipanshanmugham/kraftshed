import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { productInclude } from '@/lib/catalog';
import ProductGrid from '@/components/store/ProductGrid';
import Empty from '@/components/ui/Empty';
export const metadata = { title: 'Saved items' };
export default async function Page() {
  const s = await requireUser('/wishlist');
  const items = await db.wishlistItem.findMany({ where: { userId: s.userId }, include: { product: { include: productInclude } }, orderBy: { createdAt: 'desc' } });
  return <div><h1 className="text-2xl font-bold">Saved items</h1>{items.length ? <ProductGrid products={items.map((i) => i.product)} /> : <div className="mt-6"><Empty title="Your wishlist is empty" body="Tap ♡ on any product to save it here." cta="Start browsing" href="/" /></div>}</div>;
}
