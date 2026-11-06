'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession, requireUser } from '@/lib/auth';
import { getCart, cartTotals, effectivePrice } from '@/lib/cart';
import { num, orderNumber } from '@/lib/format';
import { razorpay } from '@/lib/razorpay';
import { commissionPercent } from '@/lib/settings';

export async function saveAddress(form: FormData) {
  const s = await requireUser('/account/addresses');
  const data = {
    fullName: String(form.get('fullName')), phone: String(form.get('phone')), line1: String(form.get('line1')), line2: String(form.get('line2') || '') || null,
    landmark: String(form.get('landmark') || '') || null, city: String(form.get('city')), state: String(form.get('state')), pincode: String(form.get('pincode')),
  };
  const id = form.get('id') ? String(form.get('id')) : null;
  const count = await db.address.count({ where: { userId: s.userId } });
  if (id) await db.address.update({ where: { id, userId: s.userId }, data });
  else await db.address.create({ data: { ...data, userId: s.userId, isDefault: count === 0 } });
  revalidatePath('/account/addresses'); revalidatePath('/checkout');
  const back = String(form.get('back') || '/account/addresses');
  redirect(back);
}

export async function deleteAddress(form: FormData) {
  const s = await requireUser('/account/addresses');
  await db.address.delete({ where: { id: String(form.get('id')), userId: s.userId } }).catch(() => {});
  revalidatePath('/account/addresses');
}

export async function setDefaultAddress(form: FormData) {
  const s = await requireUser('/account/addresses');
  await db.address.updateMany({ where: { userId: s.userId }, data: { isDefault: false } });
  await db.address.update({ where: { id: String(form.get('id')), userId: s.userId }, data: { isDefault: true } });
  revalidatePath('/account/addresses');
}

export async function validateCoupon(code: string, subtotal: number, sellerIds: string[]) {
  const c = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!c || !c.isActive) return { error: 'Invalid coupon code' };
  const now = new Date();
  if (c.startsAt > now || (c.endsAt && c.endsAt < now)) return { error: 'This coupon has expired' };
  if (c.maxUses && c.usedCount >= c.maxUses) return { error: 'This coupon has been fully redeemed' };
  if (c.minOrder && subtotal < num(c.minOrder)) return { error: `Minimum order ${num(c.minOrder)} required` };
  if (c.sellerId && !sellerIds.includes(c.sellerId)) return { error: 'Coupon not valid for items in your cart' };
  const discount = c.percentOff ? Math.round((subtotal * c.percentOff) / 100) : Math.min(num(c.amountOff), subtotal);
  return { coupon: c, discount };
}

