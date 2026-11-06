import Link from 'next/link';
export const metadata = { title: 'Help centre' };
const topics = [
  ['Where is my order?', 'Open My orders, pick the order and check the tracking number the seller added. Most handmade items ship within the seller\'s handling time (usually 1–3 days) and arrive in 3–7 days.', '/orders'],
  ['Returns & refunds', 'Returnable items can be sent back within the seller\'s return window (shown on the product page). Go to the order, click "Request a return", and the seller will approve and share pickup/return instructions. Refunds go back to the original payment method within 5–7 working days after the item is received.', '/orders'],
  ['Cancel an order', 'You can cancel any item until it is shipped. Open the order and click "Cancel item". Prepaid amounts are refunded automatically.', '/orders'],
  ['Payments', 'We accept UPI, credit/debit cards, net banking and wallets through Razorpay. Cash on delivery is available where the seller offers it. Kraftshed never stores your card details.', '/help'],
  ['Report a problem with a seller', 'Open the order and use "Raise an issue with Kraftshed". Our team reviews disputes within 2 working days.', '/orders'],
  ['Selling on Kraftshed', 'Register at Maker Studio, complete KYC (PAN, bank details, pickup address) and start listing. Approval usually takes 1–2 working days.', '/seller'],
];
export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Help centre</h1>
      <p className="mt-1 text-sm text-gray-600">What do you need a hand with?</p>
      <div className="mt-6 space-y-3">
        {topics.map(([t, b, h]) => <details key={t} className="card p-5"><summary className="cursor-pointer font-bold">{t}</summary><p className="mt-2 text-sm text-gray-700">{b}</p><Link href={h} className="mt-2 inline-block text-sm font-semibold text-brand">Go →</Link></details>)}
      </div>
      <div className="card mt-6 p-5 text-sm"><h2 className="font-bold">Still need help?</h2><p className="mt-1">Email <a className="text-brand underline" href="mailto:support@kraftshed.com">support@kraftshed.com</a> — we reply within 24 hours on working days.</p></div>
    </div>
  );
}
