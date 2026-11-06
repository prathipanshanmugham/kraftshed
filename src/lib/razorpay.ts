import Razorpay from 'razorpay';
import crypto from 'crypto';

export const razorpay = () =>
  new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_x', key_secret: process.env.RAZORPAY_KEY_SECRET || 'x' });

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${orderId}|${paymentId}`).digest('hex');
  return expected === signature;
}

export function verifyWebhookSignature(body: string, signature: string) {
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '').update(body).digest('hex');
  return expected === signature;
}
