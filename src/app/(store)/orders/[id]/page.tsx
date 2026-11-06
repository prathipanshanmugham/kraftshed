import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { dateFmt, inr } from '@/lib/format';
import StatusBadge from '@/components/ui/StatusBadge';
import Alert from '@/components/ui/Alert';
import RetryPayment from '@/components/store/RetryPayment';
import { cancelItem, requestReturn, openDispute } from '@/app/actions/checkout';

export default async function Page({ params, searchParams }: { params: { id: string }; searchParams: { placed?: string } }) {
  const s = await requireUser(`/orders/${params.id}`);
  const o = await db.order.findFirst({ where: { id: params.id, userId: s.userId }, include: { items: { include: { product: true, seller: true, returnRequest: true, review: true } }, address: true, payment: true, disputes: true } });
  if (!o) notFound();
  const steps = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
  return (
    <div className="mx-auto max-w-4xl">
      {searchParams.placed && <div className="mb-4"><Alert type="success">🎉 Thank you! Your order <strong>{o.orderNumber}</strong> has been placed. {o.paymentMethod === 'cod' ? 'Pay on delivery.' : 'A confirmation has been sent to your email.'}</Alert></div>}
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-bold">Order details</h1><StatusBadge s={o.status} /></div>
      <p className="text-sm text-gray-600">Ordered on {dateFmt(o.createdAt)} · Order # {o.orderNumber}</p>
      {o.status === 'PENDING_PAYMENT' && o.payment?.razorpayOrderId && (
        <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 border border-amber-200 p-4"><p className="text-sm">Your payment was not completed. Complete it to confirm the order.</p><RetryPayment orderId={o.id} rpOrderId={o.payment.razorpayOrderId} amount={Number(o.grandTotal)} name={s.name} email={s.email} phone={o.address.phone} /></div>
      )}
      <div className="card mt-4 grid gap-4 p-5 text-sm sm:grid-cols-3">
        <div><h3 className="font-bold">Shipping address</h3><p>{o.address.fullName}<br />{o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ''}<br />{o.address.city}, {o.address.state} {o.address.pincode}<br />{o.address.phone}</p></div>
        <div><h3 className="font-bold">Payment</h3><p>{o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay'}{o.payment && <> · <StatusBadge s={o.payment.status} /></>}</p></div>
        <div><h3 className="font-bold">Order summary</h3><dl className="space-y-0.5"><div className="flex justify-between"><dt>Items</dt><dd>{inr(o.subtotal)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{inr(o.shippingTotal)}</dd></div>{Number(o.discountTotal) > 0 && <div className="flex justify-between text-green-700"><dt>Discount</dt><dd>-{inr(o.discountTotal)}</dd></div>}<div className="flex justify-between font-bold"><dt>Grand total</dt><dd>{inr(o.grandTotal)}</dd></div></dl></div>
      </div>
      <div className="mt-4 space-y-4">
        {o.items.map((it) => {
          const idx = steps.indexOf(it.status);
          const canCancel = ['PENDING', 'CONFIRMED', 'PACKED'].includes(it.status);
          const canReturn = it.status === 'DELIVERED' && it.product.returnable && it.deliveredAt && Date.now() - it.deliveredAt.getTime() <= it.product.returnDays * 86400000;
          return (
            <div key={it.id} className="card p-5">
              <div className="flex gap-4">
                {it.imageUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.imageUrl} alt="" className="h-20 w-20 rounded object-cover" /> : <div className="h-20 w-20 rounded bg-gray-100" />}
                <div className="flex-1 text-sm">
                  <Link href={`/p/${it.product.slug}`} className="font-medium hover:text-brand">{it.title}</Link>
                  <p className="text-gray-500">Qty {it.quantity} · {inr(it.lineTotal)} · Sold by <Link href={`/s/${it.seller.slug}`} className="text-brand">{it.seller.storeName}</Link></p>
                  <div className="mt-1"><StatusBadge s={it.status} /></div>
                  {it.trackingNo && <p className="mt-1">📦 {it.courier} · Tracking {it.trackingUrl ? <a className="text-brand underline" href={it.trackingUrl} target="_blank">{it.trackingNo}</a> : it.trackingNo}</p>}
                  {it.returnRequest && <p className="mt-1">Return: <StatusBadge s={it.returnRequest.status} /> {it.returnRequest.sellerNote && <span className="text-gray-600">— {it.returnRequest.sellerNote}</span>}</p>}
                </div>
              </div>
              {idx >= 0 && (
                <div className="mt-4 flex items-center">{steps.map((st, i) => <div key={st} className="flex flex-1 items-center"><div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${i <= idx ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div><span className={`ml-1 text-[11px] ${i <= idx ? 'text-green-700' : 'text-gray-400'}`}>{st.charAt(0) + st.slice(1).toLowerCase()}</span>{i < steps.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${i < idx ? 'bg-green-600' : 'bg-gray-200'}`} />}</div>)}</div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {canCancel && <form action={cancelItem}><input type="hidden" name="id" value={it.id} /><button className="btn-outline text-xs">Cancel item</button></form>}
                {canReturn && !it.returnRequest && (
                  <details className="w-full"><summary className="btn-outline cursor-pointer text-xs">Request a return</summary>
                    <form action={requestReturn} className="mt-2 space-y-2 rounded-lg bg-gray-50 p-3"><input type="hidden" name="id" value={it.id} /><select name="reason" className="input" required><option>Item damaged</option><option>Wrong item received</option><option>Not as described</option><option>Quality not as expected</option><option>Changed my mind</option></select><textarea name="details" className="input" placeholder="Tell us more (optional)" /><button className="btn-primary text-xs">Submit return request</button></form>
                  </details>
                )}
                {it.status === 'DELIVERED' && !it.review && <Link href={`/p/${it.product.slug}#reviews`} className="btn-outline text-xs">Write a review</Link>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="card mt-4 p-5">
        <h3 className="font-bold">Need help with this order?</h3>
        {o.disputes.map((d) => <p key={d.id} className="mt-2 text-sm"><StatusBadge s={d.status} /> {d.subject} {d.resolution && <span className="text-gray-600">— {d.resolution}</span>}</p>)}
        <details className="mt-2"><summary className="cursor-pointer text-sm font-semibold text-brand">Raise an issue with Kraftshed</summary>
          <form action={openDispute} className="mt-2 space-y-2"><input type="hidden" name="orderId" value={o.id} /><input name="subject" className="input" placeholder="Subject" required /><textarea name="details" className="input" rows={3} placeholder="Describe the issue" required /><button className="btn-secondary text-xs">Submit</button></form>
        </details>
        <p className="mt-3 text-xs text-gray-500">Or visit the <Link href="/help" className="underline">Help Centre</Link>.</p>
      </div>
    </div>
  );
}
