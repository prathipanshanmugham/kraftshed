import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { finalizeOrder } from '@/app/actions/checkout';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('x-razorpay-signature') || '';
  if (!verifyWebhookSignature(body, sig)) return NextResponse.json({ error: 'bad signature' }, { status: 400 });
  const evt = JSON.parse(body);
  const pay = evt?.payload?.payment?.entity;
  if (!pay?.order_id) return NextResponse.json({ ok: true });
  const payment = await db.payment.findUnique({ where: { razorpayOrderId: pay.order_id } });
  if (!payment) return NextResponse.json({ ok: true });
  if (evt.event === 'payment.captured' || evt.event === 'order.paid') {
    await db.payment.update({ where: { id: payment.id }, data: { status: 'CAPTURED', razorpayPaymentId: pay.id, method: pay.method, raw: evt } });
    await finalizeOrder(payment.orderId);
    await db.cartItem.deleteMany({ where: { cart: { user: { orders: { some: { id: payment.orderId } } } }, savedForLater: false } });
  } else if (evt.event === 'payment.failed') {
    await db.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', raw: evt } });
  }
  return NextResponse.json({ ok: true });
}
