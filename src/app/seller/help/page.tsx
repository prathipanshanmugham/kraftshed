import { requireSeller } from '@/lib/auth';
import SellerShell from '@/components/seller/SellerShell';
const faqs = [
  ['How do I get paid?', 'Your balance = sales − commission − refunds. Kraftshed pays out your available balance every week to the bank account in Settings, for items delivered and past their return window. Each payout appears in Payments with its UTR.'],
  ['What is the commission?', 'A flat referral fee on the item price (default 10%), which already includes payment-gateway charges. Shipping fees you charge are passed to you in full.'],
  ['How do I ship?', 'Pack the item, book any courier you prefer (India Post, DTDC, Delhivery, Shiprocket, etc.), then open Orders → "Ship with tracking" and enter the courier and tracking number. The buyer is notified automatically.'],
  ['What if I run out of stock?', 'Set stock to 0 in Inventory to prevent new orders. If an order already came in, cancel it from Orders → "Cancel (out of stock)". Frequent seller cancellations affect your performance score.'],
  ['How do returns work?', 'Buyers can request a return within your return window. Approve it, receive the item back, then click "Issue refund". The refund amount is deducted from your balance and the commission is reversed.'],
  ['Why is my listing pending?', 'New listings are checked by the Kraftshed team for quality and policy. This usually takes under 24 hours. Rejected listings show the reason — fix it and resubmit.'],
  ['Can I get help?', 'Email makers@kraftshed.com or WhatsApp the seller desk (number in your approval email). We respond within one working day.'],
];
export default async function Page() {
  const { seller } = await requireSeller();
  return <SellerShell storeName={seller.storeName} status={seller.status} title="Maker help"><div className="max-w-3xl space-y-3">{faqs.map(([q, a]) => <details key={q} className="card p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-sm text-gray-700">{a}</p></details>)}</div></SellerShell>;
}