/** Creates a Kraftshed order + Razorpay order. Returns the data needed by the Razorpay checkout widget. */
export async function placeOrder(prev: any, form: FormData) {
  const s = await getSession();
  if (!s) return { error: 'Please sign in' };
  const addressId = String(form.get('addressId') || '');
  const couponCode = String(form.get('coupon') || '').trim();
  const method = String(form.get('method') || 'razorpay');
  if (!addressId) return { error: 'Please select a delivery address' };
  const address = await db.address.findFirst({ where: { id: addressId, userId: s.userId } });
  if (!address) return { error: 'Address not found' };
  const cart = await getCart(s.userId);
  const t = cartTotals(cart.items);
  if (t.active.length === 0) return { error: 'Your cart is empty' };
  for (const i of t.active) {
    const stock = i.variant ? i.variant.stock : i.product.stock;
    if (i.product.status !== 'ACTIVE') return { error: `"${i.product.title}" is no longer available` };
    if (stock < i.quantity) return { error: `Only ${stock} left of "${i.product.title}"` };
    if (method === 'cod' && !i.product.codAvailable) return { error: `Cash on delivery is not available for "${i.product.title}"` };
  }
  let discount = 0, couponId: string | undefined;
  if (couponCode) {
    const r = await validateCoupon(couponCode, t.subtotal, t.active.map((i) => i.product.sellerId));
    if ('error' in r) return { error: r.error };
    discount = r.discount; couponId = r.coupon.id;
  }
  const grand = t.subtotal + t.shipping - discount;

  const order = await db.$transaction(async (tx) => {
    const o = await tx.order.create({ data: { orderNumber: orderNumber(), userId: s.userId, addressId, subtotal: t.subtotal, shippingTotal: t.shipping, discountTotal: discount, grandTotal: grand, couponId, paymentMethod: method, status: method === 'cod' ? 'PAID' : 'PENDING_PAYMENT' } });
    for (const i of t.active) {
      const unit = effectivePrice(i.product, i.variant);
      const line = unit * i.quantity;
      const pct = await commissionPercent(i.product.seller.commissionPercent);
      const commission = Math.round(line * pct) / 100;
      await tx.orderItem.create({ data: { orderId: o.id, productId: i.productId, variantId: i.variantId, sellerId: i.product.sellerId, title: i.product.title + (i.variant ? ` (${i.variant.name})` : ''), imageUrl: i.product.images[0]?.url, unitPrice: unit, quantity: i.quantity, shippingFee: i.product.shippingFee, lineTotal: line, commission, sellerEarning: line - commission, status: method === 'cod' ? 'CONFIRMED' : 'PENDING' } });
      if (i.variantId) await tx.productVariant.update({ where: { id: i.variantId }, data: { stock: { decrement: i.quantity } } });
      await tx.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } });
    }
    if (couponId) await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
    return o;
  });

  if (method === 'cod') {
    await db.cartItem.deleteMany({ where: { cartId: cart.id, savedForLater: false } });
    await db.payment.create({ data: { orderId: order.id, provider: 'cod', amount: grand, status: 'AUTHORIZED' } });
    await finalizeOrder(order.id);
    redirect(`/orders/${order.id}?placed=1`);
  }

  try {
    const rp = await razorpay().orders.create({ amount: Math.round(grand * 100), currency: 'INR', receipt: order.orderNumber, notes: { kraftshed_order: order.id } });
    await db.payment.create({ data: { orderId: order.id, razorpayOrderId: rp.id, amount: grand, status: 'CREATED' } });
    return { razorpay: { key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, orderId: rp.id, amount: Math.round(grand * 100), name: s.name, email: s.email, phone: address.phone, ksOrderId: order.id } };
  } catch (e: any) {
    // Roll back: remove the order, restore stock and coupon usage so the buyer can simply retry.
    await db.$transaction(async (tx) => {
      for (const i of t.active) {
        await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
        if (i.variantId) await tx.productVariant.update({ where: { id: i.variantId }, data: { stock: { increment: i.quantity } } });
      }
      if (couponId) await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { decrement: 1 } } });
      await tx.order.delete({ where: { id: order.id } });
    }).catch(() => {});
    return { error: 'Could not reach the payment gateway (' + (e?.error?.description || e?.message || 'unknown error') + '). Nothing was charged — please try again.' };
  }
}

/** Called after Razorpay reports success (client callback or webhook). Idempotent. */
export async function finalizeOrder(orderId: string) {
  const o = await db.order.findUnique({ where: { id: orderId }, include: { items: true, user: true } });
  if (!o) return;
  if (o.status === 'PENDING_PAYMENT') await db.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
  await db.orderItem.updateMany({ where: { orderId, status: 'PENDING' }, data: { status: 'CONFIRMED' } });
  for (const it of o.items) {
    await db.product.update({ where: { id: it.productId }, data: { salesCount: { increment: it.quantity } } });
    const exists = await db.ledgerEntry.findFirst({ where: { reference: it.id, type: 'SALE' } });
    if (!exists) {
      await db.ledgerEntry.createMany({ data: [
        { sellerId: it.sellerId, type: 'SALE', amount: it.lineTotal, reference: it.id, note: `Order ${o.orderNumber}` },
        { sellerId: it.sellerId, type: 'COMMISSION', amount: -num(it.commission), reference: it.id, note: `Commission on ${o.orderNumber}` },
      ] });
      const sellerUser = await db.seller.findUnique({ where: { id: it.sellerId }, select: { userId: true } });
      if (sellerUser) await db.notification.create({ data: { userId: sellerUser.userId, title: 'New order received', body: `${it.title} × ${it.quantity} — order ${o.orderNumber}`, link: '/seller/orders' } });
    }
  }
  await db.notification.create({ data: { userId: o.userId, title: 'Order confirmed', body: `Your order ${o.orderNumber} is confirmed.`, link: `/orders/${o.id}` } });
}

