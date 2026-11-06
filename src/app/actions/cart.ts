'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function userOrRedirect(next: string) {
  const s = await getSession();
  if (!s) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return s;
}

export async function addToCart(form: FormData) {
  const productId = String(form.get('productId'));
  const variantId = form.get('variantId') ? String(form.get('variantId')) : null;
  const quantity = Math.max(1, Number(form.get('quantity') || 1));
  const buyNow = form.get('buyNow') === '1';
  const slug = String(form.get('slug') || '');
  const s = await userOrRedirect(`/p/${slug}`);
  const cart = await db.cart.upsert({ where: { userId: s.userId }, create: { userId: s.userId }, update: {} });
  const existing = await db.cartItem.findFirst({ where: { cartId: cart.id, productId, variantId } });
  if (existing) await db.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity, savedForLater: false } });
  else await db.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity } });
  revalidatePath('/cart');
  redirect(buyNow ? '/checkout' : '/cart?added=1');
}

export async function updateCartItem(form: FormData) {
  const s = await userOrRedirect('/cart');
  const id = String(form.get('id'));
  const action = String(form.get('action'));
  const item = await db.cartItem.findFirst({ where: { id, cart: { userId: s.userId } } });
  if (!item) return;
  if (action === 'remove') await db.cartItem.delete({ where: { id } });
  else if (action === 'save') await db.cartItem.update({ where: { id }, data: { savedForLater: true } });
  else if (action === 'move') await db.cartItem.update({ where: { id }, data: { savedForLater: false } });
  else if (action === 'qty') {
    const q = Number(form.get('quantity'));
    if (q <= 0) await db.cartItem.delete({ where: { id } });
    else await db.cartItem.update({ where: { id }, data: { quantity: q } });
  }
  revalidatePath('/cart');
}

export async function toggleWishlist(form: FormData) {
  const productId = String(form.get('productId'));
  const slug = String(form.get('slug') || '');
  const s = await userOrRedirect(`/p/${slug}`);
  const ex = await db.wishlistItem.findUnique({ where: { userId_productId: { userId: s.userId, productId } } });
  if (ex) await db.wishlistItem.delete({ where: { id: ex.id } });
  else await db.wishlistItem.create({ data: { userId: s.userId, productId } });
  revalidatePath(`/p/${slug}`);
  revalidatePath('/wishlist');
}
