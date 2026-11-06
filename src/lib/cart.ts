import { db } from './db';
import { num } from './format';

export async function getCart(userId: string) {
  const cart = await db.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: {
      items: {
        include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, seller: true, deal: true } }, variant: true },
        orderBy: { id: 'asc' },
      },
    },
  });
  return cart;
}

export function effectivePrice(p: { price: unknown; deal?: { dealPrice: unknown; startsAt: Date; endsAt: Date } | null }, variant?: { price: unknown } | null) {
  if (variant) return num(variant.price);
  const now = new Date();
  if (p.deal && p.deal.startsAt <= now && p.deal.endsAt >= now) return num(p.deal.dealPrice);
  return num(p.price);
}

export function cartTotals(items: Awaited<ReturnType<typeof getCart>>['items']) {
  const active = items.filter((i) => !i.savedForLater);
  let subtotal = 0, shipping = 0;
  const bySeller = new Map<string, number>();
  for (const i of active) {
    const price = effectivePrice(i.product, i.variant);
    const line = price * i.quantity;
    subtotal += line;
    bySeller.set(i.product.sellerId, (bySeller.get(i.product.sellerId) ?? 0) + line);
  }
  for (const i of active) {
    const sellerSub = bySeller.get(i.product.sellerId) ?? 0;
    const freeOver = i.product.freeShippingOver ? num(i.product.freeShippingOver) : null;
    if (freeOver != null && sellerSub >= freeOver) continue;
    shipping += num(i.product.shippingFee);
  }
  return { subtotal, shipping, count: active.reduce((a, i) => a + i.quantity, 0), active };
}
