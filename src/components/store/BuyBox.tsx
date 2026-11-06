'use client';
import { useState } from 'react';
import { addToCart } from '@/app/actions/cart';
import { inr } from '@/lib/format';

type Variant = { id: string; name: string; price: unknown; stock: number };
export default function BuyBox({ product, variants, price, mrp, deliveryBy, signedIn }: { product: { id: string; slug: string; stock: number; codAvailable: boolean; returnable: boolean; returnDays: number; shippingFee: unknown; freeShippingOver: unknown }; variants: Variant[]; price: number; mrp: number; deliveryBy: string; signedIn: boolean }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? '');
  const [qty, setQty] = useState(1);
  const v = variants.find((x) => x.id === variantId);
  const stock = v ? v.stock : product.stock;
  const p = v ? Number(v.price) : price;
  const ship = Number(product.shippingFee);
  const saving = mrp - p;
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-extrabold">{inr(p)}</span>
        {saving > 0 && <><span className="text-sm text-ink-soft line-through">{inr(mrp)}</span><span className="badge bg-forest-light text-forest-dark">You save {inr(saving)}</span></>}
      </div>
      <p className="mt-1 text-xs text-ink-soft">Inclusive of all taxes · {ship === 0 ? 'Free shipping' : `+ ${inr(ship)} shipping${product.freeShippingOver ? ` (free over ${inr(product.freeShippingOver as number)} from this maker)` : ''}`}</p>
      <p className={`mt-3 text-sm font-bold ${stock > 0 ? 'text-forest' : 'text-red-700'}`}>{stock > 0 ? (stock <= 5 ? `Only ${stock} left — made in small batches` : 'Ready to ship') : 'Sold out'}</p>
      <p className="text-sm text-ink-soft">Estimated arrival: <strong className="text-ink">{deliveryBy}</strong></p>

      {variants.length > 0 && (
        <div className="mt-4">
          <label className="label">Choose an option</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((x) => <button type="button" key={x.id} disabled={x.stock === 0} onClick={() => setVariantId(x.id)} className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold disabled:opacity-40 ${x.id === variantId ? 'border-forest bg-forest-50 text-forest' : 'border-sand-dark bg-white'}`}>{x.name} · {inr(x.price as number)}</button>)}
          </div>
        </div>
      )}
      <form action={addToCart} className="mt-5 flex flex-wrap items-center gap-3">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="slug" value={product.slug} />
        {variantId && <input type="hidden" name="variantId" value={variantId} />}
        <div className="flex items-center rounded-full border-2 border-sand-dark">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-lg leading-none">−</button>
          <input readOnly name="quantity" value={qty} className="w-8 bg-transparent text-center text-sm font-bold outline-none" />
          <button type="button" onClick={() => setQty(Math.min(stock, 10, qty + 1))} className="px-3 py-2 text-lg leading-none">+</button>
        </div>
        <button type="submit" name="buyNow" value="0" disabled={stock === 0} className="btn-primary flex-1 py-3">Add to bag</button>
        <button type="submit" name="buyNow" value="1" disabled={stock === 0} className="btn-outline flex-1 py-3">Checkout now</button>
      </form>
      <ul className="mt-5 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
        <li className="flex items-center gap-2"><Dot /> Secure payment, never stored by us</li>
        <li className="flex items-center gap-2"><Dot /> {product.returnable ? `Returns accepted within ${product.returnDays} days` : 'Final sale — not returnable'}</li>
        {product.codAvailable && <li className="flex items-center gap-2"><Dot /> Cash on delivery available</li>}
        {!signedIn && <li className="flex items-center gap-2"><Dot /> Sign in to save items and track orders</li>}
      </ul>
    </div>
  );
}
const Dot = () => <span className="h-1.5 w-1.5 rounded-full bg-clay" />;
