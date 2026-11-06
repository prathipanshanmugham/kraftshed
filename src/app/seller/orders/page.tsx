import Link from 'next/link';
import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr, dateFmt } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { updateOrderItem } from '@/app/actions/seller';
const tabs = [['', 'All'], ['CONFIRMED', 'To pack'], ['PACKED', 'To ship'], ['SHIPPED', 'In transit'], ['DELIVERED', 'Delivered'], ['CANCELLED', 'Cancelled']];
export default async function Page({ searchParams }: { searchParams: { status?: string } }) {
  const { seller } = await requireSeller();
  const items = await db.orderItem.findMany({ where: { sellerId: seller.id, order: { status: { not: 'PENDING_PAYMENT' } }, ...(searchParams.status ? { status: searchParams.status as any } : {}) }, include: { order: { include: { address: true, user: { select: { name: true, email: true } } } } }, orderBy: { order: { createdAt: 'desc' } }, take: 100 });
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="Orders">
      <div className="mb-4 flex flex-wrap gap-2 text-sm">{tabs.map(([s, l]) => <Link key={s} href={`/seller/orders${s ? `?status=${s}` : ''}`} className={`rounded-full px-3 py-1 ${(searchParams.status ?? '') === s ? 'bg-navy text-white' : 'border bg-white'}`}>{l}</Link>)}</div>
      <div className="space-y-3">
        {items.length === 0 && <div className="card p-8 text-center text-gray-500">No orders in this view.</div>}
        {items.map((it) => (
          <div key={it.id} className="card grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="flex gap-3">
              {it.imageUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.imageUrl} alt="" className="h-16 w-16 rounded object-cover" /> : <div className="h-16 w-16 rounded bg-gray-100" />}
              <div className="text-sm"><p className="font-semibold">{it.title}</p><p>Qty {it.quantity} · {inr(it.lineTotal)} <span className="text-gray-500">(you earn {inr(it.sellerEarning)})</span></p><p className="text-xs text-gray-500">Order {it.order.orderNumber} · {dateFmt(it.order.createdAt)} · {it.order.paymentMethod === 'cod' ? 'COD' : 'Prepaid'}</p><div className="mt-1"><StatusBadge s={it.status} /></div></div>
            </div>
            <div className="text-sm"><p className="font-semibold">Ship to</p><p>{it.order.address.fullName}, {it.order.address.phone}</p><p className="text-gray-600">{it.order.address.line1}{it.order.address.line2 ? `, ${it.order.address.line2}` : ''}, {it.order.address.city}, {it.order.address.state} – {it.order.address.pincode}</p>{it.trackingNo && <p className="mt-1 text-xs">📦 {it.courier} {it.trackingNo}</p>}</div>
            <div className="flex flex-col gap-2 text-xs">
              {it.status === 'CONFIRMED' && <form action={updateOrderItem}><input type="hidden" name="id" value={it.id} /><button name="action" value="pack" className="btn-outline w-full">Mark packed</button></form>}
              {['CONFIRMED', 'PACKED'].includes(it.status) && (
                <details><summary className="btn-primary w-full cursor-pointer">Ship with tracking</summary>
                  <form action={updateOrderItem} className="mt-2 space-y-1"><input type="hidden" name="id" value={it.id} /><input type="hidden" name="action" value="ship" /><input name="courier" placeholder="Courier (e.g. India Post, DTDC)" className="input py-1" required /><input name="trackingNo" placeholder="Tracking number" className="input py-1" required /><input name="trackingUrl" placeholder="Tracking URL (optional)" className="input py-1" /><button className="btn-secondary w-full">Confirm shipment</button></form>
                </details>
              )}
              {it.status === 'SHIPPED' && <form action={updateOrderItem}><input type="hidden" name="id" value={it.id} /><button name="action" value="deliver" className="btn-outline w-full">Mark delivered</button></form>}
              {['CONFIRMED', 'PACKED'].includes(it.status) && <form action={updateOrderItem}><input type="hidden" name="id" value={it.id} /><input type="hidden" name="reason" value="Out of stock" /><button name="action" value="cancel" className="text-red-600 hover:underline">Cancel (out of stock)</button></form>}
              <a href={`/seller/orders/slip/${it.id}`} target="_blank" className="text-center text-brand hover:underline">Print packing slip</a>
            </div>
          </div>
        ))}
      </div>
    </SellerShell>
  );
}
