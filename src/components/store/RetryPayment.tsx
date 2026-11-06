'use client';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { confirmPayment } from '@/app/actions/checkout';
export default function RetryPayment({ orderId, rpOrderId, amount, name, email, phone }: { orderId: string; rpOrderId: string; amount: number; name: string; email: string; phone: string }) {
  const router = useRouter();
  const [err, setErr] = useState('');
  const pay = () => {
    if (!(window as any).Razorpay) { setErr('Payment gateway could not load. Please check your connection and try again.'); return; }
    const rzp = new (window as any).Razorpay({ key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: Math.round(amount * 100), currency: 'INR', name: 'Kraftshed', order_id: rpOrderId, prefill: { name, email, contact: phone }, theme: { color: '#C2593A' },
      handler: async (res: any) => { const out = await confirmPayment(orderId, res.razorpay_order_id, res.razorpay_payment_id, res.razorpay_signature); if ('error' in out) setErr(out.error!); else router.refresh(); } });
    rzp.open();
  };
  return <div><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" /><button onClick={pay} className="btn-primary">Complete payment</button>{err && <p className="mt-2 text-sm text-red-600">{err}</p>}</div>;
}
