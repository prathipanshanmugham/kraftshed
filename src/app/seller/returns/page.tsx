import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr, dateFmt } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { handleReturn } from '@/app/actions/seller';
export default async function Page() {
  const { seller } = await requireSeller();
  const list = await db.returnRequest.findMany({ where: { orderItem: { sellerId: seller.id } }, include: { orderItem: { include: { order: { include: { address: true } } } } }, orderBy: { createdAt: 'desc' } });
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="Returns">
      <div className="space-y-3">
        {list.length === 0 && <div className="card p-8 text-center text-gray-500">No return requests.</div>}
        {list.map((r) => (
          <div key={r.id} className="card grid gap-4 p-4 md:grid-cols-[1fr_auto]">
            <div className="text-sm"><p className="font-semibold">{r.orderItem.title} <span className="text-gray-500">× {r.orderItem.quantity}</span></p><p className="text-xs text-gray-500">Order {r.orderItem.order.orderNumber} · requested {dateFmt(r.createdAt)} · refund {inr(r.refundAmount ?? r.orderItem.lineTotal)}</p><p className="mt-1"><strong>Reason:</strong> {r.reason}{r.details && <> — {r.details}</>}</p><p className="mt-1"><StatusBadge s={r.status} /> {r.sellerNote && <span className="text-gray-600">{r.sellerNote}</span>}</p><p className="mt-1 text-xs text-gray-500">Buyer: {r.orderItem.order.address.fullName}, {r.orderItem.order.address.city}</p></div>
            <form action={handleReturn} className="flex flex-col gap-1 text-xs"><input type="hidden" name="id" value={r.id} /><input name="note" placeholder="Note to buyer (optional)" className="input py-1" />
              {r.status === 'REQUESTED' && <><button name="action" value="approve" className="btn-primary">Approve return</button><button name="action" value="reject" className="btn-outline">Reject</button></>}
              {r.status === 'APPROVED' && <button name="action" value="received" className="btn-secondary">Item received</button>}
              {r.status === 'RECEIVED' && <button name="action" value="refund" className="btn-primary">Issue refund</button>}
            </form>
          </div>
        ))}
      </div>
    </SellerShell>
  );
}
