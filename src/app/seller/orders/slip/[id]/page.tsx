import { notFound } from 'next/navigation';
import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr, dateFmt } from '@/lib/format';
export default async function Page({ params }: { params: { id: string } }) {
  const { seller } = await requireSeller();
  const it = await db.orderItem.findFirst({ where: { id: params.id, sellerId: seller.id }, include: { order: { include: { address: true } } } });
  if (!it) notFound();
  return (
    <div className="mx-auto max-w-lg bg-white p-8 text-sm print:p-0">
      <div className="flex items-start justify-between border-b pb-4"><div><h1 className="text-xl font-bold">Kraftshed</h1><p className="text-gray-600">Packing slip</p></div><div className="text-right"><p className="font-semibold">{it.order.orderNumber}</p><p>{dateFmt(it.order.createdAt)}</p></div></div>
      <div className="grid grid-cols-2 gap-4 py-4"><div><p className="font-bold">Ship to</p><p>{it.order.address.fullName}</p><p>{it.order.address.line1}{it.order.address.line2 ? `, ${it.order.address.line2}` : ''}</p><p>{it.order.address.city}, {it.order.address.state} – {it.order.address.pincode}</p><p>📞 {it.order.address.phone}</p></div><div><p className="font-bold">From</p><p>{seller.storeName}</p><p>{seller.pickupAddress}</p><p>{seller.pickupCity}, {seller.pickupState} – {seller.pickupPincode}</p></div></div>
      <table className="w-full border-t"><thead><tr className="text-left"><th className="py-2">Item</th><th>Qty</th><th className="text-right">Amount</th></tr></thead><tbody><tr><td className="py-2">{it.title}</td><td>{it.quantity}</td><td className="text-right">{inr(it.lineTotal)}</td></tr></tbody></table>
      <p className="mt-4 border-t pt-3 text-xs text-gray-500">Payment: {it.order.paymentMethod === 'cod' ? `CASH ON DELIVERY — collect ${inr(it.order.grandTotal)}` : 'PREPAID'}. Thank you for shopping handmade on Kraftshed!</p>
      <script dangerouslySetInnerHTML={{ __html: 'window.print()' }} />
    </div>
  );
}
