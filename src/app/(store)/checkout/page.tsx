import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCart, cartTotals, effectivePrice } from '@/lib/cart';
import CheckoutForm from '@/components/store/CheckoutForm';
export const metadata = { title: 'Checkout' };
export default async function Page() {
  const s = await requireUser('/checkout');
  const cart = await getCart(s.userId);
  const t = cartTotals(cart.items);
  if (t.active.length === 0) redirect('/cart');
  const addresses = await db.address.findMany({ where: { userId: s.userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
      <CheckoutForm addresses={addresses} subtotal={t.subtotal} shipping={t.shipping} codAllowed={t.active.every((i) => i.product.codAvailable)} items={t.active.map((i) => ({ title: i.product.title, qty: i.quantity, line: effectivePrice(i.product, i.variant) * i.quantity, img: i.product.images[0]?.url }))} />
    </div>
  );
}
