'use client';
import { useFormState } from 'react-dom';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { placeOrder, confirmPayment } from '@/app/actions/checkout';
import SubmitButton from '@/components/ui/SubmitButton';
import Alert from '@/components/ui/Alert';
import { inr } from '@/lib/format';

type Addr = { id: string; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string; isDefault: boolean };
export default function CheckoutForm({ addresses, subtotal, shipping, codAllowed, items }: { addresses: Addr[]; subtotal: number; shipping: number; codAllowed: boolean; items: { title: string; qty: number; line: number; img?: string | null }[] }) {
  const [state, action] = useFormState(placeOrder, null as any);
  const [err, setErr] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!state?.razorpay) return;
    const r = state.razorpay;
    if (!(window as any).Razorpay) { setErr('Payment gateway could not load. Your order is saved — open My orders to complete payment.'); return; }
    setPaying(true);
    const rzp = new (window as any).Razorpay({
      key: r.key, amount: r.amount, currency: 'INR', name: 'Kraftshed', description: 'Order payment', order_id: r.orderId, image: '/favicon.svg',
      prefill: { name: r.name, email: r.email, contact: r.phone }, theme: { color: '#C2593A' },
      handler: async (res: any) => {
        const out = await confirmPayment(r.ksOrderId, res.razorpay_order_id, res.razorpay_payment_id, res.razorpay_signature);
        if ('error' in out) { setErr(out.error!); setPaying(false); } else router.push(`/orders/${r.ksOrderId}?placed=1`);
      },
      modal: { ondismiss: () => { setPaying(false); setErr('Payment was cancelled. Your order is saved as pending — you can retry from My orders.'); } },
    });
    rzp.on('payment.failed', (e: any) => { setErr(e?.error?.description || 'Payment failed'); setPaying(false); });
    rzp.open();
  }, [state, router]);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="space-y-5">
        {(state?.error || err) && <Alert type="error">{state?.error || err}</Alert>}
        <section className="card p-5">
          <h2 className="text-lg font-bold">1. Where should we send it?</h2>
          {addresses.length === 0 && <p className="mt-2 text-sm text-gray-600">No saved addresses. <a href="/account/addresses/new?back=/checkout" className="font-semibold text-brand">Add an address</a> to continue.</p>}
          <div className="mt-3 space-y-2">
            {addresses.map((a) => (
              <label key={a.id} className="flex cursor-pointer gap-3 rounded-lg border p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-50">
                <input type="radio" name="addressId" value={a.id} defaultChecked={a.isDefault || addresses.length === 1} className="mt-1" />
                <div className="text-sm"><strong>{a.fullName}</strong> · {a.phone}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} – {a.pincode}</div>
              </label>
            ))}
          </div>
          {addresses.length > 0 && <a href="/account/addresses/new?back=/checkout" className="mt-3 inline-block text-sm font-semibold text-brand">+ Add a new address</a>}
        </section>
        <section className="card p-5">
          <h2 className="text-lg font-bold">2. How would you like to pay?</h2>
          <label className="mt-3 flex cursor-pointer gap-3 rounded-lg border p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-50"><input type="radio" name="method" value="razorpay" defaultChecked /><div className="text-sm"><strong>UPI / Cards / Net Banking / Wallets</strong><br /><span className="text-gray-600">Secure payment via Razorpay</span></div></label>
          <label className={`mt-2 flex gap-3 rounded-lg border p-3 ${codAllowed ? 'cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand-50' : 'opacity-50'}`}><input type="radio" name="method" value="cod" disabled={!codAllowed} /><div className="text-sm"><strong>Cash on delivery</strong><br /><span className="text-gray-600">{codAllowed ? 'Pay when your order arrives' : 'Not available for one or more items in your cart'}</span></div></label>
        </section>
        <section className="card p-5">
          <h2 className="text-lg font-bold">3. In your bag</h2>
          <ul className="mt-3 divide-y text-sm">{items.map((i, k) => <li key={k} className="flex items-center gap-3 py-2">{i.img && /* eslint-disable-next-line @next/next/no-img-element */ <img src={i.img} alt="" className="h-12 w-12 rounded object-cover" />}<span className="flex-1">{i.title} × {i.qty}</span><span className="font-semibold">{inr(i.line)}</span></li>)}</ul>
        </section>
      </div>
      <aside className="card h-fit p-5">
        <div className="flex gap-2"><input name="coupon" placeholder="Coupon code" className="input uppercase" /></div>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal:</dt><dd>{inr(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping:</dt><dd>{shipping === 0 ? 'FREE' : inr(shipping)}</dd></div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold text-red-700"><dt>Total:</dt><dd>{inr(subtotal + shipping)}</dd></div>
        </dl>
        <p className="mt-1 text-xs text-gray-500">Coupon discount, if any, is applied when you place the order.</p>
        <SubmitButton className="btn-primary mt-4 w-full" pendingText="Placing order…">{paying ? 'Complete payment…' : 'Place order'}</SubmitButton>
        <p className="mt-3 text-[11px] text-gray-500">By placing this order you agree to Kraftshed&apos;s terms of use and privacy policy.</p>
      </aside>
    </form>
  );
}