export async function confirmPayment(ksOrderId: string, razorpayOrderId: string, paymentId: string, signature: string) {
  const { verifyPaymentSignature } = await import('@/lib/razorpay');
  const s = await getSession();
  if (!s) return { error: 'Not signed in' };
  const order = await db.order.findFirst({ where: { id: ksOrderId, userId: s.userId }, include: { payment: true } });
  if (!order || !order.payment || order.payment.razorpayOrderId !== razorpayOrderId) return { error: 'Order mismatch' };
  if (!verifyPaymentSignature(razorpayOrderId, paymentId, signature)) {
    await db.payment.update({ where: { id: order.payment.id }, data: { status: 'FAILED' } });
    return { error: 'Payment verification failed' };
  }
  await db.payment.update({ where: { id: order.payment.id }, data: { status: 'CAPTURED', razorpayPaymentId: paymentId, razorpaySignature: signature } });
  await finalizeOrder(order.id);
  await db.cartItem.deleteMany({ where: { cart: { userId: s.userId }, savedForLater: false } });
  return { ok: true };
}

export async function cancelItem(form: FormData) {
  const s = await requireUser('/orders');
  const id = String(form.get('id'));
  const item = await db.orderItem.findFirst({ where: { id, order: { userId: s.userId } }, include: { order: true } });
  if (!item || !['PENDING', 'CONFIRMED', 'PACKED'].includes(item.status)) return;
  await db.orderItem.update({ where: { id }, data: { status: 'CANCELLED', cancelReason: String(form.get('reason') || 'Cancelled by customer') } });
  await db.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
  if (item.variantId) await db.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
  await db.ledgerEntry.createMany({ data: [{ sellerId: item.sellerId, type: 'REFUND', amount: -num(item.lineTotal), reference: item.id, note: 'Cancelled by customer' }, { sellerId: item.sellerId, type: 'ADJUSTMENT', amount: num(item.commission), reference: item.id, note: 'Commission reversed' }] });
  revalidatePath(`/orders/${item.orderId}`);
}

export async function requestReturn(form: FormData) {
  const s = await requireUser('/orders');
  const id = String(form.get('id'));
  const item = await db.orderItem.findFirst({ where: { id, order: { userId: s.userId }, status: 'DELIVERED' }, include: { product: true } });
  if (!item || !item.product.returnable) return;
  if (item.deliveredAt && Date.now() - item.deliveredAt.getTime() > item.product.returnDays * 86400000) return;
  await db.returnRequest.create({ data: { orderItemId: id, reason: String(form.get('reason')), details: String(form.get('details') || '') || null, refundAmount: item.lineTotal } });
  await db.orderItem.update({ where: { id }, data: { status: 'RETURN_REQUESTED' } });
  revalidatePath(`/orders/${item.orderId}`);
}

export async function openDispute(form: FormData) {
  const s = await requireUser('/orders');
  const orderId = String(form.get('orderId'));
  const o = await db.order.findFirst({ where: { id: orderId, userId: s.userId } });
  if (!o) return;
  await db.dispute.create({ data: { orderId, userId: s.userId, subject: String(form.get('subject')), details: String(form.get('details')) } });
  revalidatePath(`/orders/${orderId}`);
}
