import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { dateFmt, inr } from '@/lib/format';
import StatusBadge from '@/components/ui/StatusBadge';
import Empty from '@/components/ui/Empty';
export const metadata = { title: 'My orders' };
export default async function Page() {
  const s = await requireUser('/orders');
  const orders = await db.order.findMany({ where: { userId: s.userId }, include: { items: true, payment: true }, orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1 className="text-2xl font-bold">My orders</h1>
      {orders.length === 0 && <div className="mt-6"><Empty title="You haven't placed any orders yet" cta="Start shopping" href="/" /></div>}
      <div className="mt-4 space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="card overflow-hidden">
            <div className="flex flex-wrap gap-6 bg-navy-50 px-5 py-3 text-xs text-gray-600">
              <div><div className="uppercase">Order placed</div><div className="text-ink">{dateFmt(o.createdAt)}</div></div>
              <div><div className="uppercase">Total</div><div className="text-ink">{inr(o.grandTotal)}</div></div>
              <div><div className="uppercase">Order #</div><div className="text-ink">{o.orderNumber}</div></div>
              <div className="ml-auto flex items-center gap-2"><StatusBadge s={o.status} /><Link href={`/orders/${o.id}`} className="font-semibold text-brand hover:underline">View order details</Link></div>
            </div>
            <div className="divide-y px-5">
              {o.items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 py-3">
                  {it.imageUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.imageUrl} alt="" className="h-16 w-16 rounded object-cover" /> : <div className="h-16 w-16 rounded bg-gray-100" />}
                  <div className="flex-1 text-sm"><p className="font-medium">{it.title}</p><p className="text-gray-500">Qty {it.quantity} · {inr(it.lineTotal)}</p></div>
                  <StatusBadge s={it.status} />
                </div>
              ))}
            </div>
            {o.status === 'PENDING_PAYMENT' && <div className="border-t px-5 py-3 text-sm text-amber-800">Payment not completed. <Link href={`/orders/${o.id}`} className="font-semibold underline">Retry payment</Link></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
