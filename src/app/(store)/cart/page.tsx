import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getCart, cartTotals, effectivePrice } from '@/lib/cart';
import { inr } from '@/lib/format';
import { updateCartItem } from '@/app/actions/cart';
import Empty from '@/components/ui/Empty';
import Alert from '@/components/ui/Alert';
export const metadata = { title: 'Your bag' };

export default async function Page({ searchParams }: { searchParams: { added?: string } }) {
  const s = await requireUser('/cart');
  const cart = await getCart(s.userId);
  const t = cartTotals(cart.items);
  const saved = cart.items.filter((i) => i.savedForLater);
  if (cart.items.length === 0) return <Empty title="Your bag is empty" body="Find something handmade to love." cta="Keep exploring" href="/" />;
  const Row = ({ i, saved }: { i: (typeof cart.items)[number]; saved?: boolean }) => (
    <div className="flex gap-4 border-b py-4 last:border-0">
      <Link href={`/p/${i.product.slug}`} className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">{i.product.images[0] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={i.product.images[0].url} alt="" className="h-full w-full object-cover" />}</Link>
      <div className="flex-1">
        <Link href={`/p/${i.product.slug}`} className="font-medium hover:text-brand">{i.product.title}</Link>
        {i.variant && <p className="text-xs text-gray-500">{i.variant.name}</p>}
        <p className="text-xs text-gray-500">Sold by {i.product.seller.storeName}</p>
        <p className={`text-xs ${i.product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>{i.product.stock > 0 ? 'In stock' : 'Out of stock'}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {!saved && (
            <form action={updateCartItem} className="flex items-center gap-1">
              <input type="hidden" name="id" value={i.id} /><input type="hidden" name="action" value="qty" />
              <select name="quantity" defaultValue={i.quantity} className="input w-20 py-1">{Array.from({ length: 10 }, (_, k) => k + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select>
              <button className="btn-outline px-2 py-1 text-xs">Update</button>
            </form>
          )}
          <form action={updateCartItem}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="action" value="remove" /><button className="text-brand hover:underline">Delete</button></form>
          <form action={updateCartItem}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="action" value={saved ? 'move' : 'save'} /><button className="text-brand hover:underline">{saved ? 'Move to bag' : 'Keep for later'}</button></form>
        </div>
      </div>
      <div className="text-right font-bold">{inr(effectivePrice(i.product, i.variant) * i.quantity)}</div>
    </div>
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        {searchParams.added && <div className="mb-4"><Alert type="success">Added to your bag.</Alert></div>}
        <div className="card p-5">
          <h1 className="text-2xl font-bold">Your bag</h1>
          {t.active.map((i) => <Row key={i.id} i={i} />)}
          {t.active.length === 0 && <p className="py-4 text-sm text-gray-500">Nothing in your bag yet — but you have items kept for later.</p>}
          <p className="mt-2 text-right text-lg">Subtotal ({t.count} items): <strong>{inr(t.subtotal)}</strong></p>
        </div>
        {saved.length > 0 && <div className="card mt-6 p-5"><h2 className="text-lg font-bold">Kept for later ({saved.length})</h2>{saved.map((i) => <Row key={i.id} i={i} saved />)}</div>}
      </div>
      <div className="card h-fit p-5">
        <p className="text-lg">Subtotal ({t.count} items): <strong>{inr(t.subtotal)}</strong></p>
        <p className="text-sm text-gray-600">Shipping: {t.shipping === 0 ? 'FREE' : inr(t.shipping)}</p>
        <p className="mt-2 text-xl font-bold">Total: {inr(t.subtotal + t.shipping)}</p>
        <Link href="/checkout" className={`btn-primary mt-4 w-full ${t.active.length === 0 ? 'pointer-events-none opacity-50' : ''}`}>Go to checkout</Link>
        <p className="mt-3 text-xs text-gray-500">Have a code? Add it at checkout.</p>
      </div>
    </div>
  );
}
